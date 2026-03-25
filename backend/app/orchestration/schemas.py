from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Requests ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    session_id: str
    user_id: str = "anonymous"
    query: str
    channel: str = "press"   # press | social | internal
    tone: str = "formal"     # formal | semi-formal | informal


class GenerateStratkomRequest(BaseModel):
    session_id: str


class ReviseRequest(BaseModel):
    session_id: str
    export_format: str = "docx"    # docx | pdf
    user_edits: Optional[str] = None


# ── Shared sub-models ─────────────────────────────────────────────────────────

class RetrievedDocSchema(BaseModel):
    doc_id: str
    content: str
    source: str
    score: float


class NarasiSchema(BaseModel):
    isu: str
    narasi: str
    key_points: List[str]


class StratkomSchema(BaseModel):
    strategi: str
    pesan_utama: str
    rekomendasi: List[str]


class StepMetaSchema(BaseModel):
    status: str
    latency_ms: int
    fallback_used: bool


# ── Responses ─────────────────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    status: str
    session_id: str
    narasi: Optional[NarasiSchema] = None
    retrieved_docs: List[RetrievedDocSchema] = Field(default_factory=list)
    step_meta: Dict[str, StepMetaSchema] = Field(default_factory=dict)


class GenerateStratkomResponse(BaseModel):
    status: str
    session_id: str
    stratkom: Optional[StratkomSchema] = None
    step_meta: Dict[str, StepMetaSchema] = Field(default_factory=dict)


class ReviseResponse(BaseModel):
    status: str
    session_id: str
    revised_draft: Optional[str] = None
    export_url: Optional[str] = None
    step_meta: Dict[str, StepMetaSchema] = Field(default_factory=dict)
