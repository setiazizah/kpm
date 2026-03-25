"""Step 5: Export — generates DOCX file and returns a download URL."""

import os
import time
import uuid
from pathlib import Path
from typing import Optional

from prefect import task, get_run_logger

from ..state import WorkflowState
from .base import make_meta

EXPORT_DIR = Path(os.getenv("EXPORT_DIR", "/tmp/exports"))
BASE_URL = os.getenv("EXPORT_BASE_URL", "http://localhost:8000/exports")


@task(
    name="export",
    retries=2,
    retry_delay_seconds=[1, 2],
    timeout_seconds=60,
)
async def export_task(state: WorkflowState, export_format: str = "docx") -> WorkflowState:
    """Convert revised_draft to DOCX/PDF and return a download URL."""
    logger = get_run_logger()
    logger.info("Step 5 — Export | session=%s format=%s", state.session_id, export_format)
    start = time.monotonic()

    if not state.revised_draft:
        raise ValueError("revised_draft is required for export step")

    try:
        url = await _export(state, export_format)
        meta = make_meta(start)
        logger.info("Export OK — %s", url)
        return state.with_export(url, meta)

    except ValueError:
        raise
    except Exception as exc:
        logger.warning("Export failed (%s) — skipping export", exc)
        meta = make_meta(start, fallback_used=True)
        return state.with_export(None, meta)


async def _export(state: WorkflowState, export_format: str) -> str:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{state.session_id}-{uuid.uuid4().hex[:8]}.{export_format}"
    path = EXPORT_DIR / filename

    if export_format == "docx":
        _write_docx(state.revised_draft, path)
    else:
        _write_txt(state.revised_draft, path)  # PDF requires extra deps; txt fallback

    return f"{BASE_URL}/{filename}"


def _write_docx(text: str, path: Path) -> None:
    from docx import Document
    doc = Document()
    for line in text.splitlines():
        doc.add_paragraph(line)
    doc.save(str(path))


def _write_txt(text: str, path: Path) -> None:
    path.write_text(text, encoding="utf-8")
