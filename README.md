# KPM — Tim 4: RAG + MVP
**AITF 2026 · Komdigi · Use Case Komunikasi Publik & Media**

Sistem RAG (Retrieval-Augmented Generation) end-to-end untuk monitoring isu publik, analisis narasi, dan rekomendasi strategi komunikasi berbasis AI.
---
## Struktur Folder

```
kpm/
├── backend/
│   └── app/
│       ├── main.py             # FastAPI entrypoint
│       ├── celery_app.py       # Celery config & task definitions
│       └── settings.py         # Konfigurasi app (membaca .env)
├── frontend/                   # React + Vite + Tailwind CSS + TypeScript
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   └── tsconfig.json
├── .env                        # ← buat sendiri, jangan di-commit
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## Tech Stack

### Backend
| Layer | Teknologi | Versi |
|---|---|---|
| API Framework | FastAPI + Uvicorn | 0.115.0 / 0.30.6 |
| Task Queue | Celery + Redis | 5.4.0 / 7-alpine |
| Database | PostgreSQL | 16 |
| Vector DB | Qdrant | latest |
| ORM | SQLAlchemy + Psycopg | 2.0.34 / 3.2.1 |
| HTTP Client | HTTPX | 0.27.2 |
| Validasi | Pydantic | 2.9.2 |
| Runtime | Python | 3.11-slim |

### Frontend
| Layer | Teknologi |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Services (Docker Compose)

| Container | Port | Fungsi |
|---|---|---|
| `tim4_postgres` | `5432` | Database konten (shared dengan Tim 1) |
| `tim4_qdrant` | `6333` | Vector database untuk RAG semantic search |
| `tim4_redis` | `6379` | Message broker Celery + caching |
| `tim4_api` | `8000` | FastAPI REST API + Swagger UI |
| `tim4_worker` | — | Celery worker, embedding batch tiap 6 jam |

---

## Setup & Menjalankan

### 1. Clone repo

```bash
git clone https://gitlab.com/aitf2026/tim4-rag-mvp.git
cd tim4-rag-mvp/kpm
```

### 2. Buat file `.env`

Buat file `.env` di folder `kpm/`:

```env
# Database
POSTGRES_USER=tim4
POSTGRES_PASSWORD=tim4pass
POSTGRES_DB=tim4db
DATABASE_URL=postgresql+psycopg://tim4:tim4pass@postgres:5432/tim4db

# Redis
REDIS_URL=redis://redis:6379/0

# Qdrant
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# LLM — wajib diisi
OPENAI_API_KEY=sk-...
MODEL_MODE=mock          # mock | custom

# Tim 2 & Tim 3 — isi saat model siap
TIM2_API_URL=http://tim2-api:8001/v1
TIM2_API_KEY=ganti-nanti
TIM2_MODEL_ID=indo-sft-v1
TIM3_API_URL=http://tim3-api:8002/v1
TIM3_API_KEY=ganti-nanti
TIM3_MODEL_ID=team3-comm-strategy-sft-v1
```

> **`MODEL_MODE=mock`** — selama model Tim 2 & Tim 3 belum siap, biarkan di `mock`. Tim 4 akan otomatis fallback ke GPT-4o. Ganti ke `custom` saat model siap, tanpa perlu ubah kode (ADR-001).

### 3. Jalankan backend

```bash
# Pastikan ada di folder kpm/
docker compose up --build        # pertama kali
docker compose up --build -d     # background mode
```

### 4. Jalankan frontend (terpisah)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Verifikasi

Setelah `docker compose up`, buka:

| URL | Yang Diharapkan |
|---|---|
| http://localhost:8000/docs | Swagger UI FastAPI |
| http://localhost:8000/health | `{"status": "ok"}` |
| http://localhost:6333/dashboard | Qdrant Web UI |
| http://localhost:3000 | Frontend React (jika `npm run dev` berjalan) |

### Test mock endpoint

```bash
curl -X POST http://localhost:8000/mock/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "indo-sft-v1",
    "prompt": "Analisis isu kenaikan BBM",
    "context": [{"type": "text", "value": "BBM naik 30%..."}],
    "max_tokens": 200
  }'
```

---

## Command Harian

```bash
# Start (tanpa rebuild)
docker compose up -d

# Stop
docker compose down

# Lihat log real-time
docker compose logs -f api
docker compose logs -f worker

# Rebuild setelah ubah kode
docker compose up --build -d api

# Reset total (hapus semua data — hati-hati!)
docker compose down -v
```

---

## Arsitektur Pipeline

```
Tim 1 (Crawler)
  └─ raw content → PostgreSQL (content_items)
                         │
                    Tim 4 RAG
                    ├─ chunking + embedding → Qdrant
                    ├─ POST /v1/completions → Tim 2 (analisis narasi)
                    └─ POST /v1/chat/completions → Tim 3 (strategi komunikasi)
                                                        │
                                                  MVP Frontend
                                      (dashboard + chatbot + export)
```

### Integrasi Antar Tim

| Dari | Ke | Endpoint | Fungsi |
|---|---|---|---|
| Tim 4 | Tim 2 | `POST /v1/completions` | Kirim RAG chunks → terima narasi isu |
| Tim 4 | Tim 3 | `POST /v1/chat/completions` | Kirim narasi → terima strategi + citations |

Auth: `Authorization: Bearer <API_KEY>` · Timeout: 30s · Fallback: GPT-4o (ADR-001)

---

## Database

**Tabel utama:** `content_items` (PostgreSQL 16)

Kolom kunci: `id`, `source_url`, `text_content`, `keywords[]`, `issue_category`, `issue_summary`, `sentiment`, `embedding_id` (FK → Qdrant)

**Vector DB:** Qdrant — payload per chunk menyimpan `content_id`, `keywords`, `issue_category`, `sentiment`, `published_at` (untuk time-decay scoring), dan `region`.

Lihat skema lengkap di: `docs/SkemaDB_Tim4_v2.docx`

---

## ADR (Architecture Decision Records)

| ADR | Keputusan | Status |
|---|---|---|
| ADR-001 | Fallback LLM: GPT-4o jika Tim 2/3 timeout | ✅ Accepted |
| ADR-002 | Benchmark 3 embedding model (OpenAI / Google / intfloat) | 🔲 Proposed |
| ADR-003 | Hybrid search: semantic + BM25, ratio 0.7:0.3 (RRF) | ✅ Accepted |
| ADR-005 | Batch embedding setiap 6 jam via Celery + Redis | ✅ Accepted |

---

## Status Fase 1

- [x] Arsitektur end-to-end & diagram flow antar tim
- [x] API Contract Tim 4 ↔ Tim 2 (v0.2)
- [x] API Contract Tim 4 ↔ Tim 3 (v0.2)
- [x] Dev environment — 5 service via Docker Compose
- [x] Skema DB PostgreSQL v0.2 (disesuaikan Tim 1)
- [x] Struktur metadata Qdrant
- [ ] Data contract meeting dengan Tim 1 (skema DB final)
- [ ] Konfirmasi base URL & API key Tim 2 dan Tim 3
- [ ] Benchmark embedding model (ADR-002)
- [ ] Build RAG ingestion pipeline
- [ ] Integrasi mock endpoint Tim 2 & Tim 3

---

## Kontak Tim 4
1. Aswin Asrianto
2. Setia Mukti Azizah
3. Tengku Syaid Farhan
4. Ichsan Setiawan
5. Surya Karunia Ramadhan
6. Yayang Matira

---

*AITF 2026 · Komdigi · Direktorat Jenderal KPM*
