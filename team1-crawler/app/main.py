"""
Media Monitoring Crawler — FastAPI Application Entrypoint

Platforms: Media Online (news), TikTok, Instagram, YouTube Shorts
Database:  PostgreSQL via Supabase (Bronze/Silver/Control datalake)
Crawler:   Crawl4AI AsyncWebCrawler
"""
import asyncio
import sys
from contextlib import asynccontextmanager

# ProactorEventLoop is required on Windows for Playwright/subprocess support
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.routes import (
    batch_router, crawl_router, health_router, keyword_router,
)
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.session import engine
from app.db.models import Base
from app.services.crawl_service import run_batch

configure_logging()
logger = structlog.get_logger(__name__)

scheduler = AsyncIOScheduler(timezone=settings.TIMEZONE)


# ── Startup / Shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", env=settings.APP_ENV)

    # Create tables if they don't exist (use Alembic in production)
    if settings.APP_ENV == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("db_tables_checked")

    # ── Schedule crawl batches ──────────────────────────────────────────────
    # Main batch: daily at 02:00 WIB
    scheduler.add_job(
        run_batch,
        "cron",
        hour=2,
        minute=0,
        id="main_crawl_batch",
        replace_existing=True,
    )
    # News-only batch: every 6 hours
    scheduler.add_job(
        run_batch,
        "cron",
        hour="*/6",
        minute=0,
        kwargs={"target_platform": "media_online"},
        id="news_crawl_batch",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("scheduler_started", jobs=len(scheduler.get_jobs()))

    yield  # application running

    scheduler.shutdown(wait=False)
    await engine.dispose()
    logger.info("shutdown_complete")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="Media Monitoring Crawler",
        description=(
            "Crawl4AI-powered crawler for Indonesian national news and social media "
            "(TikTok, Instagram, YouTube Shorts). Stores results to Supabase PostgreSQL "
            "following the Bronze/Silver/Control datalake schema."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers under /api/v1/
    prefix = "/api/v1"
    app.include_router(health_router,  prefix=prefix)
    app.include_router(crawl_router,   prefix=prefix)
    app.include_router(keyword_router, prefix=prefix)
    app.include_router(batch_router,   prefix=prefix)

    return app


app = create_app()


# ── CLI entrypoint ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "development"),
        log_level=settings.LOG_LEVEL.lower(),
    )
