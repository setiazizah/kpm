# AITF Frontend Docker Deployment Guide

## Quick Start - Development dengan Docker

### Prerequisites
- Docker & Docker Compose installed
- KPM backend sudah running di docker network `aitf_net`

### Step 1: Start KPM Backend (jika belum running)
```bash
cd kpm
docker compose up -d
```

Verifikasi:
```bash
docker compose ps
# Output harus menunjukkan: api, postgres, redis, qdrant, prefect-server, prefect-worker, worker
```

### Step 2: Build & Start AITF Frontend
```bash
cd AITF
docker compose up -d --build
```

Verifikasi:
```bash
docker compose ps
# Output: aitf_frontend (80:3000)
```

### Step 3: Test Koneksi
```bash
# Frontend
curl http://localhost:3000

# Backend health
curl http://localhost:8000/health

# Frontend melalui docker network
docker exec aitf_frontend curl http://tim4_api:8000/health
```

### Step 4: Akses Aplikasi
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Prefect Server: http://localhost:4200

---

## Docker Environment Variables

| Var | Default | Keterangan |
|-----|---------|-----------|
| `BACKEND_URL` | `http://tim4_api:8000` | URL backend untuk proxy (docker) |
| `NGINX_LOG_LEVEL` | `warn` | Nginx logging level |

---

## Troubleshooting

### 1. Frontend tidak bisa reach backend
```bash
# Check network
docker network inspect aitf_net

# Check logs
docker compose logs frontend

# Test from inside container
docker exec aitf_frontend curl http://tim4_api:8000/health
```

### 2. Port 3000 sudah terpakai
```bash
# Ganti port di docker-compose.yml
# ports:
#   - "3001:80"  # Ganti ke 3001

docker compose up -d --build
# Akses: http://localhost:3001
```

### 3. Static assets 404
```bash
# Cek build output
docker compose build --no-cache

# View logs
docker compose logs frontend
```

---

## Production Deployment

### Environment Variables
```bash
# .env untuk KPM backend
BACKEND_URL=http://api:8000

# Jika perlu expose ke external:
# docker-compose.yml:
#   ports:
#     - "80:80"
```

### SSL/TLS Setup (Optional)
Update `nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
}
```

### Scale dengan Nginx Reverse Proxy
```nginx
upstream aitf_frontend {
    server aitf_frontend:80;
}

server {
    listen 80;
    server_name app.example.com;
    
    location / {
        proxy_pass http://aitf_frontend;
        proxy_set_header Host $host;
    }
}
```

---

## Logs & Monitoring

### View Logs
```bash
# All services
docker compose logs -f

# Frontend only
docker compose logs -f frontend

# Specific time range
docker compose logs --since 10m frontend
```

### Monitor Performance
```bash
# Resource usage
docker stats

# Network
docker exec aitf_frontend curl -i http://tim4_api:8000/health
```

---

## Cleanup

```bash
# Stop services
docker compose down

# Remove volumes
docker compose down -v

# Remove images
docker rmi aitf_frontend kpm-api kpm-prefect-worker
```

---

## Next Steps

1. ✅ Setup backend KPM (`kpm/`)
2. ✅ Build & run frontend AITF (`AITF/`)
3. ⏳ Configure domain & SSL jika production
4. ⏳ Setup monitoring & logging (e.g., ELK, Datadog)
5. ⏳ CI/CD pipeline (GitHub Actions, GitLab CI)
