"""
Verbose Crawler Trigger: Runs a crawl batch directly in the terminal.
Use this to debug logic, bypass event loop issues, and see real-time logs.

Usage:
    python -m scripts.run_crawl --platform media_online
    python -m scripts.run_crawl --platform media_online --dry-run
"""
import asyncio
import argparse
import sys
import structlog
from app.core.logging import configure_logging
from app.services.crawl_service import run_batch

# ProactorEventLoop is required on Windows for Playwright/subprocess support
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

async def main():
    parser = argparse.ArgumentParser(description="Run media crawler batch verbosely.")
    parser.add_argument("--platform", type=str, help="Target platform (media_online, tiktok, instagram, youtube_shorts)")
    parser.add_argument("--dry-run", action="store_true", help="Run without saving to database")
    
    args = parser.parse_args()
    
    configure_logging()
    logger = structlog.get_logger(__name__)
    
    logger.info("verbose_trigger_started", platform=args.platform, dry_run=args.dry_run)
    
    try:
        summary = await run_batch(
            target_platform=args.platform,
            dry_run=args.dry_run
        )
        logger.info("verbose_trigger_completed", summary=summary)
    except Exception as e:
        logger.error("verbose_trigger_failed", error=str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
