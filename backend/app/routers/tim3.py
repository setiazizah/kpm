"""
mock_tim3.py
------------
Router FastAPI yang mensimulasikan API Tim 3 (Model Strategi Komunikasi).

Endpoint yang tersedia:
  GET  /mock/v1/tim3/models
  POST /mock/v1/tim3/chat/completions   ← generate strategi komunikasi
  GET  /mock/v1/tim3/crawlers/status    ← status corpus regulasi
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.mocks.mock_responses import (
    mock_tim3_chat_completions,
    mock_models_tim3,
)

router = APIRouter(prefix="/mock/v1/tim3", tags=["Mock — Tim 3 Strategi Komunikasi"])


# ---------------------------------------------------------------------------
# Schema request
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = "team3-comm-strategy-sft-v1"
    messages: list[Message]
    temperature: float = 0.3
    max_tokens: int = 1500
    stream: bool = False


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/models", summary="List model Tim 3 yang tersedia")
def list_models():
    """
    Dipanggil saat startup Tim 4.
    Simpan 'team3-comm-strategy-sft-v1' di config/env.
    """
    return mock_models_tim3()


@router.get("/models/{model_id}", summary="Detail model Tim 3")
def get_model(model_id: str):
    if model_id != "team3-comm-strategy-sft-v1":
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "message": f"Model '{model_id}' not found",
                    "type": "model_not_found",
                    "param": "model",
                    "code": "model_not_found",
                }
            },
        )
    return {
        "id": "team3-comm-strategy-sft-v1",
        "object": "model",
        "created": 1709425000,
        "owned_by": "tim3-stratkom",
        "capabilities": ["chat"],
        "description": "Model SFT untuk penyusunan strategi komunikasi pemerintah.",
    }


@router.post("/chat/completions", summary="Generate strategi komunikasi")
def chat_completions(req: ChatCompletionRequest):
    """
    Endpoint utama Tim 3.

    Tim 4 kirim messages[] dengan format:
    - system: instruksi sebagai asisten penyusun kebijakan
    - user: narasi isu dari Tim 2 (issue_summary, kategori, sentimen, risiko)

    Tim 4 terima:
    - choices[0].message.content: teks strategi dalam format Markdown
    - citations.regulations: referensi dasar hukum
    - citations.press_statements: siaran pers terkait (kosong di mock)
    """
    msgs = [m.model_dump() for m in req.messages]
    return mock_tim3_chat_completions(
        messages=msgs,
        max_tokens=req.max_tokens,
    )


@router.get("/crawlers/status", summary="Status corpus regulasi Tim 3")
def crawlers_status():
    """
    Tim 4 bisa cek apakah corpus hukum Tim 3 sudah up-to-date
    sebelum generate stratkom.
    """
    return {
        "status": "ok",
        "crawlers": [
            {
                "name": "regulasi-peraturan-pemerintah",
                "last_run": "2026-03-31T00:00:00Z",
                "documents_indexed": 1842,
                "status": "idle",
            },
            {
                "name": "regulasi-perpres",
                "last_run": "2026-03-31T00:00:00Z",
                "documents_indexed": 654,
                "status": "idle",
            },
            {
                "name": "siaran-pers-kominfo",
                "last_run": "2026-04-01T06:00:00Z",
                "documents_indexed": 320,
                "status": "idle",
            },
        ],
        "corpus_last_updated": "2026-04-01T06:00:00Z",
        "note": "Mock data — corpus regulasi real tersedia saat Tim 3 sudah deploy.",
    }
