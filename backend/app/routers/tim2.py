"""
mock_tim2.py
------------
Router FastAPI yang mensimulasikan API Tim 2 (Model Narasi Isu).
Semua endpoint di-prefix dengan /mock/v1 agar tidak bentrok
dengan endpoint real nanti.

Endpoint yang tersedia:
  GET  /mock/v1/tim2/models
  GET  /mock/v1/tim2/models/{model_id}
  POST /mock/v1/tim2/completions       ← pipeline utama RAG → Tim 2
  POST /mock/v1/tim2/chat/completions  ← mode chatbot agentic
"""

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.mocks.mock_responses import (
    mock_tim2_completions,
    mock_tim2_chat_completions,
    mock_models_tim2,
)

router = APIRouter(prefix="/mock/v1/tim2", tags=["Mock — Tim 2 Narasi Isu"])


# ---------------------------------------------------------------------------
# Schema request
# ---------------------------------------------------------------------------

class ContextItem(BaseModel):
    type: str = Field(..., description="'id' | 'url' | 'text'")
    value: str

class CompletionRequest(BaseModel):
    model: str = "indo-sft-v1"
    prompt: str
    context: list[ContextItem] = []
    max_tokens: int = 400
    temperature: float = 0.7
    stream: bool = False

class Message(BaseModel):
    role: str   # system | user | assistant
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = "indo-sft-v1"
    messages: list[Message]
    context: list[ContextItem] = []
    max_tokens: int = 400
    temperature: float = 0.6
    stream: bool = False


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/models", summary="List model Tim 2 yang tersedia")
def list_models():
    """
    Dipanggil saat startup Tim 4 untuk mendapatkan model ID aktif.
    Simpan 'indo-sft-v1' di config/env.
    """
    return mock_models_tim2()


@router.get("/models/{model_id}", summary="Detail model Tim 2")
def get_model(model_id: str):
    if model_id != "indo-sft-v1":
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
        "id": "indo-sft-v1",
        "object": "model",
        "created": 1709420000,
        "owned_by": "tim2-narasi",
        "capabilities": ["chat", "text-completion"],
    }


@router.post("/completions", summary="Analisis narasi isu (pipeline utama)")
def text_completions(req: CompletionRequest):
    """
    Endpoint utama pipeline RAG → Tim 2.

    Tim 4 kirim:
    - prompt: instruksi analisis
    - context[]: chunk dari Qdrant dalam format {type, value}

    Tim 4 terima:
    - choices[0].text: narasi isu hasil analisis
    - context_used: context yang dipakai model
    - _mock_meta: data terstruktur (issue_summary, sentiment, dll) — BONUS
    """
    ctx_list = [c.model_dump() for c in req.context]
    return mock_tim2_completions(
        prompt=req.prompt,
        context=ctx_list,
        max_tokens=req.max_tokens,
    )


@router.post("/chat/completions", summary="Chatbot agentic multi-turn")
def chat_completions(req: ChatCompletionRequest):
    """
    Endpoint chatbot — dipakai fitur 'Tanya Isu' di frontend MVP.
    Berbeda dari /completions: response ada di choices[0].message.content
    """
    msgs = [m.model_dump() for m in req.messages]
    return mock_tim2_chat_completions(
        messages=msgs,
        max_tokens=req.max_tokens,
    )
