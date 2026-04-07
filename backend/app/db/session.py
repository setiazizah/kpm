import os
from contextlib import asynccontextmanager
import psycopg
from dotenv import load_dotenv

load_dotenv()

# Konversi dari format asyncpg ke psycopg (ganti +asyncpg)
_raw = os.getenv("DATABASE_URL", "postgresql://team4:team4pass@127.0.0.1:55432/team4db")
DATABASE_URL = (
    _raw
    .replace("postgresql+asyncpg://", "postgresql://")
    .replace("postgresql+psycopg://", "postgresql://")
)


@asynccontextmanager
async def get_conn():
    """Async context manager untuk koneksi database."""
    conn = await psycopg.AsyncConnection.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()
