# 🕷️ Media Monitoring Crawler

Sistem crawl data untuk media monitoring nasional Indonesia menggunakan **Crawl4AI** + **FastAPI** + **Supabase (PostgreSQL)**.

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Application                           │
│  POST /api/v1/crawlers/trigger   ─── Trigger manual batch       │
│  GET  /api/v1/crawlers/status/:id ── Status batch               │
│  GET  /api/v1/keywords           ─── Daftar keyword aktif       │
│  GET  /api/v1/batches            ─── Riwayat batch              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     CrawlService         │
              │  (orchestrator)          │
              └────────────┬────────────┘
             ┌──────────────┼──────────────┬─────────────┐
             ▼              ▼              ▼             ▼
        NewsCrawler   TikTokCrawler                 YouTubeShortsCrawler
        (Crawl4AI)    (Apify Actor)                 (Apify Actor)
             │              │                            │
             └──────────────┴────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     PostgreSQL (Supabase)  │
                    │   Bronze / Silver / Control│
                    └───────────────────────────┘
```

## Datalake Schema

| Layer   | Tabel                  | Deskripsi                          |
|---------|------------------------|------------------------------------|
| Bronze  | `raw_content`          | Semua konten mentah dari crawler   |
| Bronze  | `post_comment`         | Top-50 komentar per post           |
| Bronze  | `image_manifest`       | Metadata gambar Instagram          |
| Bronze  | `audio_manifest`       | Metadata audio TikTok              |
| Silver  | `keyword_corpus`       | Keyword aktif untuk crawling       |
| Silver  | `taxonomy_category`    | Master kategori isu                |
| Silver  | `crawler_config`       | Konfigurasi & rate limit crawler   |
| Silver  | `keyword_trend_history`| Riwayat skor tren keyword          |
| Silver  | `keyword_status_log`   | Audit trail aktivasi keyword       |
| Silver  | `labeled_content`      | Konten berlabel (NLP/manual)       |
| Control | `batch_manifest`       | Manifest & statistik setiap batch  |

## Quick Start

### 1. Clone & install dependencies

```bash
pip install -r requirements.txt
playwright install chromium
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env dengan DATABASE_URL Supabase dan session cookies
```

### 3. Inisialisasi database

```bash
# Jalankan migrasi Alembic
alembic upgrade head

# Seed data awal (taxonomy + crawler configs)
python -m scripts.seed_db
```

### 4. Jalankan aplikasi

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Trigger crawl manual

```bash
curl -X POST http://localhost:8000/api/v1/crawlers/trigger \
  -H "Content-Type: application/json" \
  -d '{"platform": null, "dry_run": false}'
```

## Crawl Schedule

| Platform      | Jadwal          | Target/hari |
|---------------|-----------------|-------------|
| Media Online  | Setiap 6 jam    | 2.000       |
| TikTok        | 02:00 WIB       | 1.500       |
| YouTube Shorts| 02:00 WIB       | 500         |

## Antigravity Skills & Workflows

```
.agents/
├── skills/
│   └── crawl4ai/
│       └── SKILL.md          # Expert Crawl4AI guidance
├── rules/
│   └── project-rules.md      # Stack, code style, data rules
└── workflows/
    ├── run-crawl-batch.md     # /run-crawl-batch
    └── setup-db.md            # /setup-db
```

### Menggunakan workflows di Antigravity:
- `/run-crawl-batch` — jalankan satu siklus crawl penuh
- `/setup-db` — inisialisasi database dari nol

## Struktur Proyek

```
media-monitor/
├── app/
│   ├── main.py                 # FastAPI app + APScheduler
│   ├── api/v1/endpoints/       # Route handlers
│   ├── core/                   # Config & logging
│   ├── crawlers/               # Platform crawler classes
│   │   ├── base.py
│   │   ├── news.py
│   │   ├── tiktok.py
│   │   ├── instagram.py
│   │   └── youtube_shorts.py
│   ├── db/                     # Models, session, repository
│   ├── schemas/                # Pydantic schemas
│   └── services/               # Business logic (crawl_service)
├── alembic/                    # DB migrations
├── scripts/                    # seed_db.py
├── .agents/                    # Antigravity skills/rules/workflows
├── requirements.txt
└── .env.example
```

## Platform Notes

### TikTok & YouTube Shorts (Apify)
- Menggunakan **Apify Actors** (`apify/tiktok-scraper`, `streamers/youtube-scraper`) untuk bypass anti-bot.
- Membutuhkan `APIFY_API_TOKEN` di `.env`.
- Mengambil detail metadata (views, likes), video list, dan top comments.

### Media Online (Crawl4AI)
- Crawl article text content dari berbagai portal berita tanpa authentikasi.
- Mendukung: kompas.com, detik.com, tempo.co, tribunnews.com, cnbcindonesia.com
- Tambah domain baru di `app/crawlers/news.py → DOMAIN_SCHEMAS`
