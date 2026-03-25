"""Prefect workflow engine — three public flows exposed to the API.

    analyze_flow          → Step 1 (Retrieval) + Step 2 (Narasi)
    generate_stratkom_flow → Step 3 (StratKom)
    revise_flow           → Step 4 (Revision) + Step 5 (Export)

Each flow loads/saves WorkflowState via the Redis session store so that the
3-endpoint API pattern (analyze → generate-stratkom → revise) works across
separate HTTP requests.
"""

from __future__ import annotations

from prefect import flow, get_run_logger

from .hooks.pre_step import AuthPreHook, LoggingPreHook, QuotaPreHook
from .hooks.post_step import LoggingPostHook, MonitoringPostHook
from .schemas import AnalyzeRequest, GenerateStratkomRequest, ReviseRequest
from .session_store import load_state, save_state
from .state import WorkflowState
from .steps.retrieval_step import retrieval_task
from .steps.narasi_step import narasi_task
from .steps.stratkom_step import stratkom_task
from .steps.revision_step import revision_task
from .steps.export_step import export_task

_log_pre = LoggingPreHook()
_auth_pre = AuthPreHook()
_quota_pre = QuotaPreHook()
_log_post = LoggingPostHook()
_monitor_post = MonitoringPostHook()


# ── Flow 1: Analyze ────────────────────────────────────────────────────────────

@flow(
    name="analyze-workflow",
    description="Step 1 (Retrieval) + Step 2 (Narasi)",
)
async def analyze_flow(request: AnalyzeRequest) -> WorkflowState:
    logger = get_run_logger()

    # Pre-hooks
    _auth_pre.run(user_id=request.user_id, session_id=request.session_id)
    _quota_pre.run(session_id=request.session_id)
    _log_pre.run("analyze", request.session_id, request.query)

    state = WorkflowState(
        session_id=request.session_id,
        user_id=request.user_id,
        query=request.query,
        channel=request.channel,
        tone=request.tone,
    )

    # Step 1 — Retrieval (Prefect task with built-in retry)
    state = await retrieval_task(state)
    _emit_post_hooks(state, "retrieval")

    # Step 2 — Narasi
    state = await narasi_task(state)
    _emit_post_hooks(state, "narasi")

    await save_state(state)
    logger.info("analyze_flow complete — session=%s status=%s", state.session_id, state.overall_status())
    return state


# ── Flow 2: Generate StratKom ──────────────────────────────────────────────────

@flow(
    name="generate-stratkom-workflow",
    description="Step 3 (StratKom)",
)
async def generate_stratkom_flow(request: GenerateStratkomRequest) -> WorkflowState:
    logger = get_run_logger()

    state = await load_state(request.session_id)
    if state is None:
        raise ValueError(f"Session not found: {request.session_id}. Run /analyze first.")

    _quota_pre.run(session_id=request.session_id)
    _log_pre.run("generate-stratkom", request.session_id)

    # Step 3 — StratKom
    state = await stratkom_task(state)
    _emit_post_hooks(state, "stratkom")

    await save_state(state)
    logger.info("generate_stratkom_flow complete — session=%s", state.session_id)
    return state


# ── Flow 3: Revise + Export ────────────────────────────────────────────────────

@flow(
    name="revise-workflow",
    description="Step 4 (Revision) + Step 5 (Export)",
)
async def revise_flow(request: ReviseRequest) -> WorkflowState:
    logger = get_run_logger()

    state = await load_state(request.session_id)
    if state is None:
        raise ValueError(f"Session not found: {request.session_id}. Run /analyze and /generate-stratkom first.")

    _quota_pre.run(session_id=request.session_id)
    _log_pre.run("revise", request.session_id)

    # Step 4 — Revision
    state = await revision_task(state, user_edits=request.user_edits)
    _emit_post_hooks(state, "revision")

    # Step 5 — Export
    state = await export_task(state, export_format=request.export_format)
    _emit_post_hooks(state, "export")

    await save_state(state)
    logger.info("revise_flow complete — session=%s export_url=%s", state.session_id, state.export_url)
    return state


# ── Full pipeline (batch) ──────────────────────────────────────────────────────

@flow(
    name="full-pipeline",
    description="All 5 steps in sequence",
)
async def full_pipeline_flow(request: AnalyzeRequest, export_format: str = "docx") -> WorkflowState:
    """Convenience flow that runs all steps in one shot."""
    state = await analyze_flow(request)
    stratkom_req = GenerateStratkomRequest(session_id=request.session_id)
    state = await generate_stratkom_flow(stratkom_req)
    revise_req = ReviseRequest(
        session_id=request.session_id,
        export_format=export_format,
    )
    state = await revise_flow(revise_req)
    return state


# ── Helper ─────────────────────────────────────────────────────────────────────

def _emit_post_hooks(state: WorkflowState, step_name: str) -> None:
    meta = state.step_statuses.get(step_name)
    if meta:
        _log_post.run(step_name, state.session_id, meta.status, meta.latency_ms)
        _monitor_post.run(step_name, meta.status, meta.latency_ms, meta.fallback_used)
