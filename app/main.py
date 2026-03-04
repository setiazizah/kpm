from fastapi import FastAPI

app = FastAPI(title="Tim 4 RAG + MVP Backend")

@app.get("/health")
def health():
    return {"status": "ok"}