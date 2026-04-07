"""
Workflow API — Analisis Isu & Strategi Komunikasi via OpenRouter (free models).
Session disimpan in-memory (dict). Gunakan Redis/DB untuk produksi.
"""
import os
import time
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path

# Cari .env dari direktori backend ke atas (kpm/.env)
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_env_path if _env_path.exists() else None)

router = APIRouter(prefix="/v1/workflow", tags=["workflow"])

# ── Session store (in-memory) ─────────────────────────────────────────────────
_sessions: dict[str, dict] = {}

# ── OpenRouter config ─────────────────────────────────────────────────────────
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def _api_key() -> str:
    return os.getenv("OPENROUTER_API_KEY", "")

def _model() -> str:
    return os.getenv("OPENROUTER_MODEL", "google/gemma-3-4b-it:free")


# ── Schemas ───────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    session_id: str
    user_id: str = "anonymous"
    query: str
    channel: str = "press"
    tone: str = "formal"
    chat_history: list = []
    target_audience: Optional[str] = None

class GenerateStratkomRequest(BaseModel):
    session_id: str
    export_format: Optional[str] = "docx"

class ReviseRequest(BaseModel):
    session_id: str
    export_format: str = "docx"
    user_edits: Optional[str] = None

class ExportRequest(BaseModel):
    session_id: str
    content_type: str = "narasi"
    format: str = "docx"

class ChatRequest(BaseModel):
    session_id: str
    message: str
    chat_history: list = []


# ── Helpers ───────────────────────────────────────────────────────────────────

def _merge_system_to_user(messages: list[dict]) -> list[dict]:
    """
    Beberapa model free (Gemma, dll) tidak support role 'system'.
    Gabungkan system prompt ke pesan user pertama agar universal.
    """
    if not messages or messages[0].get("role") != "system":
        return messages
    system_content = messages[0]["content"]
    rest = messages[1:]
    merged = []
    inserted = False
    for msg in rest:
        if msg.get("role") == "user" and not inserted:
            merged.append({
                "role": "user",
                "content": f"[Instruksi Sistem]: {system_content}\n\n{msg['content']}",
            })
            inserted = True
        else:
            merged.append(msg)
    if not inserted:
        merged.insert(0, {"role": "user", "content": f"[Instruksi Sistem]: {system_content}"})
    return merged


async def call_openrouter(messages: list[dict], temperature: float = 0.7) -> tuple[str, int]:
    """Panggil OpenRouter dan kembalikan (teks_respons, latency_ms)."""
    api_key = _api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY belum diset di .env")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "KPM AITF Platform",
    }
    payload = {
        "model": _model(),
        "messages": _merge_system_to_user(messages),
        "temperature": temperature,
        "max_tokens": 1500,
    }

    t0 = time.time()
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(OPENROUTER_URL, headers=headers, json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"OpenRouter error: {resp.text}")
        data = resp.json()

    latency = int((time.time() - t0) * 1000)
    text = data["choices"][0]["message"]["content"]
    return text, latency


def _parse_json_block(text: str) -> dict:
    """Ekstrak JSON dari respons model (mungkin dibungkus markdown)."""
    import re
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    m2 = re.search(r"\{[\s\S]+\}", text)
    if m2:
        try:
            return json.loads(m2.group(0))
        except Exception:
            pass
    raise ValueError(f"Tidak bisa parse JSON dari: {text[:300]}")


# ── Endpoint: Analisis Isu ────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_issue(req: AnalyzeRequest):
    t_start = time.time()

    tone_desc = {
        "formal":      "bahasa formal, baku, dan profesional",
        "semi-formal": "bahasa semi-formal, lugas namun tetap sopan",
        "informal":    "bahasa santai dan mudah dipahami masyarakat umum",
    }.get(req.tone, "bahasa formal")

    channel_desc = {
        "press":    "press release / media massa",
        "social":   "media sosial (Twitter, Instagram, TikTok)",
        "internal": "komunikasi internal pemerintahan",
    }.get(req.channel, "press release")

    system_prompt = (
        "Kamu adalah analis komunikasi publik pemerintah Indonesia yang ahli dalam "
        "monitoring isu, analisis narasi, dan strategi komunikasi. "
        "Jawab HANYA dalam format JSON yang valid, tanpa teks tambahan di luar JSON."
    )

    user_prompt = f"""Analisis isu berikut untuk keperluan komunikasi publik pemerintah:

ISU: {req.query}
CHANNEL: {channel_desc}
TONE: {tone_desc}

Hasilkan analisis dalam format JSON berikut (isi dengan konten nyata, bukan placeholder):
{{
  "isu": "<judul ringkas isu>",
  "narasi": "<narasi counter atau klarifikasi 3-5 kalimat>",
  "key_points": ["<poin kunci 1>", "<poin kunci 2>", "<poin kunci 3>"]
}}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_prompt},
    ]

    try:
        raw, latency = await call_openrouter(messages)
        parsed = _parse_json_block(raw)
        narasi = {
            "isu":        parsed.get("isu", req.query),
            "narasi":     parsed.get("narasi", ""),
            "key_points": parsed.get("key_points", []),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "status":         "error",
            "session_id":     req.session_id,
            "narasi":         None,
            "retrieved_docs": [],
            "regulasi":       [],
            "export_url":     None,
            "step_meta":      {},
            "message":        f"Gagal analisis: {str(e)}",
        }

    _sessions[req.session_id] = {
        "user_id": req.user_id,
        "query":   req.query,
        "channel": req.channel,
        "tone":    req.tone,
        "narasi":  narasi,
        "stratkom": None,
    }

    total_latency = int((time.time() - t_start) * 1000)
    return {
        "status":         "success",
        "session_id":     req.session_id,
        "narasi":         narasi,
        "retrieved_docs": [],
        "regulasi":       [],
        "export_url":     None,
        "step_meta": {
            "narasi": {
                "status":        "success",
                "latency_ms":    total_latency,
                "fallback_used": False,
            }
        },
        "message": None,
    }


# ── Endpoint: Generate StratKom ───────────────────────────────────────────────

@router.post("/generate-stratkom")
async def generate_stratkom(req: GenerateStratkomRequest):
    sess = _sessions.get(req.session_id)
    if not sess:
        raise HTTPException(
            status_code=404,
            detail="Session tidak ditemukan. Lakukan analisis isu terlebih dahulu."
        )

    t_start = time.time()
    narasi  = sess.get("narasi", {})
    channel = sess.get("channel", "press")
    tone    = sess.get("tone", "formal")
    query   = sess.get("query", "")

    channel_desc = {
        "press":    "press release / konferensi pers",
        "social":   "media sosial (Twitter/Instagram/TikTok)",
        "internal": "komunikasi internal pemerintahan",
    }.get(channel, channel)

    system_prompt = (
        "Kamu adalah pakar strategi komunikasi publik pemerintah Indonesia. "
        "Jawab HANYA dalam format JSON yang valid."
    )

    user_prompt = f"""Berdasarkan analisis isu berikut, buat strategi komunikasi publik:

ISU: {query}
NARASI: {narasi.get('narasi', '')}
POIN KUNCI: {', '.join(narasi.get('key_points', []))}
CHANNEL: {channel_desc}
TONE: {tone}

Hasilkan strategi dalam format JSON berikut:
{{
  "strategi": "<satu kalimat pendekatan strategis utama>",
  "pesan_utama": "<pesan inti yang ingin disampaikan kepada publik>",
  "rekomendasi": [
    "<rekomendasi aksi konkret 1>",
    "<rekomendasi aksi konkret 2>",
    "<rekomendasi aksi konkret 3>",
    "<rekomendasi aksi konkret 4>"
  ]
}}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_prompt},
    ]

    try:
        raw, latency = await call_openrouter(messages)
        parsed = _parse_json_block(raw)
        stratkom = {
            "strategi":    parsed.get("strategi", ""),
            "pesan_utama": parsed.get("pesan_utama", ""),
            "rekomendasi": parsed.get("rekomendasi", []),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "status":     "error",
            "session_id": req.session_id,
            "stratkom":   None,
            "export_url": None,
            "step_meta":  {},
            "message":    f"Gagal generate stratkom: {str(e)}",
        }

    sess["stratkom"] = stratkom
    _sessions[req.session_id] = sess

    total_latency = int((time.time() - t_start) * 1000)
    return {
        "status":     "success",
        "session_id": req.session_id,
        "stratkom":   stratkom,
        "export_url": None,
        "step_meta": {
            "stratkom": {
                "status":        "success",
                "latency_ms":    total_latency,
                "fallback_used": False,
            }
        },
        "message": None,
    }


# ── Endpoint: Revisi Draft ────────────────────────────────────────────────────

@router.post("/revise")
async def revise(req: ReviseRequest):
    sess = _sessions.get(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan.")

    t_start  = time.time()
    narasi   = sess.get("narasi", {})
    stratkom = sess.get("stratkom", {})

    revisi_instruksi = req.user_edits or "Buat executive brief yang ringkas dan profesional"

    system_prompt = (
        "Kamu adalah penulis profesional dokumen komunikasi pemerintah Indonesia. "
        "Buat executive brief berdasarkan narasi dan stratkom yang diberikan."
    )

    user_prompt = f"""Buat executive brief berdasarkan:

ISU: {sess.get('query', '')}
NARASI: {narasi.get('narasi', '')}
STRATEGI: {stratkom.get('strategi', '') if stratkom else ''}
PESAN UTAMA: {stratkom.get('pesan_utama', '') if stratkom else ''}
REKOMENDASI: {'; '.join(stratkom.get('rekomendasi', [])) if stratkom else ''}

INSTRUKSI REVISI: {revisi_instruksi}

Tulis executive brief dalam 3-4 paragraf, bahasa Indonesia, formal dan profesional."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_prompt},
    ]

    try:
        raw, latency = await call_openrouter(messages, temperature=0.6)
        revised_draft = raw.strip()
    except HTTPException:
        raise
    except Exception as e:
        return {
            "status":        "error",
            "session_id":    req.session_id,
            "revised_draft": None,
            "export_url":    None,
            "step_meta":     {},
            "message":       f"Gagal revisi: {str(e)}",
        }

    sess["revised_draft"] = revised_draft
    _sessions[req.session_id] = sess

    total_latency = int((time.time() - t_start) * 1000)
    return {
        "status":        "success",
        "session_id":    req.session_id,
        "revised_draft": revised_draft,
        "export_url":    None,
        "step_meta": {
            "revise": {
                "status":        "success",
                "latency_ms":    total_latency,
                "fallback_used": False,
            }
        },
        "message": None,
    }


# ── Endpoint: Export (stub) ───────────────────────────────────────────────────

@router.post("/export")
async def export_content(req: ExportRequest):
    return {
        "status":       "success",
        "session_id":   req.session_id,
        "content_type": req.content_type,
        "format":       req.format,
        "export_url":   None,
        "message":      "Export belum tersedia, fitur sedang dikembangkan.",
    }


# ── Endpoint: Chat AI ─────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest):
    """Chat umum berbasis AI — digunakan oleh ChatbotPage."""
    sess = _sessions.get(req.session_id, {})

    system_prompt = (
        "Kamu adalah asisten cerdas KPM × AITF (Kehumasan dan Pemberitaan Masyarakat × AI Task Force) "
        "dari Kementerian Komunikasi dan Informatika Indonesia. "
        "Kamu membantu pengguna memahami platform monitoring isu publik, analisis narasi, "
        "strategi komunikasi, dan segala hal terkait KPM dan AITF. "
        "Jika ada konteks isu dari sesi, gunakan sebagai referensi. "
        "Jawab dalam Bahasa Indonesia yang jelas dan profesional. "
        "Jika ditanya tentang generate narasi atau stratkom, arahkan ke fitur 'Tanya Isu'."
    )

    history_msgs = []
    for h in req.chat_history[-6:]:
        role = h.get("role", "user")
        history_msgs.append({"role": role, "content": h.get("content", "")})

    context = ""
    if sess.get("narasi"):
        n = sess["narasi"]
        context = f"\n\n[Konteks sesi aktif — Isu: {n.get('isu', '')}, Narasi: {n.get('narasi', '')[:200]}...]"

    messages = [
        {"role": "system", "content": system_prompt + context},
        *history_msgs,
        {"role": "user", "content": req.message},
    ]

    try:
        reply, latency = await call_openrouter(messages, temperature=0.75)
    except HTTPException as e:
        return {
            "status":     "error",
            "reply":      f"Maaf, terjadi kesalahan: {e.detail}",
            "latency_ms": 0,
        }
    except Exception as e:
        return {
            "status":     "error",
            "reply":      f"Maaf, terjadi kesalahan teknis: {str(e)}",
            "latency_ms": 0,
        }

    return {
        "status":     "success",
        "reply":      reply,
        "latency_ms": latency,
    }
