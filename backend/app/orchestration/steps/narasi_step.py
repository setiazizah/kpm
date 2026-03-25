"""Step 2: Narasi — calls Tim 2 API, falls back to local LLM."""

import os
import time

import httpx
from prefect import task, get_run_logger

from ..state import NarasiOutput, WorkflowState
from ..fallback.llm_client import get_llm_client
from ..fallback.prompt_templates import load_template
from .base import make_meta

TIM2_URL = os.getenv("TIM2_ANALYZE_ISSUE_URL", "http://host.docker.internal:9002/api/v1/analyze-issue")
TIMEOUT = float(os.getenv("TIM2_TIMEOUT_SECONDS", "60"))


@task(
    name="narasi",
    retries=3,
    retry_delay_seconds=[1, 2, 4],
    timeout_seconds=90,
)
async def narasi_task(state: WorkflowState) -> WorkflowState:
    """Call Tim 2 for issue narrative analysis."""
    logger = get_run_logger()
    logger.info("Step 2 — Narasi | session=%s", state.session_id)
    start = time.monotonic()

    try:
        narasi = await _call_tim2(state)
        meta = make_meta(start)
        logger.info("Narasi OK — isu=%s", narasi.isu)
        return state.with_narasi(narasi, meta)

    except Exception as exc:
        logger.warning("Tim 2 failed (%s) — using local LLM fallback", exc)
        narasi = await _fallback_narasi(state)
        meta = make_meta(start, fallback_used=True)
        return state.with_narasi(narasi, meta)


async def _call_tim2(state: WorkflowState) -> NarasiOutput:
    docs_text = "\n".join(
        f"[{d.source}] {d.content}" for d in (state.retrieved_docs or [])
    )
    payload = {
        "query": state.query,
        "retrieved_docs": docs_text,
        "channel": state.channel,
        "tone": state.tone,
    }
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(TIM2_URL, json=payload)
        resp.raise_for_status()
        data = resp.json()

    return NarasiOutput(
        isu=data.get("isu", state.query),
        narasi=data.get("narasi", ""),
        key_points=data.get("key_points", []),
    )


async def _fallback_narasi(state: WorkflowState) -> NarasiOutput:
    llm = get_llm_client()
    docs_text = "\n".join(
        f"- [{d.source}] {d.content[:300]}" for d in (state.retrieved_docs or [])
    )
    prompt = load_template("narasi_fallback").format(
        query=state.query,
        docs=docs_text or "(tidak ada dokumen referensi)",
        channel=state.channel,
        tone=state.tone,
    )
    raw = await llm.generate(prompt)
    # Parse simple format: first line = isu, rest = narasi
    lines = raw.strip().splitlines()
    isu = lines[0].removeprefix("ISU:").strip() if lines else state.query
    narasi = "\n".join(lines[1:]).strip() if len(lines) > 1 else raw
    return NarasiOutput(isu=isu, narasi=narasi, key_points=[])
