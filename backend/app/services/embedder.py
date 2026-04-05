"""
embedder.py
-----------
Service untuk mengubah teks → vector embedding.

Model : intfloat/multilingual-e5-small
- Support Bahasa Indonesia
- Output : 384 dimensi
- Bisa jalan di CPU biasa (tidak butuh GPU)
- Download otomatis ~470MB saat pertama kali dipakai

Fallback: kalau sentence-transformers belum terinstall,
pakai random vector agar pipeline tetap bisa jalan.
"""

import logging

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 384
MODEL_NAME    = "intfloat/multilingual-e5-small"

_model = None  # singleton — load sekali, pakai berkali-kali


def _load_model():
    global _model
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading model: {MODEL_NAME} ...")
        _model = SentenceTransformer(MODEL_NAME)
        logger.info("Model loaded OK")
        return _model
    except ImportError:
        logger.warning(
            "sentence-transformers belum terinstall -> pakai random vector.\n"
            "Install dengan: pip install sentence-transformers==3.0.1"
        )
        return None
    except Exception as e:
        logger.warning(f"Gagal load model: {e} -> pakai random vector.")
        return None


def embed_text(text: str) -> list[float]:
    """Embed query (satu teks) -> vector 384d. Prefix 'query:'"""
    model = _load_model()
    if model is None:
        import random
        return [random.uniform(-1, 1) for _ in range(EMBEDDING_DIM)]
    vector = model.encode(f"query: {text}", normalize_embeddings=True)
    return vector.tolist()


def embed_passage(text: str) -> list[float]:
    """Embed dokumen/chunk -> vector 384d. Prefix 'passage:'"""
    model = _load_model()
    if model is None:
        import random
        return [random.uniform(-1, 1) for _ in range(EMBEDDING_DIM)]
    vector = model.encode(f"passage: {text}", normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str], is_query: bool = False) -> list[list[float]]:
    """
    Embed banyak teks sekaligus (jauh lebih efisien dari loop satu-satu).
    Args:
        texts    : list teks
        is_query : True -> prefix 'query:', False -> prefix 'passage:'
    """
    model = _load_model()
    if model is None:
        import random
        return [[random.uniform(-1, 1) for _ in range(EMBEDDING_DIM)] for _ in texts]
    prefix   = "query: " if is_query else "passage: "
    prefixed = [f"{prefix}{t}" for t in texts]
    vectors  = model.encode(prefixed, normalize_embeddings=True, batch_size=32)
    return [v.tolist() for v in vectors]
