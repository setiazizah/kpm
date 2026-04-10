"""
qdrant_service.py
-----------------
Semua operasi ke Qdrant ada di sini:
  1. setup_collection() — buat collection kalau belum ada
  2. upsert_chunk()     — simpan 1 chunk ke Qdrant
  3. upsert_batch()     — simpan banyak chunk sekaligus (efisien)
  4. search()           — semantic search: cari chunk paling relevan
  5. search_filtered()  — search + filter kategori/sentimen/region

Collection : vector_chunks
Dimensi    : 384 (multilingual-e5-small)
Distance   : Cosine
"""

import os
import uuid
import logging
from typing import Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.services.embedder import embed_passage, embed_text, embed_batch, EMBEDDING_DIM

logger = logging.getLogger(__name__)

QDRANT_URL      = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "vector_chunks"

_client: Optional[QdrantClient] = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=QDRANT_URL)
    return _client


# ---------------------------------------------------------------------------
# 1. Setup collection
# ---------------------------------------------------------------------------

def setup_collection(recreate: bool = False):
    """
    Buat collection 'vector_chunks' kalau belum ada.
    Set recreate=True untuk reset semua data (hati-hati!).
    """
    client   = get_client()
    existing = [c.name for c in client.get_collections().collections]

    if COLLECTION_NAME in existing:
        if recreate:
            client.delete_collection(COLLECTION_NAME)
            logger.info(f"Collection '{COLLECTION_NAME}' dihapus.")
        else:
            logger.info(f"Collection '{COLLECTION_NAME}' sudah ada, skip setup.")
            return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=qmodels.VectorParams(
            size=EMBEDDING_DIM,
            distance=qmodels.Distance.COSINE,
        ),
    )

    # Index untuk filter metadata yang sering dipakai
    for field in ["issue_category", "sentiment", "region", "platform"]:
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name=field,
            field_schema=qmodels.PayloadSchemaType.KEYWORD,
        )

    logger.info(f"Collection '{COLLECTION_NAME}' berhasil dibuat (dim={EMBEDDING_DIM}).")
    print(f"Collection '{COLLECTION_NAME}' siap.")


# ---------------------------------------------------------------------------
# 2. Upsert satu chunk
# ---------------------------------------------------------------------------

def upsert_chunk(
    text: str,
    content_id: int,
    chunk_index: int        = 0,
    keywords: list[str]     = [],
    issue_category: str     = "",
    issue_summary: str      = "",
    sentiment: str          = "",
    published_at: str       = "",
    region: str             = "nasional",
    source_url: str         = "",
    platform: str           = "",
):
    """Embed satu chunk teks dan simpan ke Qdrant."""
    client = get_client()
    vector = embed_passage(text)

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            qmodels.PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "content_id"    : content_id,
                    "chunk_index"   : chunk_index,
                    "text"          : text,
                    "keywords"      : keywords,
                    "issue_category": issue_category,
                    "issue_summary" : issue_summary,
                    "sentiment"     : sentiment,
                    "published_at"  : published_at,
                    "region"        : region,
                    "source_url"    : source_url,
                    "platform"      : platform,
                },
            )
        ],
    )
    logger.debug(f"Upsert OK: content_id={content_id} chunk={chunk_index}")


# ---------------------------------------------------------------------------
# 3. Upsert batch (efisien untuk banyak data)
# ---------------------------------------------------------------------------

def upsert_batch(chunks: list[dict]):
    """
    Embed dan simpan banyak chunk sekaligus.
    chunks: list of dict, tiap dict punya key sama seperti upsert_chunk().
    """
    if not chunks:
        return

    client  = get_client()
    texts   = [c["text"] for c in chunks]
    vectors = embed_batch(texts, is_query=False)

    points = [
        qmodels.PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "content_id"    : c.get("content_id"),
                "chunk_index"   : c.get("chunk_index", 0),
                "text"          : c["text"],
                "keywords"      : c.get("keywords", []),
                "issue_category": c.get("issue_category", ""),
                "issue_summary" : c.get("issue_summary", ""),
                "sentiment"     : c.get("sentiment", ""),
                "published_at"  : c.get("published_at", ""),
                "region"        : c.get("region", "nasional"),
                "source_url"    : c.get("source_url", ""),
                "platform"      : c.get("platform", ""),
            },
        )
        for c, vector in zip(chunks, vectors)
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)
    logger.info(f"Upsert batch OK: {len(points)} chunks.")


# ---------------------------------------------------------------------------
# 4. Semantic search
# ---------------------------------------------------------------------------

def search(query: str, top_k: int = 5) -> list[dict]:
    """
    Cari chunk paling relevan berdasarkan query teks.

    Returns:
        list of dict: [{ score, text, content_id, issue_category, ... }]
    """
    client       = get_client()
    query_vector = embed_text(query)

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )

    return [
        {
            "score"         : round(r.score, 4),
            "text"          : r.payload.get("text", ""),
            "content_id"    : r.payload.get("content_id"),
            "chunk_index"   : r.payload.get("chunk_index", 0),
            "issue_category": r.payload.get("issue_category", ""),
            "sentiment"     : r.payload.get("sentiment", ""),
            "region"        : r.payload.get("region", ""),
            "source_url"    : r.payload.get("source_url", ""),
            "published_at"  : r.payload.get("published_at", ""),
            "keywords"      : r.payload.get("keywords", []),
        }
        for r in results
    ]


# ---------------------------------------------------------------------------
# 5. Search dengan filter metadata
# ---------------------------------------------------------------------------

def search_filtered(
    query: str,
    top_k: int                       = 5,
    issue_category: Optional[str]    = None,
    sentiment: Optional[str]         = None,
    region: Optional[str]            = None,
) -> list[dict]:
    """
    Semantic search + filter metadata.

    Contoh:
        search_filtered("BBM naik", issue_category="ekonomi", sentiment="negatif")
    """
    client       = get_client()
    query_vector = embed_text(query)

    # Bangun filter kondisi
    conditions = []
    if issue_category:
        conditions.append(
            qmodels.FieldCondition(
                key="issue_category",
                match=qmodels.MatchValue(value=issue_category),
            )
        )
    if sentiment:
        conditions.append(
            qmodels.FieldCondition(
                key="sentiment",
                match=qmodels.MatchValue(value=sentiment),
            )
        )
    if region:
        conditions.append(
            qmodels.FieldCondition(
                key="region",
                match=qmodels.MatchValue(value=region),
            )
        )

    query_filter = qmodels.Filter(must=conditions) if conditions else None

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=query_filter,
        limit=top_k,
        with_payload=True,
    )

    return [
        {
            "score"         : round(r.score, 4),
            "text"          : r.payload.get("text", ""),
            "content_id"    : r.payload.get("content_id"),
            "issue_category": r.payload.get("issue_category", ""),
            "sentiment"     : r.payload.get("sentiment", ""),
            "region"        : r.payload.get("region", ""),
            "source_url"    : r.payload.get("source_url", ""),
            "published_at"  : r.payload.get("published_at", ""),
            "keywords"      : r.payload.get("keywords", []),
        }
        for r in results
    ]


# ---------------------------------------------------------------------------
# 6. Info collection (debugging)
# ---------------------------------------------------------------------------

def collection_info() -> dict:
    """Lihat jumlah vector dan status collection."""
    client = get_client()
    info   = client.get_collection(COLLECTION_NAME)
    return {
        "collection"   : COLLECTION_NAME,
        "total_vectors": info.points_count,
        "dimension"    : EMBEDDING_DIM,
        "status"       : info.status,
    }
