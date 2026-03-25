"""Step 1: RAG Retrieval — Qdrant vector search."""

import os
import time
from typing import List

from prefect import task, get_run_logger

from ..state import RetrievedDoc, WorkflowState
from .base import make_meta, error_meta

QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "tim4_docs")
TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "5"))


@task(
    name="retrieval",
    retries=3,
    retry_delay_seconds=[1, 2, 4],
    timeout_seconds=30,
)
async def retrieval_task(state: WorkflowState) -> WorkflowState:
    """Retrieve relevant documents from Qdrant for the user query."""
    logger = get_run_logger()
    logger.info("Step 1 — Retrieval | session=%s query=%s", state.session_id, state.query[:80])
    start = time.monotonic()

    try:
        docs = await _search_qdrant(state.query)
        meta = make_meta(start)
        logger.info("Retrieval OK — %d docs", len(docs))
        return state.with_retrieval(docs, meta)

    except Exception as exc:
        logger.warning("Retrieval failed (%s) — using empty fallback", exc)
        meta = make_meta(start, fallback_used=True)
        return state.with_retrieval([], meta)


async def _search_qdrant(query: str) -> List[RetrievedDoc]:
    """Perform vector search. Falls back to [] on any error."""
    try:
        from qdrant_client import AsyncQdrantClient
        from qdrant_client.models import NamedVector

        client = AsyncQdrantClient(url=QDRANT_URL)
        # Simple text-based dummy embedding; replace with real encoder in prod.
        embedding = _dummy_embed(query)

        results = await client.search(
            collection_name=COLLECTION_NAME,
            query_vector=embedding,
            limit=TOP_K,
        )
        return [
            RetrievedDoc(
                doc_id=str(r.id),
                content=r.payload.get("content", ""),
                source=r.payload.get("source", "unknown"),
                score=float(r.score),
            )
            for r in results
        ]
    except Exception:
        raise


def _dummy_embed(text: str) -> List[float]:
    """Placeholder embedding. Replace with sentence-transformers or API call."""
    import hashlib
    digest = hashlib.sha256(text.encode()).digest()
    # 384-dim vector of floats in [0, 1]
    return [b / 255.0 for b in digest[:128]] * 3  # 384 dims
