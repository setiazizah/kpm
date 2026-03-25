from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RetrievedDoc(BaseModel):
    doc_id: str
    content: str
    source: str
    score: float


class NarasiOutput(BaseModel):
    isu: str
    narasi: str
    key_points: List[str] = Field(default_factory=list)


class StratkomOutput(BaseModel):
    strategi: str
    pesan_utama: str
    rekomendasi: List[str] = Field(default_factory=list)


class StepMeta(BaseModel):
    status: str  # success | error | fallback
    latency_ms: int
    fallback_used: bool


class WorkflowState(BaseModel, frozen=True):
    """Immutable state container — new instance created after each step."""

    session_id: str
    user_id: str
    query: str
    channel: str  # press | social | internal
    tone: str  # formal | semi-formal | informal

    retrieved_docs: Optional[List[RetrievedDoc]] = None
    narasi_output: Optional[NarasiOutput] = None
    stratkom_output: Optional[StratkomOutput] = None
    revised_draft: Optional[str] = None
    export_url: Optional[str] = None

    step_statuses: Dict[str, StepMeta] = Field(default_factory=dict)

    def with_retrieval(
        self, docs: List[RetrievedDoc], meta: StepMeta
    ) -> "WorkflowState":
        return self.model_copy(
            update={
                "retrieved_docs": docs,
                "step_statuses": {**self.step_statuses, "retrieval": meta},
            }
        )

    def with_narasi(self, narasi: NarasiOutput, meta: StepMeta) -> "WorkflowState":
        return self.model_copy(
            update={
                "narasi_output": narasi,
                "step_statuses": {**self.step_statuses, "narasi": meta},
            }
        )

    def with_stratkom(
        self, stratkom: StratkomOutput, meta: StepMeta
    ) -> "WorkflowState":
        return self.model_copy(
            update={
                "stratkom_output": stratkom,
                "step_statuses": {**self.step_statuses, "stratkom": meta},
            }
        )

    def with_revision(self, draft: str, meta: StepMeta) -> "WorkflowState":
        return self.model_copy(
            update={
                "revised_draft": draft,
                "step_statuses": {**self.step_statuses, "revision": meta},
            }
        )

    def with_export(self, url: Optional[str], meta: StepMeta) -> "WorkflowState":
        return self.model_copy(
            update={
                "export_url": url,
                "step_statuses": {**self.step_statuses, "export": meta},
            }
        )

    def overall_status(self) -> str:
        """Compute overall workflow status from step metas."""
        if not self.step_statuses:
            return "error"
        statuses = [m.status for m in self.step_statuses.values()]
        if all(s == "success" for s in statuses):
            return "success"
        if any(s == "error" for s in statuses):
            return "error"
        return "partial"

    def serialize(self) -> Dict[str, Any]:
        return self.model_dump(mode="json")

    @classmethod
    def deserialize(cls, data: Dict[str, Any]) -> "WorkflowState":
        return cls.model_validate(data)
