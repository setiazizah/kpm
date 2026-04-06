"""
Repository layer — all database read/write operations.
Never import this from routers directly; use service layer as intermediary.
"""
from datetime import datetime, timezone
from typing import Optional

import structlog
from sqlalchemy import select, update, func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AudioManifest, BatchManifest, CrawlerConfig,
    ImageManifest, KeywordCorpus, PostComment,
    RawContent, TaxonomyCategory,
)
from app.schemas.crawler import (
    AudioManifestCreate, BatchManifestUpdate, ImageManifestCreate,
    PostCommentCreate, RawContentCreate,
)

logger = structlog.get_logger(__name__)


# ── Keyword ───────────────────────────────────────────────────────────────────

async def get_active_keywords(
    db: AsyncSession,
    platform: Optional[str] = None,
) -> list[KeywordCorpus]:
    """Return all active keywords ordered by crawl priority (tinggi first)."""
    priority_order = {"tinggi": 0, "sedang": 1, "rendah": 2}
    stmt = select(KeywordCorpus).where(KeywordCorpus.is_active == True)
    result = await db.execute(stmt)
    keywords = result.scalars().all()
    return sorted(keywords, key=lambda k: priority_order.get(k.crawl_priority, 99))


async def get_crawler_config(db: AsyncSession, platform: str) -> Optional[CrawlerConfig]:
    """Return crawler configuration for a given platform."""
    stmt = select(CrawlerConfig).where(
        CrawlerConfig.platform == platform,
        CrawlerConfig.is_active == True,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# ── Batch Manifest ────────────────────────────────────────────────────────────

async def create_batch(db: AsyncSession, batch_id: str) -> BatchManifest:
    """Insert a new batch row with RUNNING status."""
    batch = BatchManifest(
        batch_id=batch_id,
        batch_type="crawl_run",
        start_time=datetime.now(tz=timezone.utc),
        status="RUNNING",
    )
    db.add(batch)
    await db.flush()
    logger.info("batch_created", batch_id=batch_id)
    return batch


async def complete_batch(
    db: AsyncSession,
    batch_id: str,
    update_data: BatchManifestUpdate,
) -> None:
    """Mark batch as complete and write aggregate metrics."""
    stmt = (
        update(BatchManifest)
        .where(BatchManifest.batch_id == batch_id)
        .values(
            end_time=datetime.now(tz=timezone.utc),
            raw_data_count=update_data.raw_data_count,
            comment_count=update_data.comment_count,
            records_error=update_data.records_error,
            success_rate_pct=update_data.success_rate_pct,
            status=update_data.status,
        )
    )
    await db.execute(stmt)
    logger.info("batch_completed", batch_id=batch_id, status=update_data.status)


# ── Raw Content ───────────────────────────────────────────────────────────────

async def upsert_raw_content(
    db: AsyncSession,
    items: list[RawContentCreate],
) -> int:
    """
    Bulk-upsert raw content rows (ON CONFLICT DO NOTHING on content_id).
    Returns number of rows actually inserted.
    """
    if not items:
        return 0

    stmt = pg_insert(RawContent).values([i.model_dump() for i in items])
    stmt = stmt.on_conflict_do_nothing(index_elements=["content_id"])
    result = await db.execute(stmt)
    inserted = result.rowcount
    logger.debug("raw_content_upserted", count=inserted)
    return inserted


# ── Post Comments ─────────────────────────────────────────────────────────────

async def bulk_insert_comments(
    db: AsyncSession,
    comments: list[PostCommentCreate],
) -> int:
    """Bulk insert post comments (ON CONFLICT DO NOTHING)."""
    if not comments:
        return 0

    stmt = pg_insert(PostComment).values([c.model_dump() for c in comments])
    stmt = stmt.on_conflict_do_nothing(index_elements=["comment_id"])
    result = await db.execute(stmt)
    return result.rowcount


# ── Image Manifest ────────────────────────────────────────────────────────────

async def insert_image_manifest(
    db: AsyncSession,
    images: list[ImageManifestCreate],
) -> int:
    """Insert image manifest rows."""
    if not images:
        return 0

    stmt = pg_insert(ImageManifest).values([i.model_dump() for i in images])
    stmt = stmt.on_conflict_do_nothing(index_elements=["image_id"])
    result = await db.execute(stmt)
    return result.rowcount


# ── Audio Manifest ────────────────────────────────────────────────────────────

async def insert_audio_manifest(
    db: AsyncSession,
    audio_items: list[AudioManifestCreate],
) -> int:
    """Insert audio manifest rows."""
    if not audio_items:
        return 0

    stmt = pg_insert(AudioManifest).values([a.model_dump() for a in audio_items])
    stmt = stmt.on_conflict_do_nothing(index_elements=["audio_id"])
    result = await db.execute(stmt)
    return result.rowcount


# ── Stats ─────────────────────────────────────────────────────────────────────

async def get_batch_stats(db: AsyncSession, batch_id: str) -> dict:
    """Return aggregate stats for a batch (used to complete batch_manifest)."""
    raw_count = await db.scalar(
        select(func.count()).where(RawContent.batch_id == batch_id)
    )
    error_count = await db.scalar(
        select(func.count()).where(
            RawContent.batch_id == batch_id,
            RawContent.success == False,
        )
    )
    comment_count = await db.scalar(
        select(func.count()).where(PostComment.batch_id == batch_id)
    )
    return {
        "raw_data_count": raw_count or 0,
        "records_error": error_count or 0,
        "comment_count": comment_count or 0,
    }
