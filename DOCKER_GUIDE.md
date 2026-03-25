# 🐳 Panduan Docker — KPM Project

Panduan ini menjelaskan cara menjalankan, memperbarui, dan mengelola project ini menggunakan Docker setiap kali ada perubahan kode.

---

## 📋 Daftar Isi

1. [Struktur Services](#1-struktur-services)
2. [Pertama Kali Menjalankan](#2-pertama-kali-menjalankan)
3. [Alur Kerja: Menambah / Update Kode](#3-alur-kerja-menambah--update-kode)
4. [Perintah Sehari-hari](#4-perintah-sehari-hari)
5. [Update Dependencies (requirements.txt)](#5-update-dependencies-requirementstxt)
6. [Melihat Log & Debug](#6-melihat-log--debug)
7. [Menghentikan Services](#7-menghentikan-services)
8. [Reset Total (Hapus Data)](#8-reset-total-hapus-data)
9. [Troubleshooting Umum](#9-troubleshooting-umum)

---

## 1. Struktur Services

```
docker-compose.yml mendefinisikan 6 services:

┌─────────────────────┬──────────────────────────────┬────────┐
│ Service             │ Fungsi                       │ Port   │
├─────────────────────┼──────────────────────────────┼────────┤
│ postgres            │ Database utama               │ 5432   │
│ redis               │ Cache & broker Celery        │ 6379   │
│ qdrant              │ Vector database (RAG)        │ 6333   │
│ prefect-server      │ Prefect UI + API             │ 4200   │
│ prefect-worker      │ Eksekutor Prefect flows      │ -      │
│ api                 │ FastAPI backend              │ 8000   │
│ worker              │ Celery worker                │ -      │
└─────────────────────┴──────────────────────────────┴────────┘
```

Services yang di-**build dari kode kita** (perlu rebuild jika ada perubahan):
- `api` → kode FastAPI di `backend/app/`
- `prefect-worker` → sama, pakai Dockerfile yang sama
- `worker` → sama, pakai Dockerfile yang sama

Services yang pakai **image publik** (tidak perlu rebuild):
- `postgres`, `redis`, `qdrant`, `prefect-server`

---

## 2. Pertama Kali Menjalankan

### Langkah-langkah:

```bash
# 1. Masuk ke root project
cd /home/tehes/Documents/AITF-PROJECT/kpm

# 2. Pastikan file .env ada
cat .env

# 3. Build semua image dan jalankan semua services
docker compose up -d --build

# 4. Cek semua container berjalan
docker compose ps
```

### Verifikasi berhasil:

```bash
# Cek API berjalan
curl http://localhost:8000/health
# Harusnya: {"status":"ok"}

# Cek Prefect berjalan
curl http://localhost:4200/api/health
# Harusnya: true
```

### Buka di browser:
- **Prefect UI**: http://localhost:4200
- **FastAPI Docs**: http://localhost:8000/docs

---

## 3. Alur Kerja: Menambah / Update Kode

### 🔵 Skenario A: Update kode Python (backend)

Misalnya kamu mengubah file di `backend/app/` seperti:
- `backend/app/orchestration/steps/narasi_step.py`
- `backend/app/api/workflow.py`
- `backend/app/main.py`

```bash
# Setelah edit kode, rebuild hanya services yang berubah
docker compose up -d --build api prefect-worker worker

# Cek apakah berhasil
docker compose ps
docker compose logs api --tail=20
```

> ⚡ **Tips:** Gunakan `--build` hanya untuk service yang kodenya berubah,
> bukan semua service, agar lebih cepat.

---

### 🟢 Skenario B: Update kode frontend (React/TypeScript)

Kode frontend di `frontend/src/` **tidak** menggunakan Docker (berjalan di host langsung).

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies jika baru clone
npm install

# Jalankan dev server
npm run dev
# Buka: http://localhost:5173
```

---

### 🟡 Skenario C: Menambah file / modul baru di backend

Misalnya kamu menambah file `backend/app/orchestration/steps/new_step.py`:

```bash
# Rebuild image (karena ada file baru yang perlu di-COPY)
docker compose build api

# Restart container dengan image baru
docker compose up -d api

# Verifikasi
docker compose logs api --tail=30
```

---

### 🟠 Skenario D: Update `docker-compose.yml`

Misalnya menambah environment variable baru atau mengubah port:

```bash
# Hentikan semua, lalu jalankan ulang
docker compose down
docker compose up -d --build
```

---

## 4. Perintah Sehari-hari

### Menjalankan semua services:
```bash
docker compose up -d
```

### Menjalankan services tertentu saja:
```bash
# Hanya infrastruktur
docker compose up -d postgres redis qdrant

# Hanya Prefect
docker compose up -d prefect-server prefect-worker

# Hanya API
docker compose up -d api
```

### Rebuild satu service:
```bash
docker compose up -d --build api
docker compose up -d --build prefect-worker
docker compose up -d --build worker
```

### Rebuild semua service (setelah banyak perubahan):
```bash
docker compose up -d --build
```

### Restart service tanpa rebuild:
```bash
# Berguna jika hanya config/env yang berubah
docker compose restart api
docker compose restart prefect-worker
```

### Cek status semua container:
```bash
docker compose ps
```

---

## 5. Update Dependencies (`requirements.txt`)

Jika kamu menambah atau mengubah library Python di `requirements.txt`:

```bash
# Wajib build ulang dengan --no-cache agar pip install dijalankan ulang
docker compose build --no-cache api prefect-worker worker

# Lalu jalankan ulang
docker compose up -d api prefect-worker worker
```

> ⚠️ **Penting:** Tanpa `--no-cache`, Docker mungkin memakai cache lama
> dan perubahan `requirements.txt` tidak akan diterapkan.

### Contoh alur lengkap:

```bash
# 1. Edit requirements.txt, tambah library baru
echo "pandas==2.2.0" >> requirements.txt

# 2. Rebuild dengan no-cache
docker compose build --no-cache api prefect-worker worker

# 3. Jalankan ulang
docker compose up -d api prefect-worker worker

# 4. Verifikasi library terinstall
docker exec tim4_api pip show pandas
```

---

## 6. Melihat Log & Debug

### Log real-time satu service:
```bash
docker compose logs -f api
docker compose logs -f prefect-worker
docker compose logs -f prefect-server
```

### Log N baris terakhir:
```bash
docker compose logs api --tail=50
docker compose logs prefect-worker --tail=50
```

### Masuk ke dalam container (shell interaktif):
```bash
# Masuk ke container API
docker exec -it tim4_api bash

# Di dalam container, bisa jalankan Python langsung
python -c "from backend.app.main import app; print('OK')"

# Keluar dari container
exit
```

### Cek environment variable di dalam container:
```bash
docker exec tim4_api env | grep PREFECT
docker exec tim4_api env | grep POSTGRES
```

### Cek Prefect flow runs via terminal:
```bash
curl -s -X POST http://localhost:4200/api/flow_runs/filter \
  -H "Content-Type: application/json" \
  -d '{"limit": 5, "sort": "START_TIME_DESC"}' \
  | python3 -c "
import json, sys
for r in json.load(sys.stdin):
    print(r['name'], '->', r['state']['type'])
"
```

---

## 7. Menghentikan Services

### Hentikan semua (data tetap tersimpan):
```bash
docker compose down
```

### Hentikan satu service saja:
```bash
docker compose stop api
docker compose stop prefect-worker
```

### Jalankan kembali setelah dihentikan (tanpa rebuild):
```bash
docker compose up -d
```

---

## 8. Reset Total (Hapus Data)

> ⚠️ **Peringatan:** Perintah ini akan **menghapus semua data** database dan vector store!

```bash
# Hentikan semua container DAN hapus volumes (data PostgreSQL, Qdrant)
docker compose down -v

# Rebuild dari awal
docker compose up -d --build
```

### Hapus image lama yang tidak terpakai:
```bash
# Hapus image yang tidak digunakan
docker image prune -f

# Hapus semua resource Docker yang tidak digunakan
docker system prune -f
```

---

## 9. Troubleshooting Umum

### ❌ Container langsung mati setelah start

```bash
# Lihat log error
docker compose logs api

# Atau lihat exit code
docker inspect tim4_api --format='{{.State.ExitCode}} {{.State.Error}}'
```

---

### ❌ Port sudah dipakai (port conflict)

```bash
# Cek proses yang memakai port 8000
sudo lsof -i :8000

# Atau
sudo ss -tlnp | grep 8000

# Matikan proses tersebut atau ubah port di docker-compose.yml
```

---

### ❌ Perubahan kode tidak terlihat setelah restart

Ini terjadi karena Docker memakai **cache image lama**. Solusi:

```bash
# Force rebuild tanpa cache
docker compose build --no-cache api
docker compose up -d api
```

---

### ❌ Prefect worker tidak konek ke server

```bash
# Cek log worker
docker compose logs prefect-worker --tail=20

# Pastikan PREFECT_API_URL sudah benar
docker exec tim4_prefect_worker env | grep PREFECT

# Restart worker
docker compose restart prefect-worker
```

---

### ❌ `docker-compose: command not found`

Di sistem modern, gunakan `docker compose` (dengan spasi, tanpa tanda hubung):

```bash
# ❌ Lama (tidak tersedia)
docker-compose up

# ✅ Baru
docker compose up
```

---

## 📌 Ringkasan Cepat

| Situasi | Perintah |
|---|---|
| Pertama kali jalankan | `docker compose up -d --build` |
| Update kode Python | `docker compose up -d --build api prefect-worker worker` |
| Update `requirements.txt` | `docker compose build --no-cache api && docker compose up -d api` |
| Restart tanpa rebuild | `docker compose restart api` |
| Lihat log | `docker compose logs -f api` |
| Cek status | `docker compose ps` |
| Hentikan semua | `docker compose down` |
| Reset total + hapus data | `docker compose down -v` |

---

## 🌐 Akses Aplikasi

| Aplikasi | URL |
|---|---|
| FastAPI Docs (Swagger) | http://localhost:8000/docs |
| Prefect UI | http://localhost:4200 |
| Qdrant Dashboard | http://localhost:6333/dashboard |
