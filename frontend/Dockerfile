# ── Stage 1: Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .

# VITE_API_URL dipakai saat build (untuk mode dev proxy)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve dengan Nginx ──────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/templates/app.conf.template

COPY --from=builder /app/dist /usr/share/nginx/html

# BACKEND_URL dipakai nginx proxy — bisa dioverride saat docker run
ENV BACKEND_URL=http://localhost:8000

EXPOSE 80

# nginx envsubst: ganti ${BACKEND_URL} di nginx.conf dengan nilai env
CMD ["/bin/sh", "-c", \
  "envsubst '${BACKEND_URL}' < /etc/nginx/templates/app.conf.template > /etc/nginx/conf.d/app.conf && nginx -g 'daemon off;'"]
