"""
Supabase Storage helper — upload media files (images, audio) to Supabase bucket.

Bucket structure:
  datalake/
  ├── bronze/
  │   ├── images/
  │   │   └── instagram/
  │   │       └── 2026/03/05/
  │   │           └── img-abc123.jpg
  │   └── audio/
  │       └── tiktok/
  │           └── 2026/03/05/
  │               └── aud-abc123.mp3

Public URL format (if bucket is public):
  https://<project>.supabase.co/storage/v1/object/public/datalake/bronze/images/...

For private bucket (recommended), use signed URLs or service key.
"""
import mimetypes
from datetime import datetime, timezone
from typing import Optional

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Supabase Storage REST endpoint
STORAGE_BASE = "{supabase_url}/storage/v1/object/{bucket}/{path}"
STORAGE_URL_BASE = "{supabase_url}/storage/v1/object/public/{bucket}/{path}"


def _storage_path(media_type: str, platform: str, filename: str) -> str:
    """
    Build the object path inside the Supabase bucket.

    Example: bronze/images/tiktok/20260311/img-abc123.jpg
    """
    date_str = datetime.now(tz=timezone.utc).strftime("%Y%m%d")
    return f"bronze/{media_type}/{platform}/{date_str}/{filename}"


async def upload_bytes(
    data: bytes,
    media_type: str,       # "images" | "audio"
    platform: str,         # "instagram" | "tiktok"
    filename: str,         # e.g. "img-abc123.jpg"
    content_type: str,     # MIME type e.g. "image/jpeg"
) -> Optional[str]:
    """
    Upload raw bytes to Supabase Storage.

    Args:
        data:         File content as bytes
        media_type:   Subfolder — "images" or "audio"
        platform:     Platform subfolder — "instagram", "tiktok", etc.
        filename:     Target filename in storage
        content_type: MIME type for the upload

    Returns:
        Full storage path (e.g. "bronze/images/instagram/2026/03/05/img-abc123.jpg")
        or None if upload failed.
    """
    path = _storage_path(media_type, platform, filename)
    url = STORAGE_BASE.format(
        supabase_url=settings.SUPABASE_URL,
        bucket=settings.SUPABASE_BUCKET,
        path=path,
    )
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Content-Type":  content_type,
        "x-upsert":      "true",   # overwrite if same path exists
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, content=data, headers=headers)
            resp.raise_for_status()
            logger.debug("storage_upload_ok", path=path, size_kb=round(len(data) / 1024, 1))
            return path
    except httpx.HTTPStatusError as exc:
        logger.error("storage_upload_failed", path=path, status=exc.response.status_code)
        return None
    except Exception as exc:
        logger.error("storage_upload_error", path=path, error=str(exc))
        return None


async def upload_from_url(
    source_url: str,
    media_type: str,
    platform: str,
    filename: str,
) -> Optional[str]:
    """
    Download a media file from `source_url` then upload to Supabase Storage.

    Args:
        source_url: Public URL of the media to download (e.g. TikTok thumbnail)
        media_type: "images" | "audio"
        platform:   Platform name for subfolder
        filename:   Target filename in storage

    Returns:
        Storage path string, or None if download/upload failed.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/",
        "Accept": "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
        "Range": "bytes=0-",
    }
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(source_url, headers=headers)
            resp.raise_for_status()
            data = resp.content
            content_type = resp.headers.get("content-type", "application/octet-stream").split(";")[0]
    except httpx.HTTPStatusError as exc:
        logger.error("storage_download_http_error", url=source_url, status=exc.response.status_code)
        return None
    except Exception as exc:
        logger.error("storage_download_failed", url=source_url, error=str(exc))
        return None

    return await upload_bytes(data, media_type, platform, filename, content_type)


def public_url(storage_path: str) -> str:
    """
    Build the public URL for a stored object.
    Only works if the bucket is set to Public in Supabase dashboard.
    For private buckets, generate a signed URL via the Supabase dashboard or SDK.
    """
    return STORAGE_URL_BASE.format(
        supabase_url=settings.SUPABASE_URL,
        bucket=settings.SUPABASE_BUCKET,
        path=storage_path,
    )
