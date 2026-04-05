from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from app.services.orchestrator_service import run_pipeline
from app.services.qdrant_service import search_filtered, collection_info

router = APIRouter(prefix="/v1/workflow", tags=["Orchestrator"])


# ── Schemas ─────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    query          : str
    session_id     : Optional[str] = None
    top_k          : int           = 5
    issue_category : Optional[str] = None
    sentiment      : Optional[str] = None
    region         : Optional[str] = None

class GenerateStratkomRequest(BaseModel):
    session_id     : str
    issue_summary  : Optional[str] = None
    extra          : Optional[dict] = None

class ReviseRequest(BaseModel):
    session_id     : str
    user_edits     : Optional[str] = None

class ExportRequest(BaseModel):
    session_id     : str
    content_type   : Optional[str] = "stratkom"
    format         : Optional[str] = "pdf"


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/analyze", summary="Pipeline RAG penuh: Qdrant → Tim 2 → Tim 3")
def analyze(req: AnalyzeRequest):
    return run_pipeline(
        prompt=req.query,
        context=[],
        top_k=req.top_k,
        issue_category=req.issue_category,
        sentiment=req.sentiment,
        region=req.region,
    )


@router.post("/generate-stratkom", summary="Generate strategi komunikasi")
def generate_stratkom(req: GenerateStratkomRequest):
    # Jalankan pipeline dengan issue_summary sebagai prompt
    return run_pipeline(
        prompt=req.issue_summary or "Generate strategi komunikasi",
        context=[],
        top_k=3,
    )


@router.post("/revise", summary="Revisi draft stratkom")
def revise(req: ReviseRequest):
    return run_pipeline(
        prompt=req.user_edits or "Revisi strategi komunikasi",
        context=[],
        top_k=3,
    )


@router.post("/export", summary="Export hasil ke PDF/DOCX")
def export_content(req: ExportRequest):
    # Placeholder — export engine belum diimplementasi
    return {
        "session_id"  : req.session_id,
        "format"      : req.format,
        "status"      : "ok",
        "download_url": f"/v1/workflow/download/{req.session_id}.{req.format}",
        "message"     : "Export engine dalam pengembangan.",
    }


# ── Debug endpoints ──────────────────────────────────────────────────────────

@router.get("/search", summary="Debug: langsung search Qdrant")
def debug_search(
    query          : str           = Query(...),
    top_k          : int           = Query(5),
    issue_category : Optional[str] = Query(None),
    sentiment      : Optional[str] = Query(None),
    region         : Optional[str] = Query(None),
):
    try:
        results = search_filtered(
            query=query, top_k=top_k,
            issue_category=issue_category,
            sentiment=sentiment, region=region,
        )
        return {"query": query, "count": len(results), "results": results}
    except Exception as e:
        return {"error": str(e), "hint": "Pastikan Qdrant running di localhost:6333"}


@router.get("/qdrant/info", summary="Info jumlah vector di Qdrant")
def qdrant_status():
    try:
        return collection_info()
    except Exception as e:
        return {
            "error" : str(e),
            "hint"  : "Qdrant belum running atau collection belum dibuat.",
            "action": "Jalankan: python scripts/init_vector_db.py",
        }