"""
Pipeline utama Tim 4 (RAG + MVP):

  Step 1 — RETRIEVAL : Embed query → search Qdrant → ambil top-K chunks
  Step 2 — NARASI    : Kirim query + context ke Tim 2 → dapat narasi isu
  Step 3 — STRATKOM  : Kirim narasi ke Tim 3 → dapat strategi komunikasi
  Step 4 — RETURN    : Gabungkan hasil ke frontend
"""

import re
import uuid
import logging
from app.mocks.mock_responses import (
    mock_tim2_completions,
    mock_tim3_chat_completions,
)
from app.services.qdrant_service import search_filtered, setup_collection

logger = logging.getLogger(__name__)


def strip_markdown(text: str) -> str:
    """Bersihkan simbol markdown dari teks."""
    text = re.sub(r'#{1,3}\s*', '', text)        # hapus ##, ###
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text) # hapus **bold**
    text = re.sub(r'\*(.*?)\*', r'\1', text)      # hapus *italic*
    text = re.sub(r'\n{2,}', '\n', text)          # rapiin newline berlebih
    return text.strip()


def extract_key_points(stratkom: str) -> list[str]:
    """
    Ambil poin-poin dari teks stratkom.
    Skip baris heading (Strategi Utama, Key Messages, dll).
    """
    SKIP_HEADINGS = [
        "strategi utama", "key messages", "talking points",
        "channel", "timeline", "dasar hukum",
    ]

    points = []
    for line in stratkom.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        # Harus dimulai angka atau bullet
        if stripped[0] not in "0123456789-•*":
            continue
        # Bersihkan prefix angka/bullet
        clean = re.sub(r'\*\*(.*?)\*\*', r'\1', stripped)
        clean = clean.lstrip("0123456789.-• ").strip()
        # Skip kalau isinya heading
        if any(h in clean.lower() for h in SKIP_HEADINGS):
            continue
        if clean:
            points.append(clean)
        if len(points) == 5:
            break

    return points


def run_pipeline(
    prompt: str,
    context: list,
    top_k: int          = 5,
    issue_category      = None,
    sentiment           = None,
    region              = None,
    session_id: str     = None,
    channel: str        = "press",
    tone: str           = "formal",
) -> dict:

    sid = session_id or f"s-{uuid.uuid4().hex[:8]}"

    # ── Step 1: Tim 2 — Analisis Narasi Isu ─────────────────
    tim2_res    = mock_tim2_completions(prompt=prompt, context=context, max_tokens=400)
    narasi_text = tim2_res["choices"][0]["text"]
    meta        = tim2_res.get("_mock_meta", {})

    # ── Step 2: Tim 3 — Generate Stratkom ───────────────────
    messages = [
        {
            "role": "system",
            "content": (
                "Kamu adalah asisten penyusun kebijakan pemerintah Indonesia. "
                "Buatlah Strategi Komunikasi yang mencakup: Strategi Utama, "
                "Key Messages, Talking Points, Channel, Timeline, dan Dasar Hukum."
            ),
        },
        {
            "role": "user",
            "content": (
                f"[NARASI ISU]     {meta.get('issue_summary', '')}\n"
                f"[KATEGORI ISU]   {meta.get('issue_category', '-')}\n"
                f"[SENTIMEN]       {meta.get('dominant_sentiment', '-')}\n"
                f"[TINGKAT RISIKO] {meta.get('risk_level', '-')}\n"
                f"[TARGET AUDIENS] Masyarakat umum\n"
                f"[CHANNEL]        {channel}"
            ),
        },
    ]
    tim3_res  = mock_tim3_chat_completions(messages=messages, max_tokens=1500)
    stratkom  = tim3_res["choices"][0]["message"]["content"]
    citations = tim3_res.get("citations", {})

    # ── Mapping regulasi ─────────────────────────────────────
    regulasi = [
        {
            "nomor"  : r.get("title", ""),
            "judul"  : r.get("value", ""),
            "lembaga": "Pemerintah RI",
            "tahun"  : int(r["title"][-4:]) if r.get("title", "")[-4:].isdigit() else 0,
        }
        for r in citations.get("regulations", [])
    ]

    # ── Bersihkan teks & ambil key points ────────────────────
    narasi_clean = strip_markdown(narasi_text)
    key_points   = extract_key_points(stratkom)

    return {
        "status"    : "success",
        "session_id": sid,
        "narasi"    : {
            "isu"       : prompt,
            "narasi"    : narasi_clean,
            "key_points": key_points,
        },
        "stratkom"  : {
            "strategi"   : stratkom,
            "pesan_utama": meta.get("issue_summary", ""),
            "rekomendasi": key_points,
        },
        "retrieved_docs": [],
        "regulasi"      : regulasi,
        "export_url"    : None,
        "step_meta"     : {
            "tim2": {"status": "ok", "latency_ms": None, "fallback_used": False},
            "tim3": {"status": "ok", "latency_ms": None, "fallback_used": False},
        },
        "message": None,
    }