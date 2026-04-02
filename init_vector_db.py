from qdrant_client import QdrantClient
from qdrant_client.http import models

client = QdrantClient(url="http://localhost:6333")

# CEK: Apakah collection sudah ada?
collections = client.get_collections().collections
exists = any(c.name == "vector_chunks" for c in collections)

if not exists:
    print("Collection belum ada, membuat baru...")
    client.create_collection(
        collection_name="vector_chunks",
        vectors_config=models.VectorParams(
            size=768, # Harus sama dengan dimensi model E5
            distance=models.Distance.COSINE
        )
    )
    print("Collection 'vector_chunks' berhasil dibuat!")
else:
    print("Collection sudah siap digunakan.")