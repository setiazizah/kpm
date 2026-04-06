"""
BaseCrawler: abstract base class that all platform crawlers must inherit.
Enforces consistent interface and shared utility methods.
"""
import hashlib
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional

import structlog

from app.db.models import CrawlerConfig
from app.schemas.crawler import PostCommentCreate, RawContentCreate

logger = structlog.get_logger(__name__)


class BaseCrawler(ABC):
    """
    Abstract base for all platform crawlers.

    Subclasses must implement:
        - crawl(keyword, config) -> list[RawContentCreate]
        - crawl_comments(content_id, url) -> list[PostCommentCreate]
    """

    PLATFORM: str  # e.g. "tiktok", "instagram"

    def __init__(self, config: CrawlerConfig):
        self.config = config
        self.log = structlog.get_logger(self.__class__.__name__)

    # ── Abstract interface ────────────────────────────────────────────────────

    @abstractmethod
    async def crawl(
        self,
        keyword: str,
        batch_id: str,
    ) -> list[RawContentCreate]:
        """
        Crawl the platform for content matching `keyword`.

        Args:
            keyword: search term to crawl
            batch_id: current batch identifier for tagging rows

        Returns:
            List of RawContentCreate instances ready for DB upsert.
        """
        ...

    @abstractmethod
    async def crawl_comments(
        self,
        content_id: str,
        url: str,
        batch_id: str,
    ) -> list[PostCommentCreate]:
        """
        Crawl top-N comments for a given post URL.

        Args:
            content_id: FK to raw_content
            url: post URL
            batch_id: current batch identifier

        Returns:
            List of PostCommentCreate instances (pre-filtered by min_likes).
        """
        ...

    # ── Shared utilities ──────────────────────────────────────────────────────

    def make_content_id(self, platform_abbr: Optional[str] = None) -> str:
        """Generate a content_id following the datalake convention."""
        abbr = platform_abbr or self.PLATFORM[:2]
        date_str = datetime.now(tz=timezone.utc).strftime("%Y%m%d")
        return f"cnt-{abbr}-{date_str}-{uuid.uuid4().hex[:8]}"

    def make_comment_id(self) -> str:
        date_str = datetime.now(tz=timezone.utc).strftime("%Y%m%d")
        return f"cmt-{date_str}-{uuid.uuid4().hex[:8]}"

    def make_image_id(self) -> str:
        date_str = datetime.now(tz=timezone.utc).strftime("%Y%m%d")
        return f"img-{date_str}-{uuid.uuid4().hex[:8]}"

    def make_audio_id(self) -> str:
        date_str = datetime.now(tz=timezone.utc).strftime("%Y%m%d")
        return f"aud-{date_str}-{uuid.uuid4().hex[:8]}"

    @staticmethod
    def hash_author(username: str) -> str:
        """SHA-256 hash a username for privacy-compliant storage."""
        return "usr_" + hashlib.sha256(username.encode("utf-8")).hexdigest()[:12]

    def storage_path(self, media_type: str, filename: str) -> str:
        """
        Build Supabase Storage object path following datalake convention.

        Example: bronze/images/tiktok/20260311/img-abc123.jpg
        """
        date_str = datetime.now(tz=timezone.utc).strftime("%Y%m%d")
        return f"bronze/{media_type}/{self.PLATFORM}/{date_str}/{filename}"

    def now_utc(self) -> datetime:
        return datetime.now(tz=timezone.utc)

    def _make_error_content(
        self,
        url: str,
        keyword: str,
        batch_id: str,
        error_message: str,
    ) -> RawContentCreate:
        """
        Build a failure placeholder row for raw_content.
        success=False so it counts toward the error dashboard panel.
        """
        return RawContentCreate(
            content_id=self.make_content_id(),
            platform=self.PLATFORM,
            content_type="post",
            raw_text=None,
            url_source=url,
            keyword_refs=[keyword],
            extra_metadata={"error": error_message},
            crawl_timestamp=self.now_utc(),
            success=False,
            batch_id=batch_id,
        )
