"""
ingestion.py
------------
Celery task untuk ingestion data dari PostgreSQL (Tim 1) ke Qdrant.
Versi update: sinkron dengan schema Tim 1 (success flag) + safe handling.
"""

import logging
from app.celery_app import celery
from app.services.qdrant_service import setup_collection, upsert_batch, collection_info

logger = logging.getLogger(__name__)

# Ukuran chunk
CHUNK_SIZE    = 1500
CHUNK_OVERLAP = 200


# ---------------------------------------------------------------------------
# Helper: chunking teks
# ---------------------------------------------------------------------------

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start  = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks


# ---------------------------------------------------------------------------
# Task utama
# ---------------------------------------------------------------------------

@celery.task(name="tasks.ingest_new_content", bind=True, max_retries=3)
def ingest_new_content(self):
    try:
        import psycopg
        from psycopg.rows import dict_row
        from app.core.settings import DATABASE_URL

        logger.info("🚀 Ingestion task started...")

        # Pastikan collection ada
        setup_collection()

        # -------------------------
        # Ambil data dari PostgreSQL Tim 1
        # -------------------------
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("""
                    SELECT content_id, raw_text, keyword_refs,
                           taxonomy_category, publish_date, url_source, platform
                    FROM raw_content
                    WHERE raw_text IS NOT NULL
                      AND success = true
                    LIMIT 100
                """)
                rows = cur.fetchall()

        if not rows:
            logger.info("✅ Tidak ada konten baru untuk di-embed.")
            return {"status": "ok", "embedded": 0}

        logger.info(f"📦 Ditemukan {len(rows)} konten baru.")

        # -------------------------
        # Processing
        # -------------------------
        all_chunks = []
        content_ids_processed = []

        for row in rows:
            try:
                content_id   = row["content_id"]
                raw_text     = row["raw_text"]
                keywords     = row["keyword_refs"]
                category     = row["taxonomy_category"]
                publish_date = row["publish_date"]
                url          = row["url_source"]
                platform     = row["platform"]

                if not raw_text:
                    continue

                text_chunks = chunk_text(raw_text)

                for i, chunk_text_str in enumerate(text_chunks):
                    all_chunks.append({
                        "text"          : chunk_text_str,
                        "content_id"    : content_id,
                        "chunk_index"   : i,
                        "keywords"      : keywords or [],
                        "issue_category": category or "",
                        "issue_summary" : "",
                        "sentiment"     : "",
                        "published_at"  : str(publish_date) if publish_date else "",
                        "region"        : "nasional",
                        "source_url"    : url or "",
                        "platform"      : platform or "",
                    })

                content_ids_processed.append(content_id)

            except Exception as row_err:
                logger.error(f"❌ Error processing row: {row_err} | row={row}")
                continue

        # -------------------------
        # Upsert ke Qdrant
        # -------------------------
        if all_chunks:
            upsert_batch(all_chunks)
        else:
            logger.warning("⚠️ Tidak ada chunk yang dibuat.")
            return {"status": "ok", "embedded": 0}

        # -------------------------
        # Update PostgreSQL — DIHAPUS
        # (kolom 'embedded' tidak ada di schema Tim 1)
        # -------------------------

        # -------------------------
        # Info hasil
        # -------------------------
        info = collection_info()

        result = {
            "status"        : "ok",
            "embedded"      : len(content_ids_processed),
            "chunks_created": len(all_chunks),
            "total_vectors" : info.get("total_vectors", 0),
        }

        logger.info(f"✅ Ingestion selesai: {result}")
        return result

    except Exception as exc:
        logger.error(f"🔥 Ingestion error: {exc}")
        raise self.retry(exc=exc, countdown=60)
