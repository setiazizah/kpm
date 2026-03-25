"""Step 4: Revision — LLM-based document drafting."""

import time
from typing import Optional

from prefect import task, get_run_logger

from ..state import WorkflowState
from ..fallback.llm_client import get_llm_client
from ..fallback.prompt_templates import load_template
from .base import make_meta


@task(
    name="revision",
    retries=2,
    retry_delay_seconds=[2, 4],
    timeout_seconds=120,
)
async def revision_task(state: WorkflowState, user_edits: Optional[str] = None) -> WorkflowState:
    """Merge narasi + stratkom into a polished draft using LLM."""
    logger = get_run_logger()
    logger.info("Step 4 — Revision | session=%s", state.session_id)
    start = time.monotonic()

    if not state.narasi_output or not state.stratkom_output:
        raise ValueError("narasi_output and stratkom_output are required for revision step")

    try:
        draft = await _revise(state, user_edits)
        meta = make_meta(start)
        logger.info("Revision OK — %d chars", len(draft))
        return state.with_revision(draft, meta)

    except ValueError:
        raise
    except Exception as exc:
        logger.warning("LLM revision failed (%s) — using concat fallback", exc)
        draft = _concat_fallback(state, user_edits)
        meta = make_meta(start, fallback_used=True)
        return state.with_revision(draft, meta)


async def _revise(state: WorkflowState, user_edits: Optional[str]) -> str:
    llm = get_llm_client()
    narasi = state.narasi_output
    stratkom = state.stratkom_output
    prompt = load_template("revision").format(
        isu=narasi.isu,
        narasi=narasi.narasi,
        key_points="\n".join(f"- {kp}" for kp in narasi.key_points),
        strategi=stratkom.strategi,
        pesan_utama=stratkom.pesan_utama,
        rekomendasi="\n".join(f"- {r}" for r in stratkom.rekomendasi),
        user_edits=user_edits or "(tidak ada revisi dari pengguna)",
        channel=state.channel,
        tone=state.tone,
    )
    return await llm.generate(prompt, max_tokens=2048)


def _concat_fallback(state: WorkflowState, user_edits: Optional[str]) -> str:
    n = state.narasi_output
    s = state.stratkom_output
    parts = [
        f"NARASI ISU: {n.isu}",
        "",
        n.narasi,
        "",
        "POIN KUNCI:",
        *[f"  • {kp}" for kp in n.key_points],
        "",
        f"STRATEGI KOMUNIKASI: {s.strategi}",
        f"PESAN UTAMA: {s.pesan_utama}",
        "",
        "REKOMENDASI:",
        *[f"  • {r}" for r in s.rekomendasi],
    ]
    if user_edits:
        parts += ["", f"CATATAN REVISI: {user_edits}"]
    return "\n".join(parts)
