"""
SQLAlchemy ORM models — maps 1:1 to the Bronze / Silver / Control datalake schema.
All timestamps stored in UTC; application layer converts to WIB (UTC+7) on display.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, Float, ForeignKey,
    Integer, Numeric, SmallInteger, String, Text, func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


# ── ENUMS ─────────────────────────────────────────────────────────────────────

TAXONOMY_CATEGORY_ENUM = Enum(
    "Integritas & Penegakan Hukum",
    "Kebijakan & Layanan Publik",
    "Kinerja Pemerintah",
    "Keamanan Siber & Ketertiban Digital",
    "Kesejahteraan & Bantuan Sosial",
    "Infrastruktur & Layanan Transportasi",
    "Ekonomi Digital",
    "Ketenagakerjaan",
    "Layanan Kesehatan",
    "Pendidikan dan Pengembangan SDM",
    "Krisis Sosial & Kebencanaan",
    name="taxonomy_category_enum",
)
PLATFORM_ENUM = Enum(
    "tiktok", "youtube_shorts", "media_online", "google_trends",
    name="platform_enum",
)
CONTENT_TYPE_ENUM = Enum(
    "post", "video", "article", "carousel", "trend",
    name="content_type_enum",
)
CRAWL_PRIORITY_ENUM = Enum(
    "tinggi", "sedang", "rendah",
    name="crawl_priority_enum",
)
BATCH_TYPE_ENUM = Enum(
    "model1_batch", "gtrends", "qdrant_sync", "crawl_run",
    name="batch_type_enum",
)
BATCH_STATUS_ENUM = Enum(
    "SUCCESS", "RUNNING", "FAILED",
    name="batch_status_enum",
)
VOLUME_SOURCE_ENUM = Enum(
    "keyword_planner", "pytrends_estimate", "trends24_tweets",
    name="volume_source_enum",
)
LABEL_TYPE_ENUM = Enum(
    "auto", "manual",
    name="label_type_enum",
)
SENTIMENT_ENUM = Enum(
    "positif", "negatif", "netral",
    name="sentiment_enum",
)
SOURCE_TYPE_ENUM = Enum(
    "post", "comment",
    name="source_type_enum",
)
KEYWORD_SOURCE_ENUM = Enum(
    "trends24", "google_trends", "kpm_internal",
    name="keyword_source_enum",
)
LOG_REASON_ENUM = Enum(
    "auto_threshold", "manual_override", "new_keyword",
    name="log_reason_enum",
)


# ── BRONZE LAYER ──────────────────────────────────────────────────────────────

class RawContent(Base):
    """Bronze: all raw crawled content — text, media refs, platform metadata."""
    __tablename__ = "raw_content"

    content_id          = Column(String(64), primary_key=True, default=lambda: f"cnt-{uuid.uuid4().hex[:12]}")
    platform            = Column(PLATFORM_ENUM, nullable=False, index=True)
    content_type        = Column(CONTENT_TYPE_ENUM, nullable=False)
    raw_text            = Column(Text)
    media_urls          = Column(JSONB, default=dict)
    url_source          = Column(Text, nullable=False)
    author_id           = Column(String(64))
    keyword_refs        = Column(ARRAY(String), default=list)
    taxonomy_category   = Column(TAXONOMY_CATEGORY_ENUM, nullable=True)
    taxonomy_confidence = Column(Float, nullable=True)
    extra_metadata      = Column(JSONB, default=dict)
    publish_date        = Column(Date, nullable=True)
    crawl_timestamp     = Column(DateTime(timezone=True), nullable=False, default=func.now())
    success             = Column(Boolean, nullable=False, default=True)
    batch_id            = Column(String(64), ForeignKey("batch_manifest.batch_id"), nullable=False, index=True)

    comments = relationship("PostComment", back_populates="post", lazy="select")
    images   = relationship("ImageManifest", back_populates="content", lazy="select")
    audio    = relationship("AudioManifest", back_populates="content", uselist=False, lazy="select")


class PostComment(Base):
    """Bronze: top-50 comments per post, sorted by likes, min 10 likes."""
    __tablename__ = "post_comment"

    comment_id        = Column(String(64), primary_key=True, default=lambda: f"cmt-{uuid.uuid4().hex[:12]}")
    post_content_id   = Column(String(64), ForeignKey("raw_content.content_id"), nullable=False, index=True)
    platform          = Column(PLATFORM_ENUM, nullable=False)
    comment_text      = Column(Text, nullable=False)
    author_id         = Column(String(64))
    likes_count       = Column(Integer, default=0)
    is_reply          = Column(Boolean, default=False)
    parent_comment_id = Column(String(64), nullable=True)
    created_at        = Column(DateTime(timezone=True), nullable=True)
    crawl_timestamp   = Column(DateTime(timezone=True), nullable=False, default=func.now())
    batch_id          = Column(String(64), ForeignKey("batch_manifest.batch_id"), nullable=False, index=True)

    post = relationship("RawContent", back_populates="comments")


class ImageManifest(Base):
    """Bronze: Image metadata — from media_online, tiktok, and youtube_shorts content."""
    __tablename__ = "image_manifest"

    image_id           = Column(String(64), primary_key=True, default=lambda: f"img-{uuid.uuid4().hex[:12]}")
    content_id_ref     = Column(String(64), ForeignKey("raw_content.content_id"), nullable=False, index=True)
    storage_path       = Column(Text)
    file_format        = Column(Enum("jpg", "png", "webp", name="image_format_enum"))
    width_px           = Column(Integer)
    height_px          = Column(Integer)
    file_size_kb       = Column(Float)
    passed_tech_filter = Column(Boolean, default=False)
    is_informative     = Column(Boolean, nullable=True)
    caption_result     = Column(Text, nullable=True)
    crawl_timestamp    = Column(DateTime(timezone=True), nullable=False, default=func.now())

    content = relationship("RawContent", back_populates="images")


class AudioManifest(Base):
    """Bronze: Audio metadata — from tiktok original sounds and speech."""
    __tablename__ = "audio_manifest"

    audio_id           = Column(String(64), primary_key=True, default=lambda: f"aud-{uuid.uuid4().hex[:12]}")
    content_id_ref     = Column(String(64), ForeignKey("raw_content.content_id"), nullable=False, index=True)
    storage_path       = Column(Text)
    file_format        = Column(Enum("mp3", "mp4", "wav", name="audio_format_enum"))
    duration_sec       = Column(Float)
    is_original_sound  = Column(Boolean, default=True)
    has_speech         = Column(Boolean, default=True)
    passed_tech_filter = Column(Boolean, default=False)
    is_informative     = Column(Boolean, nullable=True)
    transcript_result  = Column(Text, nullable=True)
    crawl_timestamp    = Column(DateTime(timezone=True), nullable=False, default=func.now())

    content = relationship("RawContent", back_populates="audio")


# ── SILVER LAYER ──────────────────────────────────────────────────────────────

class TaxonomyCategory(Base):
    """
    Silver: master issue categories — agreed by all teams.
    category_name uses the same TAXONOMY_CATEGORY_ENUM values for consistency.
    """
    __tablename__ = "taxonomy_category"

    category_id   = Column(String(16), primary_key=True)
    category_name = Column(TAXONOMY_CATEGORY_ENUM, unique=True, nullable=False)
    description   = Column(Text)
    approved_by   = Column(String(100))
    approved_at   = Column(DateTime(timezone=True), nullable=True)


class KeywordCorpus(Base):
    """Silver: active keyword list — consumed by all crawlers."""
    __tablename__ = "keyword_corpus"

    keyword_id          = Column(String(64), primary_key=True, default=lambda: f"kw-{uuid.uuid4().hex[:12]}")
    keyword_text        = Column(String(500), nullable=False)
    source              = Column(KEYWORD_SOURCE_ENUM, nullable=False)
    taxonomy_category   = Column(TAXONOMY_CATEGORY_ENUM, nullable=True)
    trend_score         = Column(Float)
    volume_estimate     = Column(Integer)
    volume_source       = Column(VOLUME_SOURCE_ENUM, nullable=True)
    region              = Column(String(10), default="ID")
    is_active           = Column(Boolean, default=True, index=True)
    can_auto_deactivate = Column(Boolean, default=True)
    crawl_priority      = Column(CRAWL_PRIORITY_ENUM, default="sedang")
    activated_at        = Column(DateTime(timezone=True), nullable=True)
    activated_by        = Column(String(100))
    crawl_timestamp     = Column(DateTime(timezone=True), nullable=True)

    status_logs   = relationship("KeywordStatusLog", back_populates="keyword", lazy="select")
    trend_history = relationship("KeywordTrendHistory", back_populates="keyword", lazy="select")


class KeywordTrendHistory(Base):
    """Silver: per-keyword trend snapshots — 4× per day."""
    __tablename__ = "keyword_trend_history"

    history_id      = Column(String(64), primary_key=True, default=lambda: f"hist-{uuid.uuid4().hex[:12]}")
    keyword_id      = Column(String(64), ForeignKey("keyword_corpus.keyword_id"), nullable=False, index=True)
    snapshot_date   = Column(DateTime(timezone=True), nullable=False)
    interest_score  = Column(Integer)
    region_breakdown = Column(JSONB, default=dict)
    related_queries = Column(JSONB, default=dict)
    related_topics  = Column(JSONB, default=list)

    keyword = relationship("KeywordCorpus", back_populates="trend_history")


class KeywordStatusLog(Base):
    """Silver: audit trail for keyword activation/deactivation changes."""
    __tablename__ = "keyword_status_log"

    log_id                = Column(String(64), primary_key=True, default=lambda: f"log-{uuid.uuid4().hex[:12]}")
    keyword_id            = Column(String(64), ForeignKey("keyword_corpus.keyword_id"), nullable=False, index=True)
    old_status            = Column(Boolean, nullable=False)
    new_status            = Column(Boolean, nullable=False)
    reason                = Column(LOG_REASON_ENUM, nullable=False)
    trend_score_at_change = Column(Float, nullable=True)
    changed_by            = Column(String(100))
    changed_at            = Column(DateTime(timezone=True), nullable=False, default=func.now())

    keyword = relationship("KeywordCorpus", back_populates="status_logs")


class CrawlerConfig(Base):
    """Silver: per-platform crawler configuration — rate limits, targets, schedule."""
    __tablename__ = "crawler_config"

    crawler_id               = Column(String(64), primary_key=True, default=lambda: f"crw-{uuid.uuid4().hex[:6]}")
    crawler_name             = Column(String(100), nullable=False)
    platform                 = Column(PLATFORM_ENUM, nullable=False, unique=True)
    max_results_per_keyword  = Column(Integer, default=100)
    max_comments_per_post    = Column(SmallInteger, default=50)
    min_comment_likes        = Column(Integer, default=10)
    request_delay_sec        = Column(Integer, default=10)
    daily_target             = Column(Integer, default=4000)
    schedule_cron            = Column(String(50))
    is_active                = Column(Boolean, default=True)


class LabeledContent(Base):
    """Silver: NLP-labeled or manually-labeled content (posts AND comments)."""
    __tablename__ = "labeled_content"

    label_id          = Column(String(64), primary_key=True, default=lambda: f"lbl-{uuid.uuid4().hex[:12]}")
    source_type       = Column(SOURCE_TYPE_ENUM, nullable=False)
    source_id         = Column(String(64), nullable=False, index=True)
    label_type        = Column(LABEL_TYPE_ENUM, nullable=False)
    taxonomy_category = Column(TAXONOMY_CATEGORY_ENUM, nullable=True)
    sentiment         = Column(SENTIMENT_ENUM, nullable=True)
    confidence_score  = Column(Float, nullable=True)
    is_verified       = Column(Boolean, default=False)
    labeled_by        = Column(String(100))
    labeled_at        = Column(DateTime(timezone=True), default=func.now())
    batch_id          = Column(String(64), ForeignKey("batch_manifest.batch_id"), nullable=False, index=True)


# ── CONTROL LAYER ─────────────────────────────────────────────────────────────

class BatchManifest(Base):
    """Control: one row per crawl batch — source of truth for dashboard metrics."""
    __tablename__ = "batch_manifest"

    batch_id         = Column(String(64), primary_key=True)
    batch_type       = Column(BATCH_TYPE_ENUM, nullable=False)
    start_time       = Column(DateTime(timezone=True), nullable=False)
    end_time         = Column(DateTime(timezone=True), nullable=True)
    raw_data_count   = Column(Integer, default=0)
    comment_count    = Column(Integer, default=0)
    auto_labeled     = Column(Integer, default=0)
    manual_queue     = Column(SmallInteger, default=0)
    sft_total        = Column(Integer, default=0)
    qdrant_synced    = Column(Integer, default=0)
    success_rate_pct = Column(Numeric(5, 2), default=0)
    records_error    = Column(Integer, default=0)
    status           = Column(BATCH_STATUS_ENUM, nullable=False, default="RUNNING")
