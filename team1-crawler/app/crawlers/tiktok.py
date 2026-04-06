"""
TikTokCrawler — crawls TikTok using Apify Actors.
Pivoted to Actor `GdWCkxBtKWOsKjdch` for multi-keyword search & integrated comments.
"""
from datetime import datetime, timezone
from typing import List, Optional

import structlog
from apify_client import ApifyClient

from pydantic import BaseModel, Field
import httpx
import re

from app.core.config import settings
from app.crawlers.base import BaseCrawler
from app.db.models import CrawlerConfig
from app.schemas.crawler import PostCommentCreate, RawContentCreate
from app.utils.storage import upload_from_url

logger = structlog.get_logger(__name__)

# Apify Actor ID for TikTok Scraper (integrated comments)
TIKTOK_ACTOR_ID = "GdWCkxBtKWOsKjdch"

class TikTokCrawler(BaseCrawler):
    """
    Crawls TikTok via Apify with multi-keyword support and integrated comments.
    """

    PLATFORM = "tiktok"

    def __init__(self, config: CrawlerConfig):
        super().__init__(config)
        self.client = ApifyClient(settings.APIFY_API_TOKEN) if settings.APIFY_API_TOKEN else None
        # Internal cache to store comments returned by the main crawl
        self._comment_cache: dict[str, list[PostCommentCreate]] = {}

    async def crawl(self, keyword_list: List[str], batch_id: str) -> List[RawContentCreate]:
        """
        Search TikTok for a list of keywords using Apify in a single batch.
        Note: We override the base signature to support keyword lists.
        """
        if not self.client:
            self.log.error("apify_token_missing")
            return []

        self.log.info("tiktok_apify_start", keywords=keyword_list)
        
        # Prepare Actor input
        # Calculate total results to ensure coverage for all keywords
        total_limit = len(keyword_list) * self.config.max_results_per_keyword
        
        run_input = {
            "searchQueries": keyword_list,
            "resultsPerPage": total_limit,
            "commentsPerPost": self.config.max_comments_per_post,
            "profileScrapeSections": ["videos"],
            "profileSorting": "latest",
            "searchSorting": "0",  # Relevance
            "searchDatePosted": "0", # Any time
            "shouldDownloadVideos": False,
            "proxyCountryCode": "None"
        }

        try:
            run = self.client.actor(TIKTOK_ACTOR_ID).call(run_input=run_input)
            
            results: list[RawContentCreate] = []
            self._comment_cache = {} # Reset cache
            
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                if item.get("id") and item.get("authorMeta"):
                    # This is a Video Post
                    video_item = await self._map_post(item, batch_id)
                    results.append(video_item)
                    
                    # Fetch comments from dedicated dataset if available
                    comment_dataset_url = item.get("commentsDatasetUrl")
                    dataset_url = item.get("commentsDatasetUrl")
                    if dataset_url:
                        # Extract dataset ID from Apify URL
                        # Format: https://api.apify.com/v2/datasets/<ID>/items?...
                        match = re.search(r"datasets/([^/]+)/items", dataset_url)
                        if match:
                            ds_id = match.group(1)
                            self.log.info("fetching_tiktok_comments", dataset_id=ds_id)
                            try:
                                video_url = item.get("webVideoUrl")
                                if video_url not in self._comment_cache:
                                    self._comment_cache[video_url] = []
                                
                                count = 0
                                for c_item in self.client.dataset(ds_id).iterate_items():
                                    if count >= self.config.max_comments_per_post:
                                        break
                                    c_out = self._map_comment(c_item, batch_id)
                                    if c_out:
                                        self._comment_cache[video_url].append(c_out)
                                        count += 1
                                self.log.info("tiktok_comments_cached", video_url=video_url, count=count)
                            except Exception as e:
                                self.log.error("tiktok_comment_fetch_failed", dataset_id=ds_id, error=str(e))
                        else:
                            self.log.warn("tiktok_invalid_dataset_url", url=dataset_url)
            
            self.log.info("tiktok_apify_done", found_posts=len(results))
            return results

        except Exception as exc:
            self.log.error("tiktok_apify_error", error=str(exc))
            return []

    async def crawl_comments(
        self, content_id: str, url: str, batch_id: str
    ) -> List[PostCommentCreate]:
        """
        Return comments from the internal cache (populated during crawl).
        Allows reuse of data already fetched by the Actor.
        """
        # Map our internal cache using the source URL
        comments = self._comment_cache.get(url, [])
        # Update foreign key to the specific content_id
        for c in comments:
            c.post_content_id = content_id
            
        return sorted(comments, key=lambda c: c.likes_count, reverse=True)

    async def _map_post(self, item: dict, batch_id: str) -> RawContentCreate:
        """Map Apify Post to RawContentCreate."""
        author_meta = item.get("authorMeta", {})
        unique_id = author_meta.get("name") # e.g. "officialinews"
        
        # Thumbnail upload to Supabase
        thumbnail_url = item.get("videoMeta", {}).get("coverUrl")
        storage_path = None
        if thumbnail_url:
            filename = f"{self.make_image_id()}.jpg"
            storage_path = await upload_from_url(
                thumbnail_url, "images", self.PLATFORM, filename
            )

        # Audio upload to Supabase
        music_url = item.get("musicMeta", {}).get("playUrl")
        audio_path = None
        if music_url:
            audio_filename = f"{self.make_audio_id()}.mp3"
            audio_path = await upload_from_url(
                music_url, "audio", self.PLATFORM, audio_filename
            )

        # Publish Date
        publish_date = None
        create_time = item.get("createTime")
        if create_time:
            publish_date = datetime.fromtimestamp(create_time, tz=timezone.utc).date()

        return RawContentCreate(
            content_id=self.make_content_id("tt"),
            platform=self.PLATFORM,
            content_type="video",
            raw_text=item.get("text", ""),
            media_urls={
                "video": item.get("videoMeta", {}).get("downloadAddr"),
                "thumbnail": storage_path or thumbnail_url,
                "audio": audio_path or music_url,
            },
            url_source=item.get("webVideoUrl"),
            author_id=self.hash_author(unique_id) if unique_id else None,
            keyword_refs=[], # Updated by service layer
            extra_metadata={
                "views": item.get("playCount"),
                "likes": item.get("diggCount"),
                "shares": item.get("shareCount"),
                "duration_sec": item.get("videoMeta", {}).get("duration"),
                "music_title": item.get("musicMeta", {}).get("musicName"),
                "music_author": item.get("musicMeta", {}).get("musicAuthor"),
            },
            publish_date=publish_date,
            crawl_timestamp=self.now_utc(),
            success=True,
            batch_id=batch_id,
        )

    def _map_comment(self, item: dict, batch_id: str) -> Optional[PostCommentCreate]:
        """Map Apify Comment to PostCommentCreate."""
        if item.get("diggCount", 0) < self.config.min_comment_likes:
            return None
            
        return PostCommentCreate(
            comment_id=self.make_comment_id(),
            post_content_id="PENDING", # Linked later in crawl_comments
            platform=self.PLATFORM,
            comment_text=item.get("text", ""),
            author_id=self.hash_author(item.get("uniqueId", "")),
            likes_count=item.get("diggCount", 0),
            is_reply=item.get("repliesToId") is not None,
            parent_comment_id=item.get("repliesToId"),
            created_at=datetime.fromtimestamp(item.get("createTime"), tz=timezone.utc) if item.get("createTime") else None,
            crawl_timestamp=self.now_utc(),
            batch_id=batch_id,
        )
