"""
scripts/init_vector_db.py
--------------------------
Script one-time untuk:
  1. Buat collection di Qdrant (kalau belum ada)
  2. Insert data awal (mock data KPM) dengan embedding ASLI

Cara pakai:
  python scripts/init_vector_db.py

Jalankan sekali setelah docker compose up untuk isi data awal.
Kalau mau reset dari awal: python scripts/init_vector_db.py --recreate
"""

import sys
import os

# Tambah path backend agar bisa import app.*
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.services.embedder import embed_passage, EMBEDDING_DIM
from app.services.qdrant_service import setup_collection, upsert_batch, collection_info

# ---------------------------------------------------------------------------
# Data mock KPM — isi awal untuk development
# ---------------------------------------------------------------------------

MOCK_CHUNKS = [
    {
        "content_id"    : 1,
        "text"          : "Kenaikan harga BBM memicu gelombang protes di berbagai kota besar Indonesia. Masyarakat mengeluhkan dampak langsung terhadap biaya transportasi dan kebutuhan pokok.",
        "keywords"      : ["BBM", "kenaikan harga", "protes", "transportasi"],
        "issue_category": "ekonomi",
        "issue_summary" : "Protes kenaikan BBM",
        "sentiment"     : "negatif",
        "published_at"  : "2026-03-01T08:00:00Z",
        "region"        : "nasional",
        "source_url"    : "https://example.com/berita/1",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 2,
        "text"          : "Pemerintah mengumumkan program subsidi tambahan untuk masyarakat terdampak kenaikan BBM. Dana bantuan langsung tunai akan disalurkan melalui kantor pos dan bank pemerintah.",
        "keywords"      : ["subsidi", "BLT", "bantuan", "pemerintah"],
        "issue_category": "ekonomi",
        "issue_summary" : "Subsidi dampak BBM",
        "sentiment"     : "positif",
        "published_at"  : "2026-03-02T09:00:00Z",
        "region"        : "nasional",
        "source_url"    : "https://example.com/berita/2",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 3,
        "text"          : "Isu kesehatan masyarakat mencuat akibat polusi udara yang semakin parah di Jakarta. Data menunjukkan peningkatan kasus ISPA sebesar 30% dalam sebulan terakhir.",
        "keywords"      : ["polusi udara", "ISPA", "kesehatan", "Jakarta"],
        "issue_category": "kesehatan",
        "issue_summary" : "Polusi udara Jakarta",
        "sentiment"     : "negatif",
        "published_at"  : "2026-03-03T10:00:00Z",
        "region"        : "DKI Jakarta",
        "source_url"    : "https://example.com/berita/3",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 4,
        "text"          : "Proyek infrastruktur jalan tol Trans-Jawa berhasil mengurangi waktu tempuh antar kota hingga 40%. Masyarakat menyambut positif kemudahan akses transportasi darat ini.",
        "keywords"      : ["tol", "infrastruktur", "Trans-Jawa", "transportasi"],
        "issue_category": "infrastruktur",
        "issue_summary" : "Tol Trans-Jawa efektif",
        "sentiment"     : "positif",
        "published_at"  : "2026-03-04T11:00:00Z",
        "region"        : "Jawa",
        "source_url"    : "https://example.com/berita/4",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 5,
        "text"          : "Hoaks tentang vaksin beredar luas di media sosial memicu kekhawatiran penurunan tingkat vaksinasi nasional. Kominfo mengambil langkah tegas dengan memblokir ratusan konten disinformasi.",
        "keywords"      : ["hoaks", "vaksin", "disinformasi", "media sosial"],
        "issue_category": "kesehatan",
        "issue_summary" : "Hoaks vaksin di medsos",
        "sentiment"     : "negatif",
        "published_at"  : "2026-03-05T12:00:00Z",
        "region"        : "nasional",
        "source_url"    : "https://example.com/berita/5",
        "platform"      : "twitter",
    },
    {
        "content_id"    : 6,
        "text"          : "Banjir melanda kawasan Jakarta Utara akibat curah hujan ekstrem selama tiga hari berturut-turut. Ribuan warga terpaksa mengungsi ke tempat yang lebih aman.",
        "keywords"      : ["banjir", "Jakarta Utara", "bencana", "pengungsi"],
        "issue_category": "bencana",
        "issue_summary" : "Banjir Jakarta Utara",
        "sentiment"     : "negatif",
        "published_at"  : "2026-03-06T07:00:00Z",
        "region"        : "DKI Jakarta",
        "source_url"    : "https://example.com/berita/6",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 7,
        "text"          : "Pemerintah meluncurkan program digitalisasi UMKM nasional untuk meningkatkan daya saing pelaku usaha kecil. Lebih dari 500 ribu UMKM ditargetkan bergabung platform digital tahun ini.",
        "keywords"      : ["UMKM", "digitalisasi", "ekonomi digital", "program pemerintah"],
        "issue_category": "ekonomi",
        "issue_summary" : "Digitalisasi UMKM",
        "sentiment"     : "positif",
        "published_at"  : "2026-03-07T13:00:00Z",
        "region"        : "nasional",
        "source_url"    : "https://example.com/berita/7",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 8,
        "text"          : "Narasi negatif tentang kebijakan pemerintah menyebar cepat di Twitter dan TikTok. Analisis menunjukkan pola koordinasi akun-akun tidak autentik yang memperkuat sentimen negatif.",
        "keywords"      : ["narasi negatif", "Twitter", "TikTok", "disinformasi", "koordinasi"],
        "issue_category": "komunikasi publik",
        "issue_summary" : "Narasi negatif terkoordinasi",
        "sentiment"     : "negatif",
        "published_at"  : "2026-03-08T14:00:00Z",
        "region"        : "nasional",
        "source_url"    : "https://example.com/berita/8",
        "platform"      : "twitter",
    },
    {
        "content_id"    : 9,
        "text"          : "Angka kemiskinan nasional berhasil ditekan ke level terendah dalam satu dekade terakhir. Program bantuan sosial terpadu dinilai efektif menyasar kelompok paling rentan.",
        "keywords"      : ["kemiskinan", "bansos", "kesejahteraan", "sosial"],
        "issue_category": "sosial",
        "issue_summary" : "Penurunan angka kemiskinan",
        "sentiment"     : "positif",
        "published_at"  : "2026-03-09T15:00:00Z",
        "region"        : "nasional",
        "source_url"    : "https://example.com/berita/9",
        "platform"      : "media_online",
    },
    {
        "content_id"    : 10,
        "text"          : "Isu korupsi dana desa kembali mencuat setelah KPK menangkap beberapa kepala desa di Jawa Tengah. Masyarakat menuntut transparansi pengelolaan anggaran desa.",
        "keywords"      : ["korupsi", "dana desa", "KPK", "transparansi"],
        "issue_category": "hukum",
        "issue_summary" : "Korupsi dana desa",
        "sentiment"     : "negatif",
        "published_at"  : "2026-03-10T16:00:00Z",
        "region"        : "Jawa Tengah",
        "source_url"    : "https://example.com/berita/10",
        "platform"      : "media_online",
    },
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(recreate: bool = False):
    print("=" * 50)
    print("KPM Tim 4 — Qdrant Init Script")
    print("=" * 50)

    # 1. Setup collection
    print("\n[1/3] Setup collection...")
    setup_collection(recreate=recreate)

    # 2. Insert data dengan embedding asli
    print(f"\n[2/3] Embed & insert {len(MOCK_CHUNKS)} chunks...")
    print("      (Download model ~470MB kalau pertama kali, tunggu ya...)\n")
    upsert_batch(MOCK_CHUNKS)

    # 3. Verifikasi
    print("\n[3/3] Verifikasi...")
    info = collection_info()
    print(f"      Collection : {info['collection']}")
    print(f"      Total vector: {info['total_vectors']}")
    print(f"      Dimensi     : {info['dimension']}")
    print(f"      Status      : {info['status']}")

    print("\nSelesai! Data siap di Qdrant.")
    print("Cek di http://localhost:6333/dashboard")


if __name__ == "__main__":
    recreate = "--recreate" in sys.argv
    if recreate:
        print("Mode RECREATE: semua data lama akan dihapus!")
    main(recreate=recreate)
