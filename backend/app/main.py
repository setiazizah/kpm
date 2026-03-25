import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.workflow import router as workflow_router

app = FastAPI(title="Tim 4 RAG + MVP Backend")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve exported DOCX/PDF files
EXPORT_DIR = Path(os.getenv("EXPORT_DIR", "/tmp/exports"))
EXPORT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")

app.include_router(workflow_router)


@app.get("/health")
def health():
    return {"status": "ok"}
