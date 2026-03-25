"""FastAPI route handlers for the workflow orchestration API."""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, status

from ..orchestration import (
    AnalyzeRequest,
    AnalyzeResponse,
    GenerateStratkomRequest,
    GenerateStratkomResponse,
    ReviseRequest,
    ReviseResponse,
    analyze_flow,
    generate_stratkom_flow,
    revise_flow,
)
from ..orchestration.schemas import StepMetaSchema
from ..orchestration.session_store import load_state
from ..orchestration.state import WorkflowState

router = APIRouter(prefix="/v1/workflow", tags=["workflow"])


def _step_meta_dict(state: WorkflowState) -> Dict[str, StepMetaSchema]:
    return {
        k: StepMetaSchema(**v.model_dump())
        for k, v in state.step_statuses.items()
    }


# ── POST /v1/workflow/analyze ─────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """Step 1 + Step 2: retrieve docs and generate narasi."""
    try:
        state = await analyze_flow(req)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    narasi_data = None
    if state.narasi_output:
        from ..orchestration.schemas import NarasiSchema
        narasi_data = NarasiSchema(**state.narasi_output.model_dump())

    docs = []
    if state.retrieved_docs:
        from ..orchestration.schemas import RetrievedDocSchema
        docs = [RetrievedDocSchema(**d.model_dump()) for d in state.retrieved_docs]

    return AnalyzeResponse(
        status=state.overall_status(),
        session_id=state.session_id,
        narasi=narasi_data,
        retrieved_docs=docs,
        step_meta=_step_meta_dict(state),
    )


# ── POST /v1/workflow/generate-stratkom ───────────────────────────────────────

@router.post("/generate-stratkom", response_model=GenerateStratkomResponse)
async def generate_stratkom(req: GenerateStratkomRequest) -> GenerateStratkomResponse:
    """Step 3: generate communication strategy from stored narasi."""
    try:
        state = await generate_stratkom_flow(req)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    stratkom_data = None
    if state.stratkom_output:
        from ..orchestration.schemas import StratkomSchema
        stratkom_data = StratkomSchema(**state.stratkom_output.model_dump())

    return GenerateStratkomResponse(
        status=state.overall_status(),
        session_id=state.session_id,
        stratkom=stratkom_data,
        step_meta=_step_meta_dict(state),
    )


# ── POST /v1/workflow/revise ──────────────────────────────────────────────────

@router.post("/revise", response_model=ReviseResponse)
async def revise(req: ReviseRequest) -> ReviseResponse:
    """Step 4 + Step 5: revise document and export."""
    try:
        state = await revise_flow(req)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return ReviseResponse(
        status=state.overall_status(),
        session_id=state.session_id,
        revised_draft=state.revised_draft,
        export_url=state.export_url,
        step_meta=_step_meta_dict(state),
    )


# ── POST /v1/workflow/run — full pipeline ─────────────────────────────────────

@router.post("/run")
async def run_full_pipeline(req: AnalyzeRequest, export_format: str = "docx") -> Dict[str, Any]:
    """Run all 5 steps in sequence (batch mode)."""
    from ..orchestration.engine import full_pipeline_flow

    try:
        state = await full_pipeline_flow(req, export_format=export_format)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return {
        "status": state.overall_status(),
        "session_id": state.session_id,
        "narasi": state.narasi_output.model_dump() if state.narasi_output else None,
        "stratkom": state.stratkom_output.model_dump() if state.stratkom_output else None,
        "revised_draft": state.revised_draft,
        "export_url": state.export_url,
        "step_meta": {k: v.model_dump() for k, v in state.step_statuses.items()},
    }


# ── GET /v1/workflow/{session_id}/status ──────────────────────────────────────

@router.get("/{session_id}/status")
async def get_status(session_id: str) -> Dict[str, Any]:
    """Poll current state of a workflow session."""
    state = await load_state(session_id)
    if state is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id!r} not found")

    completed_steps = list(state.step_statuses.keys())
    next_step = _next_step(completed_steps)

    return {
        "session_id": session_id,
        "status": state.overall_status(),
        "completed_steps": completed_steps,
        "next_step": next_step,
        "step_meta": {k: v.model_dump() for k, v in state.step_statuses.items()},
    }


def _next_step(completed: list) -> str | None:
    pipeline = ["retrieval", "narasi", "stratkom", "revision", "export"]
    for step in pipeline:
        if step not in completed:
            return step
    return None
