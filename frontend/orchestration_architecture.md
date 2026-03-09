# Arsitektur Sistem Orkestasi — Tim 4 Backend
## RAG + MVP | Usecase Komunikasi Publik dan Media

---

## 1. Gambaran Umum Sistem

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         TIM 4 — BACKEND SYSTEM                          ║
║                                                                          ║
║  ┌──────────┐    ┌─────────────────────────────────────────────────┐    ║
║  │          │    │              ORCHESTRATION ENGINE                │    ║
║  │ FRONTEND │───►│                                                  │    ║
║  │  (UI)    │    │  retrieval → narasi → stratkom → revision →     │    ║
║  │          │◄───│  export                                          │    ║
║  └──────────┘    └──────────────┬─────────────────────┬────────────┘    ║
║                                 │                     │                  ║
║                    ┌────────────▼───────┐   ┌────────▼────────┐        ║
║                    │   TIM 2 (Model 1)  │   │  TIM 3 (Model 2)│        ║
║                    │   Analisis Narasi  │   │  Strategi Komuni-│        ║
║                    │   /v1/analyze-issue│   │  kasi /v1/gen-   │        ║
║                    └────────────────────┘   │  stratkom        │        ║
║                                             └─────────────────-┘        ║
║  ┌─────────────────┐    ┌──────────────┐    ┌───────────────────┐      ║
║  │  RAG PIPELINE   │    │  LLM CLIENT  │    │  EXPORT SERVICE   │      ║
║  │  (Tim 4 RAG)    │    │  GPT-4o /    │    │  DOCX / PDF       │      ║
║  │  Qdrant + BM25  │    │  Gemini /    │    │  Generator        │      ║
║  └─────────────────┘    │  Dummy       │    └───────────────────┘      ║
║                          └──────────────┘                               ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Alur Interaktif (Sesuai Diagram Produk)

```
  USER                     FRONTEND                    BACKEND
   │                           │                           │
   │  Ketik pertanyaan         │                           │
   │  Klik "Tanya Isu"         │                           │
   ├──────────────────────────►│                           │
   │                           │  POST /v1/workflow/analyze│
   │                           ├──────────────────────────►│
   │                           │  {session_id, query,      │  ┌──────────┐
   │                           │   channel, tone}          │  │ Step 1   │
   │                           │                           ├─►│Retrieval │
   │                           │                           │  │ (RAG)    │
   │                           │                           │  └────┬─────┘
   │                           │                           │       │ retrieved_docs
   │                           │                           │  ┌────▼─────┐
   │                           │                           │  │ Step 2   │
   │                           │                           │  │  Narasi  │
   │                           │                           │  │ (Tim 2)  │
   │                           │                           │  └────┬─────┘
   │                           │  {narasi, key_points,     │       │ narasi_output
   │                           │◄──────────────────────────┤       │
   │  Dokumen Narasi Isu       │   retrieved_docs}         │       │
   │◄──────────────────────────┤                           │       │
   │  ditampilkan di UI        │                           │  [state disimpan
   │                           │                           │   di session store]
   │                           │                           │
   │  Klik "Generate StratKom" │                           │
   ├──────────────────────────►│                           │
   │                           │  POST /v1/workflow/        │
   │                           │  generate-stratkom        │
   │                           ├──────────────────────────►│
   │                           │  {session_id}             │  ┌──────────┐
   │                           │                           │  │ Step 3   │
   │                           │                           ├─►│ StratKom │
   │                           │                           │  │ (Tim 3)  │
   │                           │                           │  └────┬─────┘
   │                           │  {strategi, pesan_utama,  │       │ stratkom_output
   │                           │◄──────────────────────────┤
   │  Dokumen Strategi         │   rekomendasi}            │
   │◄──────────────────────────┤                           │
   │  ditampilkan di UI        │                           │
   │                           │                           │
   │  (Opsional: isi revisi)   │                           │
   │  Klik "Revisi Draf"       │                           │
   ├──────────────────────────►│                           │
   │                           │  POST /v1/workflow/revise │
   │                           ├──────────────────────────►│
   │                           │  {session_id,             │  ┌──────────┐
   │                           │   user_edits?,            │  │ Step 4   │
   │                           │   export_format}          ├─►│ Revision │
   │                           │                           │  │  (LLM)   │
   │                           │                           │  └────┬─────┘
   │                           │                           │       │ revised_draft
   │                           │                           │  ┌────▼─────┐
   │                           │                           │  │ Step 5   │
   │                           │                           │  │  Export  │
   │                           │                           │  │DOCX/PDF  │
   │                           │                           │  └────┬─────┘
   │                           │  {revised_draft,          │       │ export_url
   │                           │◄──────────────────────────┤
   │  Draft + Tombol Download  │   export_url}             │
   │◄──────────────────────────┤                           │
```

---

## 3. Struktur Direktori

```
app/orchestration/
│
├── __init__.py              ← Entry point publik (WorkflowEngine, WorkflowState, dll)
├── engine.py                ← WorkflowEngine — eksekutor utama
├── state.py                 ← WorkflowState — immutable state container
├── schemas.py               ← Request/Response models untuk API (JSON output)
│
├── steps/                   ── 5 LANGKAH PIPELINE ──
│   ├── base.py              ← AbstractStep (retry, timeout, fallback interface)
│   ├── retrieval_step.py    ← Step 1: RAG retrieval (Tim 4 internal)
│   ├── narasi_step.py       ← Step 2: Narasi isu (Tim 2 API)
│   ├── stratkom_step.py     ← Step 3: Strategi komunikasi (Tim 3 API)
│   ├── revision_step.py     ← Step 4: LLM document revision
│   └── export_step.py       ← Step 5: DOCX/PDF export
│
├── fallback/                ── CADANGAN JIKA SERVICE EKSTERNAL DOWN ──
│   ├── llm_client.py        ← Abstraksi LLM (OpenAI / Gemini / Dummy)
│   └── prompt_templates/
│       ├── __init__.py      ← load_template(name)
│       └── _templates.py    ← narasi_fallback, stratkom_fallback, revision, chat_rag
│
└── hooks/                   ── MIDDLEWARE PER STEP ──
    ├── pre_step.py          ← LoggingPreHook, AuthPreHook, QuotaPreHook
    └── post_step.py         ← LoggingPostHook, CachingPostHook, MonitoringPostHook
```

---

## 4. Siklus Hidup WorkflowState

```
  INISIALISASI                SETELAH SETIAP STEP             SELESAI
  ┌─────────────┐             ┌─────────────────┐         ┌─────────────┐
  │ session_id  │   Step 1    │ + retrieved_docs│  Step 2 │ + narasi_   │
  │ user_id     │ ──────────► │ + retrieval_    │ ───────►│   output    │
  │ query       │             │   scores        │         │             │
  │ channel     │             └─────────────────┘         └──────┬──────┘
  │ tone        │                                                 │
  └─────────────┘                                          Step 3 │
                                                                  ▼
  FINAL STATE                                        ┌─────────────────┐
  ┌─────────────────────────┐              Step 4    │ + stratkom_     │
  │ retrieved_docs    ✓     │  ◄────────────────     │   output        │
  │ narasi_output     ✓     │  ◄──────────────       └──────┬──────────┘
  │ stratkom_output   ✓     │  ◄────────────                │
  │ revised_draft     ✓     │  ◄──────────         Step 5  │
  │ export_url        ✓     │  ◄────────                    ▼
  │ step_statuses     ✓     │              ┌─────────────────────────┐
  │ step_latencies    ✓     │              │ + revised_draft         │
  └─────────────────────────┘              │ + export_url            │
                                           └─────────────────────────┘

  Setiap transisi → state BARU dibuat (immutable / frozen Pydantic model)
  State lama tidak pernah diubah → aman untuk debugging & recovery
```

---

## 5. Mekanisme Retry & Fallback per Step

```
  step.execute(state)
       │
       ├── PRE-HOOKS (auth, logging, quota)
       │
       ▼
  ┌─────────────────────────────────────────────────────────┐
  │                    RETRY LOOP (max 3x)                   │
  │                                                          │
  │   attempt 1 ──► _run(state)                             │
  │        │              │                                  │
  │        │         sukses? ──────────────────────── ✓ →   │
  │        │              │                            return│
  │        │         timeout? ──► jeda 1s ──► attempt 2     │
  │        │              │                                  │
  │        │         HTTP error? ──► jeda 2s ──► attempt 3  │
  │        │              │                                  │
  │        │    ValueError? ──────────────── FAILED → raise  │
  │        │    (logic error, tidak di-retry)                │
  │        │                                                 │
  │   attempt 3 gagal ──► _on_fallback(state)               │
  └─────────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     FALLBACK LOGIC      │
                    │  per step berbeda:      │
                    │                         │
                    │  retrieval → []  (kosong│
                    │  narasi    → LLM lokal  │
                    │  stratkom  → LLM lokal  │
                    │  revision  → concat     │
                    │  export    → skip (null)│
                    └─────────────────────────┘
                                │
       ├── POST-HOOKS (caching, monitoring, logging)
       │
       ▼
  return updated state

  Jeda antar retry: 1s → 2s → 4s (exponential backoff)
  Timeout per attempt: 15–60s (berbeda per step)
```

---

## 6. Struktur JSON Response ke Frontend

```
POST /v1/workflow/analyze
──────────────────────────
Request:
{
  "session_id":  "s-abc123",
  "user_id":     "u-001",
  "query":       "Kebijakan digitalisasi UMKM 2025?",
  "channel":     "press",           ← press | social | internal
  "tone":        "formal"           ← formal | semi-formal | informal
}

Response:
{
  "status":    "success",           ← success | partial | error
  "session_id": "s-abc123",
  "narasi": {
    "isu":        "Digitalisasi UMKM",
    "narasi":     "Pemerintah mendorong transformasi digital...",
    "key_points": ["Target 30 juta UMKM", "Anggaran Rp 2T"]
  },
  "retrieved_docs": [
    {"doc_id":"d1","content":"...","source":"Kemenko","score":0.95}
  ],
  "step_meta": {
    "retrieval": {"status":"success","latency_ms":123,"fallback_used":false},
    "narasi":    {"status":"success","latency_ms":987,"fallback_used":false}
  }
}

POST /v1/workflow/generate-stratkom
────────────────────────────────────
Request:  {"session_id": "s-abc123"}   ← hanya session_id

Response:
{
  "status":   "success",
  "session_id": "s-abc123",
  "stratkom": {
    "strategi":    "Komunikasi proaktif via media nasional",
    "pesan_utama": "Pemerintah hadir untuk UMKM",
    "rekomendasi": ["Siaran pers", "Konferensi pers", "#UMKMDigital"]
  },
  "step_meta": {
    "stratkom": {"status":"success","latency_ms":1023,"fallback_used":false}
  }
}

POST /v1/workflow/revise
─────────────────────────
Request:
{
  "session_id":    "s-abc123",
  "export_format": "docx",           ← docx | pdf
  "user_edits":    "Tambahkan data statistik"   ← opsional
}

Response:
{
  "status":       "success",
  "session_id":   "s-abc123",
  "revised_draft":"SIARAN PERS — DIGITALISASI UMKM 2025\n\n...",
  "export_url":   "https://storage.../siaran-pers-umkm.docx",
  "step_meta": {
    "revision": {"status":"success","latency_ms":2341,"fallback_used":false},
    "export":   {"status":"success","latency_ms":456, "fallback_used":false}
  }
}
```

---

## 7. Komponen Hooks (Middleware)

```
                     ┌──────────────────────────────────┐
                     │       SETIAP step.execute()       │
                     └──────────────────────────────────┘
                                      │
              ┌───────────────────────▼───────────────────────┐
              │                  PRE-HOOKS                     │
              │  ┌──────────────────────────────────────────┐  │
              │  │ LoggingPreHook   → catat step + query    │  │
              │  │ AuthPreHook      → validasi user_id      │  │
              │  │ QuotaPreHook     → hitung request/session│  │
              │  └──────────────────────────────────────────┘  │
              └───────────────────────┬───────────────────────┘
                                      │
                             ┌────────▼────────┐
                             │   STEP LOGIC    │
                             │  (+ retry loop) │
                             └────────┬────────┘
                                      │
              ┌───────────────────────▼───────────────────────┐
              │                 POST-HOOKS                     │
              │  ┌──────────────────────────────────────────┐  │
              │  │ LoggingPostHook    → status + latency    │  │
              │  │ CachingPostHook   → simpan ke cache      │  │
              │  │ MonitoringPostHook→ metrics Prometheus   │  │
              │  └──────────────────────────────────────────┘  │
              └───────────────────────────────────────────────┘
```

---

## 8. Abstraksi LLM Client (Fallback)

```
                    ┌─────────────────────────┐
                    │      get_llm_client()    │
                    │   [LLM_PROVIDER env var] │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
    ┌────────▼────────┐ ┌────────▼────────┐ ┌───────▼────────┐
    │  OpenAIClient   │ │  GeminiClient   │ │ DummyLLMClient │
    │  GPT-4o         │ │  Gemini 1.5 Pro │ │  (testing /    │
    │  (production)   │ │  (alternative)  │ │   local dev)   │
    └─────────────────┘ └─────────────────┘ └────────────────┘

    Interface seragam:
    await llm.generate(prompt, max_tokens=2048, temperature=0.7)
```

---

## 9. Ringkasan Endpoint API

```
┌────────────────────────────────────────────────────────────────────┐
│  METHOD  │  ENDPOINT                      │  FUNGSI               │
├──────────┼────────────────────────────────┼───────────────────────┤
│  POST    │  /v1/workflow/analyze           │  Tanya Isu            │
│          │                                │  → narasi + docs      │
├──────────┼────────────────────────────────┼───────────────────────┤
│  POST    │  /v1/workflow/generate-stratkom │  Generate StratKom    │
│          │                                │  → strategi + rekom.  │
├──────────┼────────────────────────────────┼───────────────────────┤
│  POST    │  /v1/workflow/revise            │  Revisi Draf          │
│          │                                │  → draft + export URL │
├──────────┼────────────────────────────────┼───────────────────────┤
│  POST    │  /v1/workflow/run              │  Full pipeline (batch)│
│          │                                │  → semua output       │
├──────────┼────────────────────────────────┼───────────────────────┤
│  GET     │  /v1/workflow/{id}/status      │  Cek status polling   │
└──────────┴────────────────────────────────┴───────────────────────┘

Status Response:
  "success" → semua step berhasil normal
  "partial" → ada step pakai fallback (output tetap ada)
  "error"   → step kritis gagal (output mungkin null)
```

---

## 10. Dependency Antar Step

```
  [Query User]
       │
       ▼
  ┌─────────┐
  │ Step 1  │  RETRIEVAL
  │  RAG    │  — tidak membutuhkan output step lain
  └────┬────┘  — fallback: lanjut dengan konteks kosong
       │
       │ retrieved_docs
       ▼
  ┌─────────┐
  │ Step 2  │  NARASI (Tim 2)
  │ Analisis│  — membutuhkan: query + retrieved_docs
  └────┬────┘  — fallback: LLM internal generate narasi
       │
       │ narasi_output  [WAJIB untuk Step 3]
       ▼
  ┌─────────┐
  │ Step 3  │  STRATKOM (Tim 3)
  │StratKom │  — membutuhkan: narasi_output (WAJIB)
  └────┬────┘  — fallback: LLM internal generate stratkom
       │
       │ stratkom_output  [WAJIB untuk Step 4]
       ▼
  ┌─────────┐
  │ Step 4  │  REVISION (LLM Internal)
  │ Revision│  — membutuhkan: narasi_output + stratkom_output (WAJIB)
  └────┬────┘  — fallback: concat sederhana narasi + stratkom
       │
       │ revised_draft  [WAJIB untuk Step 5]
       ▼
  ┌─────────┐
  │ Step 5  │  EXPORT
  │  DOCX/  │  — membutuhkan: revised_draft (WAJIB)
  │  PDF    │  — fallback: skip export (export_url = null)
  └─────────┘
       │
       ▼
  export_url
```
