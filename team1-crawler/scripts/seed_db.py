"""
Seed script: inserts default taxonomy categories and crawler configs.
Run once after `alembic upgrade head`.

Usage:
    python -m scripts.seed_db
"""
import asyncio
from datetime import datetime, timezone

import structlog

from app.core.logging import configure_logging
from app.db.models import CrawlerConfig, TaxonomyCategory
from app.db.session import get_db_context

configure_logging()
logger = structlog.get_logger(__name__)

TAXONOMY = [
    (
        "Integritas & Penegakan Hukum",
        "Isu terkait korupsi, penegakan hukum, keadilan, integritas pejabat publik, dan kasus hukum.",
        "cat-001",
    ),
    (
        "Kebijakan & Layanan Publik",
        "Isu terkait regulasi pemerintah, kebijakan publik, pelayanan birokrasi, dan perizinan.",
        "cat-002",
    ),
    (
        "Kinerja Pemerintah",
        "Isu terkait efektivitas program pemerintah, realisasi anggaran, dan akuntabilitas pejabat.",
        "cat-003",
    ),
    (
        "Keamanan Siber & Ketertiban Digital",
        "Isu terkait kejahatan siber, kebocoran data, hoaks, dan ketertiban di ruang digital.",
        "cat-004",
    ),
    (
        "Kesejahteraan & Bantuan Sosial",
        "Isu terkait kemiskinan, bantuan sosial, subsidi, perlindungan sosial, dan ketimpangan.",
        "cat-005",
    ),
    (
        "Infrastruktur & Layanan Transportasi",
        "Isu terkait pembangunan infrastruktur, jalan, transportasi publik, dan konektivitas wilayah.",
        "cat-006",
    ),
    (
        "Ekonomi Digital",
        "Isu terkait e-commerce, startup, fintech, ekonomi kreatif, dan transformasi digital bisnis.",
        "cat-007",
    ),
    (
        "Ketenagakerjaan",
        "Isu terkait lapangan kerja, PHK, upah minimum, perburuhan, dan kondisi tenaga kerja.",
        "cat-008",
    ),
    (
        "Layanan Kesehatan",
        "Isu terkait fasilitas kesehatan, BPJS, wabah penyakit, obat, dan kebijakan kesehatan.",
        "cat-009",
    ),
    (
        "Pendidikan dan Pengembangan SDM",
        "Isu terkait kualitas pendidikan, kurikulum, guru, beasiswa, dan pengembangan SDM.",
        "cat-010",
    ),
    (
        "Krisis Sosial & Kebencanaan",
        "Isu terkait bencana alam, konflik sosial, pengungsian, kedaruratan, dan krisis kemanusiaan.",
        "cat-011",
    ),
]

CRAWLER_CONFIGS = [
    {
        "crawler_id":              "crw-media-online",
        "crawler_name":            "Media Online Crawler",
        "platform":                "media_online",
        "max_results_per_keyword": 200,
        "max_comments_per_post":   0,
        "min_comment_likes":       0,
        "request_delay_sec":       3,
        "daily_target":            2000,
        "schedule_cron":           "0 */6 * * *",
        "is_active":               True,
    },
    {
        "crawler_id":              "crw-tiktok",
        "crawler_name":            "TikTok Crawler",
        "platform":                "tiktok",
        "max_results_per_keyword": 100,
        "max_comments_per_post":   50,
        "min_comment_likes":       10,
        "request_delay_sec":       12,
        "daily_target":            1500,
        "schedule_cron":           "0 2 * * *",
        "is_active":               True,
    },
    {
        "crawler_id":              "crw-instagram",
        "crawler_name":            "Instagram Crawler",
        "platform":                "instagram",
        "max_results_per_keyword": 80,
        "max_comments_per_post":   50,
        "min_comment_likes":       10,
        "request_delay_sec":       10,
        "daily_target":            800,
        "schedule_cron":           "0 2 * * *",
        "is_active":               True,
    },
    {
        "crawler_id":              "crw-youtube-shorts",
        "crawler_name":            "YouTube Shorts Crawler",
        "platform":                "youtube_shorts",
        "max_results_per_keyword": 60,
        "max_comments_per_post":   0,
        "min_comment_likes":       0,
        "request_delay_sec":       5,
        "daily_target":            500,
        "schedule_cron":           "0 2 * * *",
        "is_active":               True,
    },
]


async def seed():
    async with get_db_context() as db:
        # Taxonomy
        for name, desc, cat_id in TAXONOMY:
            existing = await db.get(TaxonomyCategory, cat_id)
            if not existing:
                db.add(TaxonomyCategory(
                    category_id=cat_id,
                    category_name=name,
                    description=desc,
                    approved_by="Tim1+Tim2+Tim3",
                    approved_at=datetime.now(tz=timezone.utc),
                ))
        logger.info("taxonomy_seeded", count=len(TAXONOMY))

        # Crawler configs
        for cfg in CRAWLER_CONFIGS:
            existing = await db.get(CrawlerConfig, cfg["crawler_id"])
            if not existing:
                db.add(CrawlerConfig(**cfg))
        logger.info("crawler_configs_seeded", count=len(CRAWLER_CONFIGS))

        # Sample Keywords
        KEYWORDS = [
            ("korupsi timah", "Integritas & Penegakan Hukum"),
            ("subsidi bbm", "Kesejahteraan & Bantuan Sosial"),
            ("kereta cepat", "Infrastruktur & Layanan Transportasi"),
            ("startup indonesia", "Ekonomi Digital"),
            ("bpjs kesehatan", "Layanan Kesehatan"),
            ("beasiswa lpdp", "Pendidikan dan Pengembangan SDM"),
        ]
        
        from app.db.models import KeywordCorpus
        from sqlalchemy import select

        for text, cat in KEYWORDS:
            stmt = select(KeywordCorpus).where(KeywordCorpus.keyword_text == text)
            res = await db.execute(stmt)
            if not res.scalar_one_or_none():
                db.add(KeywordCorpus(
                    keyword_text=text,
                    source="kpm_internal",
                    taxonomy_category=cat,
                    is_active=True,
                    crawl_priority="sedang",
                    activated_by="seed_script",
                    activated_at=datetime.now(tz=timezone.utc)
                ))
        logger.info("keywords_seeded", count=len(KEYWORDS))

    logger.info("seed_complete")


if __name__ == "__main__":
    asyncio.run(seed())
