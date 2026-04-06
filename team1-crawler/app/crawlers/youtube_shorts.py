"""
YouTubeShortsCrawler — crawls YouTube Shorts using Apify Actors.
Pivoted to apify/youtube-scraper with multi-keyword support.
"""
from datetime import datetime, timezone
from typing import List, Optional

import structlog
from apify_client import ApifyClient

from app.core.config import settings
from app.crawlers.base import BaseCrawler
from app.db.models import CrawlerConfig
from app.schemas.crawler import PostCommentCreate, RawContentCreate
from app.utils.storage import upload_from_url

logger = structlog.get_logger(__name__)

# Apify Actor ID for YouTube Scraper (streamers/youtube-scraper)
YOUTUBE_ACTOR_ID = "h7sDV53CddomktSi5"
# Dedicated Actor for detailed comments (streamers/youtube-comment-scraper)
YOUTUBE_COMMENT_ACTOR_ID = "p7UMdpQnjKmmpR21D"

class YouTubeShortsCrawler(BaseCrawler):
    """
    Crawls YouTube Shorts via Apify with multi-keyword support.
    """

    PLATFORM = "youtube_shorts"

    def __init__(self, config: CrawlerConfig):
        super().__init__(config)
        self.client = ApifyClient(settings.APIFY_API_TOKEN) if settings.APIFY_API_TOKEN else None

    async def crawl(self, keyword_list: List[str], batch_id: str) -> List[RawContentCreate]:
        """Search YouTube for a list of keywords matching #shorts using Apify."""
        if not self.client:
            self.log.error("apify_token_missing")
            return []

        self.log.info("youtube_apify_start", keywords=keyword_list)
        
        run_input = {
            "searchQueries": keyword_list,
            "maxResults": self.config.max_results_per_keyword,
            "maxResultsShorts": self.config.max_results_per_keyword,
            "proxyConfiguration": {"useApifyProxy": True},
            "subtitlesLanguage": "any",
            "subtitlesFormat": "srt",
        }

        try:
            run = self.client.actor(YOUTUBE_ACTOR_ID).call(run_input=run_input)
            results: list[RawContentCreate] = []
            
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                # The user wants "shorts". The actor returns "shorts" or "video" in type.
                if item.get("type") == "shorts" or "/shorts/" in item.get("url", ""):
                    video_item = await self._map_item(item, batch_id)
                    results.append(video_item)
            
            self.log.info("youtube_apify_done", found=len(results))
            return results

        except Exception as exc:
            self.log.error("youtube_apify_error", error=str(exc))
            # Return failure placeholders for tracking
            return [
                self._make_error_content("", kw, batch_id, str(exc))
                for kw in keyword_list
            ]

    async def crawl_comments(
        self, content_id: str, url: str, batch_id: str
    ) -> List[PostCommentCreate]:
        """
        Crawl detailed comments for a YouTube Short using a dedicated Actor.
        """
        if not self.client:
            return []

        run_input = {
            "startUrls": [{"url": url}],
            "maxComments": self.config.max_comments_per_post,
            "commentsSortBy": "0", # Newest/Relevant
            "proxyConfiguration": {"useApifyProxy": True},
        }

        try:
            run = self.client.actor(YOUTUBE_COMMENT_ACTOR_ID).call(run_input=run_input)
            comments: list[PostCommentCreate] = []
            
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                # voteCount is the like count in this actor
                likes = item.get("voteCount", 0)
                if likes < self.config.min_comment_likes:
                    continue
                    
                comments.append(PostCommentCreate(
                    comment_id=self.make_comment_id(),
                    post_content_id=content_id,
                    platform=self.PLATFORM,
                    comment_text=item.get("comment", ""),
                    author_id=self.hash_author(item.get("author", "")),
                    likes_count=likes,
                    is_reply=item.get("replyCount", 0) > 0, # Note: this actor doesn't link parents easily
                    parent_comment_id=None,
                    created_at=None, # This actor sample doesn't show a date
                    crawl_timestamp=self.now_utc(),
                    batch_id=batch_id,
                ))
            
            return sorted(comments, key=lambda c: c.likes_count, reverse=True)

        except Exception as exc:
            self.log.error("youtube_comments_apify_error", url=url, error=str(exc))
            return []

    async def _map_item(self, item: dict, batch_id: str) -> RawContentCreate:
        """Map Apify YouTube item to RawContentCreate."""
        
        # Thumbnail upload to Supabase
        thumbnail_url = item.get("thumbnailUrl")
        storage_path = None
        if thumbnail_url:
            filename = f"{self.make_image_id()}.jpg"
            storage_path = await upload_from_url(
                thumbnail_url, "images", self.PLATFORM, filename
            )

        # Parse publish date
        publish_date = None
        date_str = item.get("date")
        if date_str:
            try:
                publish_date = datetime.fromisoformat(date_str.replace("Z", "+00:00")).date()
            except:
                pass

        return RawContentCreate(
            content_id=self.make_content_id("yt"),
            platform=self.PLATFORM,
            content_type="video",
            raw_text=f"{item.get('title', '')}\n{item.get('text', '')}".strip(),
            media_urls={
                "video": item.get("url"),
                "thumbnail": storage_path or thumbnail_url,
            },
            url_source=item.get("url"),
            author_id=self.hash_author(item.get("channelUsername") or item.get("channelName", "")),
            keyword_refs=[], # Updated by service layer
            extra_metadata={
                "title": item.get("title"),
                "channel_name": item.get("channelName"),
                "views": item.get("viewCount"),
                "likes": item.get("likes"),
                "duration": item.get("duration"),
                "comments_count": item.get("commentsCount"),
                "channel_id": item.get("channelId"),
                "subscribers": item.get("numberOfSubscribers"),
            },
            publish_date=publish_date,
            crawl_timestamp=self.now_utc(),
            success=True,
            batch_id=batch_id,
        )
