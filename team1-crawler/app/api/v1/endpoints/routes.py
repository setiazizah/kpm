"""API routers: crawlers, keywords, batches, health."""
import asyncio
from typing import Optional

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db import repository as repo
from app.schemas.crawler import (
    BatchStatusResponse, CrawlTriggerRequest, CrawlTriggerResponse,
    KeywordListResponse,
)
from app.services.crawl_service import run_batch

logger = structlog.get_logger(__name__)

# ── Health ────────────────────────────────────────────────────────────────────

health_router = APIRouter(prefix="/health", tags=["health"])

@health_router.get("")
async def health_check():
    return {"status": "ok", "service": "media-monitor-crawler"}


# ── Crawlers ──────────────────────────────────────────────────────────────────

crawl_router = APIRouter(prefix="/crawlers", tags=["crawlers"])

@crawl_router.post("/trigger", response_model=CrawlTriggerResponse)
async def trigger_crawl(
    body: CrawlTriggerRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger a crawl batch. Runs in background; returns batch_id immediately.
    Set dry_run=true to simulate without writing to DB.
    """
    keywords = await repo.get_active_keywords(db)
    keyword_count = len(keywords)

    if keyword_count == 0:
        raise HTTPException(status_code=422, detail="No active keywords found. Add keywords first.")

    # Kick off async batch in background
    background_tasks.add_task(
        run_batch,
        target_platform=body.platform,
        dry_run=body.dry_run,
    )

    from app.services.crawl_service import make_batch_id
    batch_id = make_batch_id()

    return CrawlTriggerResponse(
        batch_id=batch_id,
        platform=body.platform,
        message="Crawl batch started in background.",
        keyword_count=keyword_count,
    )


@crawl_router.get("/status/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Return status and metrics for a given batch_id."""
    from sqlalchemy import select
    from app.db.models import BatchManifest

    stmt = select(BatchManifest).where(BatchManifest.batch_id == batch_id)
    result = await db.execute(stmt)
    batch = result.scalar_one_or_none()

    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found.")

    return BatchStatusResponse(
        batch_id=batch.batch_id,
        status=batch.status,
        raw_data_count=batch.raw_data_count or 0,
        comment_count=batch.comment_count or 0,
        records_error=batch.records_error or 0,
        success_rate_pct=float(batch.success_rate_pct or 0),
        start_time=batch.start_time,
        end_time=batch.end_time,
    )


# ── Keywords ──────────────────────────────────────────────────────────────────

keyword_router = APIRouter(prefix="/keywords", tags=["keywords"])

@keyword_router.get("", response_model=KeywordListResponse)
async def list_keywords(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """List keywords from keyword_corpus, optionally filtered to active-only."""
    from sqlalchemy import select
    from app.db.models import KeywordCorpus

    stmt = select(KeywordCorpus)
    if active_only:
        stmt = stmt.where(KeywordCorpus.is_active == True)

    result = await db.execute(stmt)
    keywords = result.scalars().all()

    return KeywordListResponse(
        keywords=[
            {
                "keyword_id": k.keyword_id,
                "keyword_text": k.keyword_text,
                "taxonomy_category": k.taxonomy_category,
                "crawl_priority": k.crawl_priority,
                "trend_score": k.trend_score,
                "is_active": k.is_active,
            }
            for k in keywords
        ],
        total=len(keywords),
        active_count=sum(1 for k in keywords if k.is_active),
    )


# ── Batches ───────────────────────────────────────────────────────────────────

batch_router = APIRouter(prefix="/batches", tags=["batches"])

@batch_router.get("")
async def list_batches(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Return most recent batch runs."""
    from sqlalchemy import select, desc
    from app.db.models import BatchManifest

    stmt = select(BatchManifest).order_by(desc(BatchManifest.start_time)).limit(limit)
    result = await db.execute(stmt)
    batches = result.scalars().all()

    return {
        "status": "ok",
        "data": [
            {
                "batch_id": b.batch_id,
                "status": b.status,
                "raw_data_count": b.raw_data_count,
                "comment_count": b.comment_count,
                "success_rate_pct": float(b.success_rate_pct or 0),
                "start_time": b.start_time.isoformat() if b.start_time else None,
                "end_time": b.end_time.isoformat() if b.end_time else None,
            }
            for b in batches
        ],
        "meta": {"count": len(batches)},
    }
