"""Pydantic v2 schemas for crawler input/output and API responses."""
from datetime import date, datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Taxonomy Enum (mirrors DB taxonomy_category_enum) ─────────────────────────

class TaxonomyCategory(str, Enum):
    INTEGRITAS_HUKUM          = "Integritas & Penegakan Hukum"
    KEBIJAKAN_PUBLIK          = "Kebijakan & Layanan Publik"
    KINERJA_PEMERINTAH        = "Kinerja Pemerintah"
    KEAMANAN_SIBER            = "Keamanan Siber & Ketertiban Digital"
    KESEJAHTERAAN_BANSOS      = "Kesejahteraan & Bantuan Sosial"
    INFRASTRUKTUR_TRANSPORTASI = "Infrastruktur & Layanan Transportasi"
    EKONOMI_DIGITAL           = "Ekonomi Digital"
    KETENAGAKERJAAN           = "Ketenagakerjaan"
    LAYANAN_KESEHATAN         = "Layanan Kesehatan"
    PENDIDIKAN_SDM            = "Pendidikan dan Pengembangan SDM"
    KRISIS_KEBENCANAAN        = "Krisis Sosial & Kebencanaan"


# ── Raw Content ───────────────────────────────────────────────────────────────

class RawContentCreate(BaseModel):
    content_id:           str
    platform:             str
    content_type:         str
    raw_text:             Optional[str] = None
    media_urls:           dict = Field(default_factory=dict)
    url_source:           str
    author_id:            Optional[str] = None
    keyword_refs:         list[str] = Field(default_factory=list)
    taxonomy_category:    Optional[TaxonomyCategory] = None
    taxonomy_confidence:  Optional[float] = None
    extra_metadata:       dict = Field(default_factory=dict)
    publish_date:         Optional[date] = None
    crawl_timestamp:      datetime
    success:              bool = True
    batch_id:             str


class RawContentOut(RawContentCreate):
    class Config:
        from_attributes = True


# ── Post Comment ──────────────────────────────────────────────────────────────

class PostCommentCreate(BaseModel):
    comment_id:        str
    post_content_id:   str
    platform:          str
    comment_text:      str
    author_id:         Optional[str] = None
    likes_count:       int = 0
    is_reply:          bool = False
    parent_comment_id: Optional[str] = None
    created_at:        Optional[datetime] = None
    crawl_timestamp:   datetime
    batch_id:          str


# ── Image Manifest ────────────────────────────────────────────────────────────

class ImageManifestCreate(BaseModel):
    image_id:           str
    content_id_ref:     str
    storage_path:       Optional[str] = None
    file_format:        Optional[str] = None
    width_px:           Optional[int] = None
    height_px:          Optional[int] = None
    file_size_kb:       Optional[float] = None
    passed_tech_filter: bool = False
    crawl_timestamp:    datetime


# ── Audio Manifest ────────────────────────────────────────────────────────────

class AudioManifestCreate(BaseModel):
    audio_id:           str
    content_id_ref:     str
    storage_path:       Optional[str] = None
    file_format:        Optional[str] = None
    duration_sec:       Optional[float] = None
    is_original_sound:  bool = True
    has_speech:         bool = True
    passed_tech_filter: bool = False
    crawl_timestamp:    datetime


# ── Batch Manifest ────────────────────────────────────────────────────────────

class BatchManifestUpdate(BaseModel):
    raw_data_count:    int = 0
    comment_count:     int = 0
    records_error:     int = 0
    success_rate_pct:  float = 0.0
    status:            str = "SUCCESS"


# ── API Request / Response ────────────────────────────────────────────────────

class CrawlTriggerRequest(BaseModel):
    platform: Optional[str] = None   # None = all active platforms
    dry_run:  bool = False


class CrawlTriggerResponse(BaseModel):
    batch_id:      str
    platform:      Optional[str]
    message:       str
    keyword_count: int


class BatchStatusResponse(BaseModel):
    batch_id:         str
    status:           str
    raw_data_count:   int
    comment_count:    int
    records_error:    int
    success_rate_pct: float
    start_time:       datetime
    end_time:         Optional[datetime]


class KeywordListResponse(BaseModel):
    keywords:     list[dict[str, Any]]
    total:        int
    active_count: int
