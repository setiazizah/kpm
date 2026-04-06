"""
settings.py
-----------
Konfigurasi aplikasi Tim 4 dibaca dari environment variable (.env).
Semua nilai punya default agar server tetap bisa jalan tanpa .env lengkap.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ────────────────────────────────────────────────────────────────
POSTGRES_HOST     = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT     = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB       = os.getenv("POSTGRES_DB", "tim4db")
POSTGRES_USER     = os.getenv("POSTGRES_USER", "tim4")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "tim4pass")

DATABASE_URL = (
    f"postgresql+psycopg://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

# ── Redis / Celery ───────────────────────────────────────────────────────────
REDIS_HOST            = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT            = os.getenv("REDIS_PORT", "6379")
CELERY_BROKER_URL     = os.getenv("CELERY_BROKER_URL", f"redis://{REDIS_HOST}:{REDIS_PORT}/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", f"redis://{REDIS_HOST}:{REDIS_PORT}/1")

# ── Qdrant ──────────────────────────────────────────────────────────────────
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")

# ── External AI Services ────────────────────────────────────────────────────
# Saat mock: arahkan ke endpoint /mock/v1/tim2 dan /mock/v1/tim3 di server ini sendiri
TIM2_BASE_URL  = os.getenv("TIM2_API_URL",  "http://localhost:8000/mock/v1/tim2")
TIM2_API_KEY   = os.getenv("TIM2_API_KEY",  "mock-key-tim2")
TIM2_MODEL_ID  = os.getenv("TIM2_MODEL_ID", "indo-sft-v1")

TIM3_BASE_URL  = os.getenv("TIM3_API_URL",  "http://localhost:8000/mock/v1/tim3")
TIM3_API_KEY   = os.getenv("TIM3_API_KEY",  "mock-key-tim3")
TIM3_MODEL_ID  = os.getenv("TIM3_MODEL_ID", "team3-comm-strategy-sft-v1")

# ── App ─────────────────────────────────────────────────────────────────────
APP_ENV     = os.getenv("APP_ENV", "development")
MODEL_MODE  = os.getenv("MODEL_MODE", "mock")   # "mock" | "custom"
DEBUG       = os.getenv("DEBUG", "false").lower() == "true"
