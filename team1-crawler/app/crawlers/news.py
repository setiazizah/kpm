"""
NewsCrawler — crawls Indonesian national news websites (media online).
Supports: kompas.com, detik.com, tempo.co, tribunnews.com, cnbcindonesia.com, and more.
Uses Crawl4AI JsonCssExtractionStrategy with per-domain selectors.
"""
import asyncio
import json
from datetime import datetime
from typing import Optional
from urllib.parse import urlencode

import structlog
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CacheMode, CrawlerRunConfig
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy

from app.crawlers.base import BaseCrawler
from app.db.models import CrawlerConfig
from app.schemas.crawler import PostCommentCreate, RawContentCreate

logger = structlog.get_logger(__name__)

# ── Per-domain CSS extraction schemas ─────────────────────────────────────────
# Add new domains here without changing core logic.
DOMAIN_SCHEMAS: dict[str, dict] = {
    "kompas.com": {
        "name": "KompasArticle",
        "baseSelector": ".col-bs10-7",
        "fields": [
            {"name": "title",        "selector": "h1.read__title",     "type": "text"},
            {"name": "author",       "selector": ".credit-title-name", "type": "text"},
            {"name": "publish_date", "selector": ".read__time",        "type": "text"},
            {"name": "body",         "selector": ".read__content",     "type": "text"},
            {"name": "image_url",    "selector": ".photo__img img",    "type": "attribute", "attribute": "src"},
        ],
    },
    "detik.com": {
        "name": "DetikArticle",
        "baseSelector": "article",
        "fields": [
            {"name": "title",        "selector": "h1.detail__title",   "type": "text"},
            {"name": "author",       "selector": ".detail__author",    "type": "text"},
            {"name": "publish_date", "selector": ".detail__date",      "type": "text"},
            {"name": "body",         "selector": ".detail__body-text", "type": "text"},
            {"name": "image_url",    "selector": ".detail__media img", "type": "attribute", "attribute": "src"},
        ],
    },
    "tribunnews.com": {
        "name": "TribunArticle",
        "baseSelector": "body",
        "fields": [
            {"name": "title",        "selector": "h1",                   "type": "text"},
            {"name": "author",       "selector": ".credit b a, #author", "type": "text"},
            {"name": "publish_date", "selector": "time",                 "type": "text"},
            {"name": "body",         "selector": ".txt-article, .content, p", "type": "text"},
            {"name": "image_url",    "selector": "img",                  "type": "attribute", "attribute": "src"},
        ],
    },
    "cnbcindonesia.com": {
        "name": "CNBCArticle",
        "baseSelector": "body",
        "fields": [
            {"name": "title",        "selector": "h1",                   "type": "text"},
            {"name": "author",       "selector": ".font-semibold, .detail__author", "type": "text"},
            {"name": "publish_date", "selector": ".text-gray, time",     "type": "text"},
            {"name": "body",         "selector": ".detail__body, .detail-text", "type": "text"},
            {"name": "image_url",    "selector": "img",                  "type": "attribute", "attribute": "src"},
        ],
    },
}

# Default fallback schema for unknown domains
DEFAULT_SCHEMA: dict = {
    "name": "GenericArticle",
    "baseSelector": "article, main, .content, #content",
    "fields": [
        {"name": "title",        "selector": "h1",    "type": "text"},
        {"name": "body",         "selector": "p",     "type": "text"},
        {"name": "publish_date", "selector": "time",  "type": "attribute", "attribute": "datetime"},
    ],
}

# Search URL templates per news portal (keyword-based search)
SEARCH_URL_TEMPLATES: dict[str, str] = {
    "kompas.com":       "https://search.kompas.com/search/?q={keyword}&sort=latest",
    "detik.com":        "https://www.detik.com/search/searchall?query={keyword}&sortby=time",
    "tribunnews.com":   "https://www.tribunnews.com/search?q={keyword}",
    "cnbcindonesia.com": "https://www.cnbcindonesia.com/search?query={keyword}&kanal=news",
}

# Article list selectors for search result pages
SEARCH_LIST_SELECTORS: dict[str, str] = {
    "kompas.com":       ".sectionBox a.article-link",
    "detik.com":        "article.list-content__item h3 a",
    "tribunnews.com":   "h3.txt > a",
    "cnbcindonesia.com": "article a.gtm_article_click",
}


class NewsCrawler(BaseCrawler):
    """Crawls Indonesian national news portals for keyword-relevant articles."""

    PLATFORM = "media_online"

    def __init__(self, config: CrawlerConfig):
        super().__init__(config)
        self._browser_cfg = BrowserConfig(
            headless=True,
            verbose=False,
            user_agent_mode="random",
        )

    # ── Main crawl interface ─────────────────────────────────────────────────

    async def crawl(self, keyword: str, batch_id: str) -> list[RawContentCreate]:
        """
        Search all configured news portals for `keyword` and crawl found articles.

        Crawls up to max_results_per_keyword articles **per domain**, ensuring
        results come from every available portal rather than just the first one.
        """
        results: list[RawContentCreate] = []
        per_domain_limit = max(self.config.max_results_per_keyword, 1)

        async with AsyncWebCrawler(config=self._browser_cfg) as crawler:
            for domain, search_tpl in SEARCH_URL_TEMPLATES.items():
                search_url = search_tpl.format(keyword=keyword.replace(" ", "+"))
                article_urls = await self._get_article_urls(
                    crawler, search_url, domain, limit=per_domain_limit
                )
                self.log.info("news_search_done", domain=domain, keyword=keyword, found=len(article_urls))

                for url in article_urls:
                    item = await self._crawl_article(crawler, url, keyword, batch_id, domain)
                    results.append(item)
                    await asyncio.sleep(self.config.request_delay_sec)

        return results

    async def crawl_comments(
        self, content_id: str, url: str, batch_id: str
    ) -> list[PostCommentCreate]:
        """News articles don't have comments in the datalake scope — returns empty."""
        return []

    # ── Internal helpers ─────────────────────────────────────────────────────

    async def _get_article_urls(
        self,
        crawler: AsyncWebCrawler,
        search_url: str,
        domain: str,
        limit: int,
    ) -> list[str]:
        """Extract article URLs from a search result page."""
        # Per-domain wait_for selectors for search result pages
        # Only include domains with known reliable selectors — others load without waiting
        SEARCH_WAIT_FOR: dict[str, str] = {
            "kompas.com":        "css:.sectionBox",
            "detik.com":         "css:article.list-content__item, .media__title",
            "tribunnews.com":    "css:h3, .txt a",
        }
        # SPA-heavy domains need extra time + JS to let search results render
        SPA_DOMAINS = {"cnbcindonesia.com"}

        wait_sel = SEARCH_WAIT_FOR.get(domain)
        is_spa = domain in SPA_DOMAINS
        run_cfg = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=0,
            remove_overlay_elements=True,
            **({"wait_for": wait_sel} if wait_sel else {}),
            **({"js_code": "await new Promise(r => setTimeout(r, 5000)); window.scrollBy(0, 1000);",
                "delay_before_return_html": 3.0} if is_spa else {}),
            page_timeout=30000,
        )
        try:
            result = await crawler.arun(url=search_url, config=run_cfg)
            if not result.success:
                self.log.warning("search_failed", url=search_url, error=result.error_message)
                return []

            # Extract hrefs using internal link data which is more robust than CSS extraction
            links = result.links.get("internal", []) + result.links.get("external", [])
            urls = []

            # Per-domain article URL filters
            ARTICLE_FILTERS: dict[str, list[str]] = {
                "kompas.com":        ["/read/"],
                "detik.com":         ["/berita/", "/d-"],
                "tribunnews.com":    ["/nasional/", "/metropolitan/", "/bisnis/",
                                      "/techno/", "/sport/", "/seleb/", "/regional/"],
                "cnbcindonesia.com": ["/news/", "/market/", "/tech/", "/entrepreneur/"],
            }

            filters = ARTICLE_FILTERS.get(domain, [])

            for lnk in links:
                url = lnk.get("href")
                if not url:
                    continue

                # Ensure it's within the same domain
                if domain not in url:
                    continue

                # Apply article-specific path filters
                if filters and not any(f in url for f in filters):
                    continue

                if url not in urls:
                    urls.append(url)
            
            return urls[:limit]
        except Exception as exc:
            self.log.error("search_error", url=search_url, error=str(exc))
            return []

    async def _crawl_article(
        self,
        crawler: AsyncWebCrawler,
        url: str,
        keyword: str,
        batch_id: str,
        domain: str,
    ) -> RawContentCreate:
        """Crawl a single article URL and map it to RawContentCreate."""
        schema = DOMAIN_SCHEMAS.get(domain, DEFAULT_SCHEMA)
        run_cfg = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            extraction_strategy=JsonCssExtractionStrategy(schema),
            word_count_threshold=0,
            remove_overlay_elements=True,
            excluded_tags=["nav", "footer", "header", "aside", "script", "style"],
            **({"js_code": "await new Promise(r => setTimeout(r, 2000));",
                "delay_before_return_html": 1.0} if domain == "cnbcindonesia.com" else {}),
            page_timeout=30000,
        )
        try:
            result = await crawler.arun(url=url, config=run_cfg)
            if not result.success:
                return self._make_error_content(url, keyword, batch_id, result.error_message)

            extracted = {}
            if result.extracted_content:
                items = json.loads(result.extracted_content)
                extracted = items[0] if items else {}

            # Manual fallback for author and date using lxml if CSS strategy failed
            from lxml import html as lxml_html
            tree = lxml_html.fromstring(result.html)
            
            author = extracted.get("author")
            if not author:
                # Try verified selectors via XPath for better reliability
                author_xpaths = [
                    "//div[contains(@class, 'font-semibold')]", 
                    "//*[@id='author' or contains(@class, 'author')]",
                    "//div[contains(@class, 'credit')]//a",
                    "//span[contains(@class, 'author')]",
                    "//meta[@name='author']/@content"
                ]
                for xp in author_xpaths:
                    els = tree.xpath(xp)
                    if els:
                        # Use text_content() to get nested text (important for CNBC)
                        author = els[0].text_content().strip() if hasattr(els[0], 'text_content') else str(els[0])
                        if author: break
            
            # Script-based fallback for author (Tribun/CNBC often have this in JS with single or double quotes)
            if not author:
                import re
                m = re.search(r"['\"](?:editor|author|penulis)['\"]:\s*['\"]([^'\"]+)['\"]", result.html)
                if m: author = m.group(1)

            # Clean author (remove prefixes, source info, and extra whitespace)
            if author:
                import re
                # Remove common prefixes
                author = re.sub(r"^(editor|reporter|penulis|oleh|by)\s*:\s*", "", author, flags=re.IGNORECASE)
                # Split at common delimiters to get the name only
                for delim in [",", "-", "|", "&nbsp;"]:
                    author = author.split(delim)[0]
                author = author.strip()
                if len(author) > 100: author = author[:100] # Safety cut

            pub_date_raw = extracted.get("publish_date")
            if not pub_date_raw:
                date_xpaths = [
                    "//div[contains(@class, 'text-gray') and contains(., '202')]",
                    "//time",
                    "//*[@id='article_date' or contains(@class, 'date')]",
                    "//meta[@property='article:published_time']/@content",
                    "//meta[@name='pubdate']/@content"
                ]
                for xp in date_xpaths:
                    els = tree.xpath(xp)
                    if els:
                        pub_date_raw = els[0].text_content() if hasattr(els[0], 'text_content') else str(els[0])
                        if pub_date_raw: break

            if not pub_date_raw:
                import re
                m = re.search(r"['\"](?:publish_date|datePublished|pubdate)['\"]:\s*['\"]([^'\"]+)['\"]", result.html)
                if m: pub_date_raw = m.group(1)

            title = extracted.get("title") or result.metadata.get("title", "")
            body = (
                extracted.get("body")
                or (result.markdown.fit_markdown if result.markdown else None)
                or ""
            )
            
            image_url = extracted.get("image_url") or self._first_image(result)
            media_urls = {"images": [image_url]} if image_url else {}

            return RawContentCreate(
                content_id=self.make_content_id("mo"),
                platform=self.PLATFORM,
                content_type="article",
                raw_text=body.strip() if body else "",
                media_urls=media_urls,
                url_source=url,
                author_id=self.hash_author(author) if author else None,
                keyword_refs=[keyword],
                extra_metadata={
                    "title": title,
                    "domain": domain,
                    "author": author, # Store raw author name for verification
                    "og_description": result.metadata.get("description", ""),
                },
                publish_date=self._parse_date(pub_date_raw),
                crawl_timestamp=self.now_utc(),
                success=True,
                batch_id=batch_id,
            )
        except Exception as exc:
            self.log.error("article_crawl_error", url=url, error=str(exc))
            return self._make_error_content(url, keyword, batch_id, str(exc))

    @staticmethod
    def _first_image(result) -> Optional[str]:
        images = result.media.get("images", [])
        return images[0].get("src") if images else None

    # Indonesian month mapping for date parsing
    _INDO_MONTHS = {
        # Full Indonesian month names
        "januari": 1, "februari": 2, "maret": 3, "april": 4,
        "mei": 5, "juni": 6, "juli": 7, "agustus": 8,
        "september": 9, "oktober": 10, "november": 11, "desember": 12,
        # English Month Names (used by cnbcindonesia.com: "15 January 2026 18:45")
        "january": 1, "february": 2, "march": 3, "may": 5, "june": 6, "july": 7,
        "august": 8, "october": 10, "december": 12,
        # Short forms (used by detik.com: "Rabu, 11 Mar 2026 14:33 WIB")
        "jan": 1, "feb": 2, "mar": 3, "apr": 4,
        "jun": 6, "jul": 7, "agu": 8, "ags": 8, "aug": 8,
        "sep": 9, "okt": 10, "oct": 10, "nov": 11, "des": 12, "dec": 12,
    }

    @classmethod
    def _parse_date(cls, raw: Optional[str]) -> Optional[datetime.date]:
        if not raw:
            return None

        import re

        # Try Indonesian format: "Kompas.com, 11 Maret 2026, 13:04 WIB"
        # or "11 Maret 2026"
        m = re.search(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", raw)
        if m:
            day, month_name, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
            month = cls._INDO_MONTHS.get(month_name)
            if month:
                try:
                    return datetime(year, month, day).date()
                except ValueError:
                    pass

        # Fallback: standard ISO / common formats
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%B %d, %Y"):
            try:
                return datetime.strptime(raw[:len(fmt)], fmt).date()
            except ValueError:
                continue
        return None
