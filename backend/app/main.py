from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.tim2 import router as tim2_router
from app.routers.tim3 import router as tim3_router
from app.routers.orchestrator import router as orchestrator_router

app = FastAPI(
    title="Tim 4 RAG + MVP Backend",
    description=(
        "Backend orkestrator Tim 4. "
        "Prefix /mock/v1/tim2 dan /mock/v1/tim3 adalah simulasi "
        "API Tim 2 & Tim 3 untuk development paralel."
    ),
    version="0.2.0",
)

# CORS harus didaftarkan SEBELUM router agar header terbawa ke semua endpoint
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tim2_router)
app.include_router(tim3_router)
app.include_router(orchestrator_router)


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "version": "0.2.0", "mode": "mock"}
