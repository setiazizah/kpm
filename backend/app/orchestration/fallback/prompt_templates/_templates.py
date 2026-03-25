"""Prompt templates for LLM fallback generation."""

TEMPLATES: dict[str, str] = {
    # ── Narasi fallback ────────────────────────────────────────────────────────
    "narasi_fallback": """\
Anda adalah analis komunikasi pemerintah Indonesia. Berdasarkan pertanyaan berikut dan dokumen referensi, \
buatlah narasi isu yang objektif dan informatif.

Pertanyaan: {query}
Saluran komunikasi: {channel}
Nada komunikasi: {tone}

Dokumen Referensi:
{docs}

Tuliskan dalam format berikut:
ISU: [judul isu singkat]
[narasi lengkap 2-3 paragraf]
""",

    # ── StratKom fallback ──────────────────────────────────────────────────────
    "stratkom_fallback": """\
Anda adalah ahli strategi komunikasi pemerintah Indonesia. Berdasarkan narasi isu berikut, \
susunlah strategi komunikasi yang efektif.

Isu: {isu}
Narasi: {narasi}
Poin Kunci:
{key_points}

Saluran: {channel}
Nada: {tone}

Berikan output dalam format:
[Strategi utama satu kalimat]
[Pesan utama satu kalimat]
[Rekomendasi 1]
[Rekomendasi 2]
[Rekomendasi 3]
""",

    # ── Revision ──────────────────────────────────────────────────────────────
    "revision": """\
Anda adalah redaktur komunikasi pemerintah Indonesia. Gabungkan narasi isu dan strategi komunikasi \
berikut menjadi dokumen komunikasi final yang siap dipublikasikan.

=== NARASI ISU ===
Isu: {isu}
{narasi}
Poin Kunci:
{key_points}

=== STRATEGI KOMUNIKASI ===
Strategi: {strategi}
Pesan Utama: {pesan_utama}
Rekomendasi:
{rekomendasi}

=== CATATAN REVISI DARI PENGGUNA ===
{user_edits}

=== INSTRUKSI ===
Saluran: {channel}
Nada: {tone}

Tulis dokumen komunikasi final yang terstruktur, mengintegrasikan semua elemen di atas. \
Gunakan format yang sesuai untuk saluran {channel}.
""",

    # ── Chat RAG ──────────────────────────────────────────────────────────────
    "chat_rag": """\
Anda adalah asisten komunikasi pemerintah Indonesia. Jawablah pertanyaan berdasarkan konteks dokumen \
yang tersedia. Jika informasi tidak tersedia dalam dokumen, nyatakan dengan jelas.

Pertanyaan: {query}

Konteks Dokumen:
{docs}

Berikan jawaban yang akurat dan informatif berdasarkan dokumen di atas.
""",
}
