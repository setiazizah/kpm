"""
mock_responses.py
-----------------
Kumpulan fungsi yang menghasilkan response palsu (mock) sesuai kontrak API
Tim 2 (Analisis Narasi Isu) dan Tim 3 (Strategi Komunikasi).

Cara kerja:
- Membaca keyword dari prompt/messages yang masuk
- Memilih template response yang relevan
- Mengembalikan struktur JSON persis seperti yang didefinisikan di kontrak
"""

import uuid
import time
import random
from typing import Optional


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _now_ts() -> int:
    return int(time.time())


def _new_id(prefix: str = "cmpl") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def _detect_topic(text: str) -> str:
    """Deteksi topik dari teks prompt/query secara sederhana."""
    text = text.lower()
    if any(k in text for k in ["bbm", "bahan bakar", "bensin", "solar", "pertamina"]):
        return "bbm"
    if any(k in text for k in ["pangan", "beras", "sembako", "harga pangan"]):
        return "pangan"
    if any(k in text for k in ["umkm", "usaha kecil", "digital", "digitalisasi"]):
        return "umkm"
    if any(k in text for k in ["banjir", "gempa", "bencana", "longsor"]):
        return "bencana"
    if any(k in text for k in ["korupsi", "kpk", "tipikor", "pungli"]):
        return "korupsi"
    if any(k in text for k in ["kesehatan", "rs", "rumah sakit", "dokter", "bpjs"]):
        return "kesehatan"
    return "umum"


# ---------------------------------------------------------------------------
# Template data per topik
# ---------------------------------------------------------------------------

_NARASI_TEMPLATES = {
    "bbm": {
        "issue_summary": (
            "Kenaikan harga BBM memicu gelombang sentimen negatif yang signifikan "
            "di berbagai platform media sosial. Dari analisis 500+ konten yang dikumpulkan, "
            "68% mengekspresikan kekhawatiran terhadap daya beli masyarakat dan dampak "
            "domino terhadap harga kebutuhan pokok."
        ),
        "dominant_sentiment": "negatif",
        "risk_level": "high",
        "issue_category": "ekonomi",
        "stakeholders": ["masyarakat umum", "pelaku usaha", "pengamat ekonomi", "pemerintah"],
        "trending_keywords": ["BBM", "kenaikan harga", "subsidi", "inflasi", "daya beli"],
        "sentiment_overview": {"positif": 15, "negatif": 68, "netral": 17},
    },
    "pangan": {
        "issue_summary": (
            "Kenaikan harga bahan pangan terutama beras dan cabai memicu keresahan publik "
            "di media sosial. Sebanyak 61% konten mengungkapkan kesulitan masyarakat "
            "berpenghasilan rendah dalam memenuhi kebutuhan sehari-hari."
        ),
        "dominant_sentiment": "negatif",
        "risk_level": "high",
        "issue_category": "pangan",
        "stakeholders": ["ibu rumah tangga", "pedagang pasar", "petani", "Bulog"],
        "trending_keywords": ["beras", "mahal", "sembako", "inflasi pangan", "Bulog"],
        "sentiment_overview": {"positif": 12, "negatif": 61, "netral": 27},
    },
    "umkm": {
        "issue_summary": (
            "Program digitalisasi UMKM mendapat respons beragam. Sebesar 54% konten "
            "bersifat positif menyambut inisiatif pemerintah, namun 31% mengangkat "
            "kendala akses pelatihan dan infrastruktur digital di daerah terpencil."
        ),
        "dominant_sentiment": "campuran",
        "risk_level": "medium",
        "issue_category": "ekonomi digital",
        "stakeholders": ["pelaku UMKM", "dinas koperasi", "platform digital", "perbankan"],
        "trending_keywords": ["UMKM digital", "marketplace", "pelatihan", "akses internet"],
        "sentiment_overview": {"positif": 54, "negatif": 31, "netral": 15},
    },
    "bencana": {
        "issue_summary": (
            "Bencana alam mendominasi percakapan publik dengan 72% konten mengekspresikan "
            "keprihatinan dan desakan percepatan respons pemerintah. Narasi solidaritas "
            "sosial juga kuat dengan banyak inisiatif donasi masyarakat."
        ),
        "dominant_sentiment": "negatif",
        "risk_level": "critical",
        "issue_category": "bencana alam",
        "stakeholders": ["warga terdampak", "BNPB", "relawan", "TNI/Polri"],
        "trending_keywords": ["banjir", "pengungsi", "bantuan", "evakuasi", "tanggap darurat"],
        "sentiment_overview": {"positif": 18, "negatif": 72, "netral": 10},
    },
    "korupsi": {
        "issue_summary": (
            "Isu korupsi mendapat perhatian besar dengan 75% konten bernada negatif "
            "terhadap pejabat yang diduga terlibat. Publik menuntut transparansi dan "
            "proses hukum yang cepat serta tidak pandang bulu."
        ),
        "dominant_sentiment": "negatif",
        "risk_level": "high",
        "issue_category": "hukum dan tata kelola",
        "stakeholders": ["KPK", "kejaksaan", "DPR", "masyarakat sipil", "media"],
        "trending_keywords": ["korupsi", "KPK", "transparansi", "hukum", "integritas"],
        "sentiment_overview": {"positif": 8, "negatif": 75, "netral": 17},
    },
    "kesehatan": {
        "issue_summary": (
            "Isu layanan kesehatan publik mendapat sorotan dengan 58% konten "
            "menyuarakan keluhan terkait antrean panjang dan keterbatasan fasilitas BPJS. "
            "Namun terdapat apresiasi terhadap tenaga kesehatan sebesar 25%."
        ),
        "dominant_sentiment": "campuran",
        "risk_level": "medium",
        "issue_category": "kesehatan",
        "stakeholders": ["pasien", "tenaga kesehatan", "BPJS", "Kemenkes", "rumah sakit"],
        "trending_keywords": ["BPJS", "antrean", "faskes", "dokter", "layanan kesehatan"],
        "sentiment_overview": {"positif": 25, "negatif": 58, "netral": 17},
    },
    "umum": {
        "issue_summary": (
            "Analisis konten publik menunjukkan percakapan yang beragam dengan sentimen "
            "campuran. Sebagian besar konten mengangkat isu tata kelola pemerintahan "
            "dan harapan publik terhadap kebijakan yang lebih responsif."
        ),
        "dominant_sentiment": "campuran",
        "risk_level": "medium",
        "issue_category": "tata kelola",
        "stakeholders": ["masyarakat umum", "pemerintah", "media", "akademisi"],
        "trending_keywords": ["kebijakan", "pemerintah", "publik", "aspirasi"],
        "sentiment_overview": {"positif": 30, "negatif": 45, "netral": 25},
    },
}

_STRATKOM_TEMPLATES = {
    "bbm": """### Strategi Komunikasi: Kenaikan Harga BBM

**Strategi Utama**
Komunikasi proaktif dan empatik — pemerintah mengakui beban masyarakat sambil menjelaskan urgensi kebijakan secara transparan dengan data yang mudah dipahami.

**Key Messages**
1. Pemerintah memahami dan merasakan beban yang dialami masyarakat akibat kenaikan BBM.
2. Kebijakan ini adalah keputusan sulit namun diperlukan demi menjaga ketahanan fiskal jangka panjang.
3. Subsidi akan dialihkan kepada masyarakat yang benar-benar membutuhkan melalui program BLT.
4. Pemerintah memastikan harga kebutuhan pokok tetap terkendali melalui operasi pasar.
5. Transparansi anggaran subsidi energi akan dipublikasikan secara berkala.

**Talking Points**
- "Subsidi BBM sebelumnya dinikmati oleh kelompok mampu. Pengalihan ke BLT lebih tepat sasaran."
- "Dana penghematan subsidi akan digunakan untuk infrastruktur, pendidikan, dan kesehatan."
- "Pemerintah membuka hotline pengaduan jika terjadi penyimpangan harga di lapangan."

**Channel yang Direkomendasikan**
- Media sosial (Twitter/X, TikTok, Instagram): respons cepat, konten infografis sederhana
- Konferensi pers: penjelasan teknis oleh Menteri ESDM dan Menkeu
- Siaran TV nasional: sosialisasi mekanisme BLT kepada masyarakat luas
- Media lokal/daerah: sosialisasi dalam bahasa daerah

**Timeline Respons**
- H+0: Konferensi pers resmi, rilis siaran pers
- H+1 s/d H+3: Kampanye media sosial masif, infografis & video pendek
- H+7: Evaluasi sentimen, penyesuaian pesan jika diperlukan
- H+30: Laporan publik dampak dan penyaluran BLT

**Dasar Hukum**
- Perpres No. 117 Tahun 2021 tentang Penyediaan dan Pendistribusian BBM
- UU No. 22 Tahun 2001 tentang Minyak dan Gas Bumi""",

    "pangan": """### Strategi Komunikasi: Stabilitas Harga Pangan

**Strategi Utama**
Komunikasi berbasis data dan tindakan nyata — tunjukkan langkah konkret stabilisasi harga sambil memberdayakan kanal lokal.

**Key Messages**
1. Pemerintah aktif memantau dan mengintervensi harga pangan di pasar.
2. Operasi pasar murah digelar di 500+ titik seluruh Indonesia.
3. Impor bahan pangan dilakukan secara terukur untuk menjaga keseimbangan pasokan.
4. Petani lokal tetap mendapat perlindungan melalui Harga Pokok Penjualan (HPP).
5. Masyarakat dapat melaporkan penyimpangan harga melalui aplikasi SiPangan.

**Talking Points**
- "Kenaikan harga bersifat sementara dan pemerintah sudah bergerak sejak hari pertama."
- "Bulog telah menyiapkan cadangan beras nasional yang cukup untuk 3 bulan ke depan."

**Channel yang Direkomendasikan**
- Pasar tradisional: pemasangan banner harga acuan resmi
- Aplikasi PeduliLindungi/MyGov: notifikasi lokasi pasar murah terdekat
- Radio lokal: jangkau masyarakat pedesaan

**Timeline Respons**
- H+0: Pengumuman operasi pasar
- H+3: Evaluasi harga di 10 kota besar
- H+14: Laporan publik

**Dasar Hukum**
- Perpres No. 66 Tahun 2021 tentang Badan Pangan Nasional
- Permendag No. 57 Tahun 2017 tentang Harga Eceran Tertinggi""",

    "umum": """### Strategi Komunikasi

**Strategi Utama**
Komunikasi terbuka dan berbasis fakta untuk merespons isu publik yang berkembang, dengan pendekatan empati dan solusi konkret.

**Key Messages**
1. Pemerintah mendengar dan merespons setiap aspirasi masyarakat.
2. Kebijakan yang diambil didasarkan pada data dan kepentingan publik.
3. Transparansi dan akuntabilitas menjadi prioritas utama.
4. Masyarakat dapat berpartisipasi dalam proses pengambilan keputusan.
5. Evaluasi dan penyesuaian kebijakan dilakukan secara berkala.

**Talking Points**
- "Kami berkomitmen untuk terus meningkatkan kualitas layanan publik."
- "Setiap masukan masyarakat akan ditindaklanjuti secara serius."

**Channel yang Direkomendasikan**
- Media sosial resmi pemerintah
- Konferensi pers berkala
- Forum dialog dengan pemangku kepentingan

**Timeline Respons**
- H+0: Pernyataan resmi
- H+7: Update progres
- H+30: Laporan evaluasi

**Dasar Hukum**
- UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik
- PP No. 61 Tahun 2010 tentang Pelaksanaan UU KIP""",
}


def _get_stratkom(topic: str) -> str:
    return _STRATKOM_TEMPLATES.get(topic, _STRATKOM_TEMPLATES["umum"])


def _get_narasi(topic: str) -> dict:
    return _NARASI_TEMPLATES.get(topic, _NARASI_TEMPLATES["umum"])


# ---------------------------------------------------------------------------
# Public functions — dipanggil dari router
# ---------------------------------------------------------------------------

def mock_tim2_completions(
    prompt: str,
    context: list,
    max_tokens: int = 400,
) -> dict:
    """
    Simulasi POST /v1/completions Tim 2.
    Response sesuai kontrak: choices[0].text + context_used
    """
    topic = _detect_topic(prompt)
    narasi = _get_narasi(topic)

    # Bangun teks narasi lengkap
    n = narasi
    narasi_text = (
        f"## Narasi Isu: {n['issue_category'].title()}\n\n"
        f"{n['issue_summary']}\n\n"
        f"**Sentimen Dominan:** {n['dominant_sentiment']}\n"
        f"**Tingkat Risiko:** {n['risk_level']}\n\n"
        f"**Distribusi Sentimen:**\n"
        f"- Positif: {n['sentiment_overview']['positif']}%\n"
        f"- Negatif: {n['sentiment_overview']['negatif']}%\n"
        f"- Netral: {n['sentiment_overview']['netral']}%\n\n"
        f"**Stakeholder Utama:** {', '.join(n['stakeholders'])}\n\n"
        f"**Trending Keywords:** {', '.join(n['trending_keywords'])}"
    )

    # context_used: ambil maksimal 3 item dari context yang dikirim
    context_used = context[:3] if context else []

    completion_tokens = min(len(narasi_text.split()) * 2, max_tokens)

    return {
        "id": _new_id("cmpl"),
        "object": "text_completion",
        "created": _now_ts(),
        "model": "indo-sft-v1",
        "choices": [
            {
                "text": narasi_text,
                "index": 0,
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": len(prompt.split()) * 2,
            "completion_tokens": completion_tokens,
            "total_tokens": len(prompt.split()) * 2 + completion_tokens,
        },
        "context_used": context_used,
        # Field tambahan — berguna untuk pipeline Tim 4
        "_mock_meta": {
            "topic_detected": topic,
            "issue_summary": n["issue_summary"],
            "dominant_sentiment": n["dominant_sentiment"],
            "risk_level": n["risk_level"],
            "issue_category": n["issue_category"],
            "sentiment_overview": n["sentiment_overview"],
            "stakeholders": n["stakeholders"],
            "trending_keywords": n["trending_keywords"],
        },
    }


def mock_tim2_chat_completions(messages: list, max_tokens: int = 400) -> dict:
    """
    Simulasi POST /v1/chat/completions Tim 2.
    Response sesuai kontrak: choices[0].message.content
    """
    # Ambil teks dari pesan user terakhir
    user_text = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            user_text = m.get("content", "")
            break

    topic = _detect_topic(user_text)
    narasi = _get_narasi(topic)

    content = (
        f"Berdasarkan analisis data terkini:\n\n"
        f"{narasi['issue_summary']}\n\n"
        f"Sentimen publik saat ini didominasi oleh sikap **{narasi['dominant_sentiment']}** "
        f"dengan distribusi: Positif {narasi['sentiment_overview']['positif']}%, "
        f"Negatif {narasi['sentiment_overview']['negatif']}%, "
        f"Netral {narasi['sentiment_overview']['netral']}%.\n\n"
        f"Kata kunci yang sedang trending: {', '.join(narasi['trending_keywords'])}."
    )

    return {
        "id": _new_id("chatcmpl"),
        "object": "chat.completion",
        "created": _now_ts(),
        "model": "indo-sft-v1",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": sum(len(m.get("content", "").split()) for m in messages) * 2,
            "completion_tokens": len(content.split()) * 2,
            "total_tokens": (
                sum(len(m.get("content", "").split()) for m in messages) * 2
                + len(content.split()) * 2
            ),
        },
    }


def mock_tim3_chat_completions(messages: list, max_tokens: int = 1500) -> dict:
    """
    Simulasi POST /v1/chat/completions Tim 3.
    Response sesuai kontrak: choices[0].message.content + citations.regulations
    """
    user_text = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            user_text = m.get("content", "")
            break

    topic = _detect_topic(user_text)
    stratkom_text = _get_stratkom(topic)

    # Citations per topik
    citations_map = {
        "bbm": [
            {
                "type": "perpres",
                "title": "Perpres No. 117 Tahun 2021",
                "value": "Tentang penyediaan dan pendistribusian BBM.",
            },
            {
                "type": "uu",
                "title": "UU No. 22 Tahun 2001",
                "value": "Tentang Minyak dan Gas Bumi.",
            },
        ],
        "pangan": [
            {
                "type": "perpres",
                "title": "Perpres No. 66 Tahun 2021",
                "value": "Tentang Badan Pangan Nasional.",
            },
            {
                "type": "permendag",
                "title": "Permendag No. 57 Tahun 2017",
                "value": "Tentang Penetapan Harga Eceran Tertinggi.",
            },
        ],
        "bencana": [
            {
                "type": "uu",
                "title": "UU No. 24 Tahun 2007",
                "value": "Tentang Penanggulangan Bencana.",
            },
        ],
        "korupsi": [
            {
                "type": "uu",
                "title": "UU No. 30 Tahun 2002",
                "value": "Tentang Komisi Pemberantasan Tindak Pidana Korupsi.",
            },
        ],
    }

    regulations = citations_map.get(
        topic,
        [
            {
                "type": "uu",
                "title": "UU No. 14 Tahun 2008",
                "value": "Tentang Keterbukaan Informasi Publik.",
            }
        ],
    )

    completion_tokens = min(len(stratkom_text.split()) * 2, max_tokens)

    return {
        "id": _new_id("chatcmpl"),
        "object": "chat.completion",
        "created": _now_ts(),
        "model": "team3-comm-strategy-sft-v1",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": stratkom_text,
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": sum(len(m.get("content", "").split()) for m in messages) * 2,
            "completion_tokens": completion_tokens,
            "total_tokens": (
                sum(len(m.get("content", "").split()) for m in messages) * 2
                + completion_tokens
            ),
        },
        "citations": {
            "regulations": regulations,
            "press_statements": [],
        },
    }


def mock_models_tim2() -> dict:
    return {
        "object": "list",
        "data": [
            {
                "id": "indo-sft-v1",
                "object": "model",
                "created": 1709420000,
                "owned_by": "tim2-narasi",
                "description": "Model SFT untuk analisis narasi isu publik berbahasa Indonesia.",
            }
        ],
    }


def mock_models_tim3() -> dict:
    return {
        "object": "list",
        "data": [
            {
                "id": "team3-comm-strategy-sft-v1",
                "object": "model",
                "created": 1709425000,
                "owned_by": "tim3-stratkom",
                "description": "Model SFT untuk penyusunan strategi komunikasi pemerintah.",
            }
        ],
    }
