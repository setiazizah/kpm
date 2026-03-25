"""Step 3: StratKom — calls Tim 3 API, falls back to local LLM."""

import os
import time

import httpx
from prefect import task, get_run_logger

from ..state import StratkomOutput, WorkflowState
from ..fallback.llm_client import get_llm_client
from ..fallback.prompt_templates import load_template
from .base import make_meta

TIM3_URL = os.getenv("TIM3_STRATKOM_URL", "http://host.docker.internal:9003/api/v1/generate-stratkom")
TIMEOUT = float(os.getenv("TIM3_TIMEOUT_SECONDS", "60"))


@task(
    name="stratkom",
    retries=3,
    retry_delay_seconds=[1, 2, 4],
    timeout_seconds=90,
)
async def stratkom_task(state: WorkflowState) -> WorkflowState:
    """Call Tim 3 for communication strategy generation."""
    logger = get_run_logger()
    logger.info("Step 3 — StratKom | session=%s", state.session_id)
    start = time.monotonic()

    if not state.narasi_output:
        raise ValueError("narasi_output is required for stratkom step")

    try:
        stratkom = await _call_tim3(state)
        meta = make_meta(start)
        logger.info("StratKom OK")
        return state.with_stratkom(stratkom, meta)

    except ValueError:
        raise  # logic errors are not retried
    except Exception as exc:
        logger.warning("Tim 3 failed (%s) — using local LLM fallback", exc)
        stratkom = await _fallback_stratkom(state)
        meta = make_meta(start, fallback_used=True)
        return state.with_stratkom(stratkom, meta)


async def _call_tim3(state: WorkflowState) -> StratkomOutput:
    narasi = state.narasi_output
    payload = {
        "isu": narasi.isu,
        "narasi": narasi.narasi,
        "key_points": narasi.key_points,
        "channel": state.channel,
        "tone": state.tone,
    }
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(TIM3_URL, json=payload)
        resp.raise_for_status()
        data = resp.json()

    return StratkomOutput(
        strategi=data.get("strategi", ""),
        pesan_utama=data.get("pesan_utama", ""),
        rekomendasi=data.get("rekomendasi", []),
    )


async def _fallback_stratkom(state: WorkflowState) -> StratkomOutput:
    llm = get_llm_client()
    narasi = state.narasi_output
    prompt = load_template("stratkom_fallback").format(
        isu=narasi.isu,
        narasi=narasi.narasi,
        key_points="\n".join(f"- {kp}" for kp in narasi.key_points),
        channel=state.channel,
        tone=state.tone,
    )
    raw = await llm.generate(prompt)
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    return StratkomOutput(
        strategi=lines[0] if lines else "Komunikasi proaktif",
        pesan_utama=lines[1] if len(lines) > 1 else "Pemerintah hadir untuk masyarakat",
        rekomendasi=lines[2:] if len(lines) > 2 else [],
    )
