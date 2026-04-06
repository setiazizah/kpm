"""
CrawlService — orchestrates all platform crawlers for a single batch run.
Reads config & keywords from DB, executes crawlers, writes results progressively.
"""
from datetime import datetime, timezone
from typing import Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.crawlers.news import NewsCrawler
from app.crawlers.tiktok import TikTokCrawler
from app.crawlers.youtube_shorts import YouTubeShortsCrawler
from app.db import repository as repo
from app.db.session import get_db_context
from app.schemas.crawler import (
    AudioManifestCreate, BatchManifestUpdate, ImageManifestCreate
)

logger = structlog.get_logger(__name__)

# Ordered list of (platform_key, CrawlerClass, is_multi_keyword)
PLATFORM_REGISTRY = [
    ("media_online",    NewsCrawler,          False),
    ("tiktok",          TikTokCrawler,        True),
    ("youtube_shorts",  YouTubeShortsCrawler, True),
]

# Platforms that support comment crawling
COMMENT_PLATFORMS = {"tiktok", "youtube_shorts"}

def make_batch_id() -> str:
    """Generate a batch_id in the format: batch-YYYYMMDD-HHhMM (UTC+7)."""
    import pytz
    tz = pytz.timezone("Asia/Jakarta")
    now = datetime.now(tz=tz)
    return now.strftime("batch-%Y%m%d-%Hh%M")

async def run_batch(
    target_platform: Optional[str] = None,
    dry_run: bool = False,
) -> dict:
    """
    Execute a full crawl batch.
    """
    batch_id = make_batch_id()
    log = logger.bind(batch_id=batch_id, dry_run=dry_run)
    log.info("batch_started")

    # ── Bootstrap batch row ──
    if not dry_run:
        async with get_db_context() as db:
            await repo.create_batch(db, batch_id)

    # ── Load active keywords ──
    async with get_db_context() as db:
        keywords = await repo.get_active_keywords(db)
    log.info("keywords_loaded", count=len(keywords))

    if not keywords:
        log.warning("no_active_keywords")
        return {"batch_id": batch_id, "status": "NO_KEYWORDS"}

    # ── Execute each platform ──
    total_raw = 0
    total_comments = 0
    total_errors = 0

    for platform_key, CrawlerClass, is_multi in PLATFORM_REGISTRY:
        if target_platform and platform_key != target_platform:
            continue

        async with get_db_context() as db:
            crawler_cfg = await repo.get_crawler_config(db, platform_key)
        
        if not crawler_cfg or not crawler_cfg.is_active:
            log.info("platform_skipped", platform=platform_key)
            continue

        crawler = CrawlerClass(crawler_cfg)
        
        # Determine all applicable keywords for this platform
        active_texts = [kw.keyword_text for kw in keywords]

        log.info("platform_crawling", platform=platform_key, keywords=len(active_texts), mode="multi" if is_multi else "single")

        if is_multi:
            # ── Multi-keyword mode (Apify) ──
            try:
                items = await crawler.crawl(active_texts, batch_id)
                
                # Tag items with their respective keywords (Apify returns them mixed)
                # Note: This is an approximation since Apify items don't always track search query
                # unless we specifically configure the Actor to do so.
                # For now, we'll label them with the first matching keyword from our set as a fallback.
                for item in items:
                    matched = [k for k in active_texts if k.lower() in (item.raw_text or "").lower()]
                    item.keyword_refs = matched if matched else active_texts[:1]

                if not dry_run:
                    async with get_db_context() as session:
                        inserted_raw = await repo.upsert_raw_content(session, items)
                        total_raw += inserted_raw
                        log.info("raw_content_inserted", count=inserted_raw, platform=platform_key)
                        
                        # ── Resources & Manifests ──
                        for item in items:
                            m_urls = item.media_urls or {}
                            # Image Manifest
                            if "thumbnail" in m_urls and "bronze/images" in str(m_urls["thumbnail"]):
                                storage_p = m_urls["thumbnail"]
                                img_id = storage_p.split("/")[-1].split(".")[0]
                                img_count = await repo.insert_image_manifest(session, [ImageManifestCreate(
                                    image_id=img_id,
                                    content_id_ref=item.content_id,
                                    storage_path=storage_p,
                                    file_format="jpg",
                                    crawl_timestamp=item.crawl_timestamp
                                )])
                                if img_count > 0:
                                    log.info("manifest_image_ok", content_id=item.content_id, path=storage_p)
                                else:
                                    log.debug("manifest_image_skipped_or_exists", content_id=item.content_id)
                            else:
                                if "thumbnail" in m_urls:
                                    log.debug("manifest_image_path_invalid", path=m_urls.get("thumbnail"))
                            
                            # Audio Manifest
                            if "audio" in m_urls and "bronze/audio" in str(m_urls["audio"]):
                                storage_p = m_urls["audio"]
                                aud_id = storage_p.split("/")[-1].split(".")[0]
                                aud_count = await repo.insert_audio_manifest(session, [AudioManifestCreate(
                                    audio_id=aud_id,
                                    content_id_ref=item.content_id,
                                    storage_path=storage_p,
                                    file_format="mp3",
                                    crawl_timestamp=item.crawl_timestamp
                                )])
                                if aud_count > 0:
                                    log.info("manifest_audio_ok", content_id=item.content_id, path=storage_p)
                                else:
                                    log.debug("manifest_audio_skipped_or_exists", content_id=item.content_id)
                            else:
                                if "audio" in m_urls and m_urls["audio"]:
                                    log.debug("manifest_audio_path_invalid", path=m_urls["audio"])

                        # ── Comments ──
                        if platform_key in COMMENT_PLATFORMS:
                            for item in items:
                                if not item.success: continue
                                comments = await crawler.crawl_comments(item.content_id, item.url_source, batch_id)
                                if comments:
                                    inserted_c = await repo.bulk_insert_comments(session, comments)
                                    total_comments += inserted_c
                                    log.info("comments_inserted", post_id=item.content_id, count=inserted_c)
                
                total_errors += sum(1 for i in items if not i.success)

            except Exception as exc:
                log.error("platform_crawl_failed", platform=platform_key, error=str(exc))
                total_errors += 1
        
        else:
            # ── Single-keyword mode (Crawl4AI / News) ──
            for kw in keywords:
                items = []
                keyword_errors = 0

                try:
                    items = await crawler.crawl(kw.keyword_text, batch_id)

                    if not dry_run:
                        async with get_db_context() as session:
                            inserted_raw = await repo.upsert_raw_content(session, items)
                            total_raw += inserted_raw
                            
                            # ── Resources & Manifests ──
                            for item in items:
                                m_urls = item.media_urls or {}

                                # Image Manifest
                                if "thumbnail" in m_urls and "bronze/images" in str(m_urls["thumbnail"]):
                                    storage_p = m_urls["thumbnail"]
                                    img_id = storage_p.split("/")[-1].split(".")[0]
                                    await repo.insert_image_manifest(session, [ImageManifestCreate(
                                        image_id=img_id,
                                        content_id_ref=item.content_id,
                                        storage_path=storage_p,
                                        file_format="jpg",
                                        crawl_timestamp=item.crawl_timestamp
                                    )])

                            # ── Comments ──
                            if platform_key in COMMENT_PLATFORMS:
                                for item in items:
                                    if not item.success:
                                        continue
                                    comments = await crawler.crawl_comments(
                                        item.content_id,
                                        item.url_source,
                                        batch_id
                                    )
                                    if comments:
                                        inserted_c = await repo.bulk_insert_comments(session, comments)
                                        total_comments += inserted_c

                    keyword_errors = sum(1 for i in items if not i.success)
                    total_errors += keyword_errors

                except Exception as exc:
                    keyword_errors = 1
                    total_errors += 1
                    log.error(
                        "keyword_crawl_failed",
                        platform=platform_key,
                        keyword=kw.keyword_text,
                        error=str(exc),
                    )

                if not dry_run:
                    log.debug(
                        "keyword_done",
                        platform=platform_key,
                        keyword=kw.keyword_text,
                        raw=len(items),
                        errors=keyword_errors,
                    )

    # ── Complete batch manifest ──
    success_rate = (
        round((total_raw - total_errors) / total_raw * 100, 2)
        if total_raw > 0 else 0.0
    )
    batch_status = "SUCCESS" if total_errors == 0 else "FAILED" if total_raw == 0 else "SUCCESS"

    if not dry_run:
        async with get_db_context() as db:
            await repo.complete_batch(
                db,
                batch_id,
                BatchManifestUpdate(
                    raw_data_count=total_raw,
                    comment_count=total_comments,
                    records_error=total_errors,
                    success_rate_pct=success_rate,
                    status=batch_status,
                ),
            )

        summary = {
            "batch_id": batch_id,
            "status": batch_status,
            "raw_data_count": total_raw,
            "comment_count": total_comments,
            "records_error": total_errors,
            "success_rate_pct": success_rate,
            "dry_run": dry_run,
        }
        log.info("batch_completed", **summary)
        return summary
