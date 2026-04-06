# KPM-4 — RAG + MVP Backend System

**Tim KPM 4 | Artificial Intelligence Talent Factory**  
Yogyakarta, 13 Maret 2026

---

## Anggota Tim

| Nama | Peran |
|---|---|
| Setia Mukti Azizah | Team Lead |
| Tengku Syaid Farhan | Frontend Engineer |
| Ichsan Setiawan | ML Engineer |
| Yayang Matira | ML Engineer |
| Surya Karunia Ramadhan | Backend Engineer |
| Aswin Asrianto | Backend Engineer |

---

## Deskripsi Proyek

Sistem RAG (Retrieval-Augmented Generation) + MVP untuk **Komunikasi Publik & Media (KPM)** — platform analisis narasi isu dan strategi komunikasi pemerintah berbasis AI.

### Arsitektur Infrastruktur

```
Frontend (React + Tailwind)
    ↓
Backend (FastAPI)
    ↓
RAG Orchestrator (LangChain/LlamaIndex)
    ├── Qdrant (Vector DB)
    ├── PostgreSQL (RDBMS)
    └── Redis + Celery (Async Queue)
```

### Alur Data

1. **Tim 1** — Crawler (Social Media X, News, TikTok/YouTube, Dokumen Legal)
2. **Tim 4** — Ingestion, Embedding, RAG Pipeline
3. **Tim 2** — Model Narasi Isu (`indo-sft-v1`)
4. **Tim 3** — Model StratKom (`team3-comm-strategy-sft-v1`)

---

## Struktur Direktori

```
kpm/
├── backend/               # FastAPI backend
│   └── app/
│       ├── main.py
│       ├── routers/       # tim2.py, tim3.py, orchestrator.py
│       ├── services/      # qdrant_service, orchestrator_service, embedder
│       ├── tasks/         # Celery ingestion tasks
│       ├── db/            # SQL migration
│       ├── core/          # settings
│       └── mocks/         # Mock responses untuk testing
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── pages/         # DashboardPage, ChatPage, MonitoringPage, dll
│       ├── components/    # UI components
│       ├── api/           # API calls
│       ├── hooks/         # Custom hooks
│       ├── types/         # TypeScript types
│       └── data/          # Dummy/static data
├── team1-crawler/         # Crawler service (Tim 1)
│   └── app/
│       ├── crawlers/      # news, tiktok, youtube_shorts
│       ├── db/            # models, session, repository
│       ├── api/           # REST endpoints
│       └── services/
├── scripts/
│   └── init_vector_db.py  # Qdrant collection setup
├── docker-compose.yml     # Full stack deployment
├── Dockerfile             # Backend Dockerfile
├── requirements.txt       # Python dependencies
└── .gitignore
```

---

## Setup & Menjalankan

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

### 1. Jalankan dengan Docker (Rekomendasi)

```bash
docker-compose up --build
```

### 2. Manual Setup

**Backend:**
```bash
pip install -r requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Init Qdrant:**
```bash
python scripts/init_vector_db.py
```

---

## API Endpoints

### Tim 2 — Analisis Narasi Isu
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/v1/team2/completions` | Text completion narasi isu |
| POST | `/v1/team2/chat/completions` | Chatbot agentic multi-turn |
| GET | `/v1/team2/models` | List model tersedia |

### Tim 3 — Strategi Komunikasi
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/v1/team3/chat/completions` | Generate strategi komunikasi |
| GET | `/v1/team3/crawlers/status` | Status corpus regulasi |

### Orchestrator
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/v1/workflow/analyze` | Full RAG pipeline |
| POST | `/api/v1/workflow/generate-stratkom` | Generate stratkom |
| POST | `/api/v1/workflow/revise` | Revisi dokumen |

---

## Environment Variables

Salin `.env.example` menjadi `.env` dan sesuaikan:

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/kpm_db
QDRANT_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_key_here

# Tim 2 & Tim 3 API
TIM2_API_URL=https://apicontract-tim2.netlify.app
TIM3_API_URL=https://apicontract-tim3.netlify.app

# Demo mode (tanpa koneksi API nyata)
DEMO_MODE=true
```

---

## Fallback Engine (ADR-001)

Jika Tim 2/Tim 3 tidak tersedia, sistem otomatis fallback ke:
1. Tim 2/3 Primary
2. GPT-4o
3. Gemini
4. Dummy Response (dev mode)

**Trigger:** HTTP 500 / Timeout >30s / 3x retry gagal

---

## API Contract

- **Tim 2:** https://apicontract-tim2.netlify.app/
- **Tim 3:** https://apicontract-tim3.netlify.app/
