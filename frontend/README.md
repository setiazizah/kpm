# TIM4 MVP Frontend

Prototipe MVP frontend untuk proyek AITF, dibangun dengan React, TypeScript, Vite, dan Tailwind CSS.

## Tech Stack

- **React 18** — UI library
- **TypeScript 5** — Type safety
- **Vite 5** — Build tool & dev server (port 3000)
- **Tailwind CSS 3** — Utility-first styling
- **Recharts** — Library grafik/chart
- **Lucide React** — Icon library

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Tambahkan font Samsung Sans ke `src/assets/fonts/SamsungSans-Regular.woff2`
   (font tidak disertakan karena alasan lisensi — unduh sendiri dan letakkan di folder tersebut).

3. Jalankan dev server:

   ```bash
   npm run dev
   ```

   Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Keterangan                        |
| ------------------- | --------------------------------- |
| `npm run dev`       | Menjalankan dev server            |
| `npm run build`     | Build production ke folder `dist` |
| `npm run preview`   | Preview hasil build               |
| `npm run typecheck` | Cek tipe TypeScript tanpa build   |

## Struktur Folder

```
src/
├── api/            # Fungsi pemanggilan API
├── auth/           # Utilitas autentikasi
├── assets/fonts/   # File webfont (tidak di-commit)
├── components/     # Komponen UI yang dapat digunakan ulang
│   └── ui/         # Komponen primitif (Button, dll.)
├── features/       # Komponen per fitur/domain
├── hooks/          # Custom React hooks
├── lib/            # Utilitas umum (format, helper)
├── pages/          # Halaman/route utama
├── styles/         # File CSS global (Tailwind)
└── main.tsx        # Entry point aplikasi
```

## Desain Token (Warna)

| Token        | Hex       |
| ------------ | --------- |
| `primary`    | `#196ECD` |
| `surface`    | `#F7F9FB` |
| `accent`     | `#CDE9F6` |
| `background` | `#FFFFFF` |
| `text`       | `#000000` |
