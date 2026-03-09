# TIM 4 MVP Frontend

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
| `npm run lint`      | Cek linting ESLint                |
| `npm run lint:fix`  | Auto-fix linting ESLint           |

## Struktur Folder

```
src/
├── api/            # Fungsi pemanggilan API & dummy data
│   ├── workflow.ts     # API calls ke backend workflow
│   ├── dummyData.ts    # Data dummy untuk pengembangan
│   └── example.ts
├── auth/           # Utilitas autentikasi
│   └── auth.ts
├── assets/fonts/   # File webfont (tidak di-commit)
├── components/     # Komponen UI yang dapat digunakan ulang
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   └── ui/         # Komponen primitif
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ProgressBar.tsx
│       ├── RiskBadge.tsx
│       ├── SentimentBar.tsx
│       ├── SourceBadge.tsx
│       └── Spinner.tsx
├── context/        # React context / global state
│   └── AppContext.tsx
├── features/       # Komponen per fitur/domain
├── hooks/          # Custom React hooks
│   └── useToggle.ts
├── lib/            # Utilitas umum (format, helper)
├── pages/          # Halaman/route utama
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── ChatPage.tsx
│   ├── NarasiPage.tsx
│   ├── StratkomPage.tsx
│   ├── BriefPage.tsx
│   ├── BrowserKontenPage.tsx
│   ├── RiwayatPage.tsx
│   └── _app.tsx
├── styles/         # File CSS global (Tailwind)
├── types/          # TypeScript type definitions
│   ├── index.ts
│   └── workflow.ts
├── utils/          # Utilitas & validators
│   └── validators.ts
└── main.tsx        # Entry point aplikasi
```

## Halaman Aplikasi

| Halaman              | Deskripsi                                      |
| -------------------- | ---------------------------------------------- |
| `HomePage`           | Landing/beranda utama                          |
| `DashboardPage`      | Dashboard ringkasan & statistik                |
| `ChatPage`           | Antarmuka chat — query isu ke backend          |
| `NarasiPage`         | Tampilan hasil narasi isu dari Tim 2           |
| `StratkomPage`       | Tampilan strategi komunikasi dari Tim 3        |
| `BriefPage`          | Tampilan brief/draft hasil revisi LLM          |
| `BrowserKontenPage`  | Browser konten & dokumen referensi             |
| `RiwayatPage`        | Riwayat sesi dan hasil workflow sebelumnya     |



## Desain Token (Warna)

| Token        | Hex       |
| ------------ | --------- |
| `primary`    | `#196ECD` |
| `surface`    | `#F7F9FB` |
| `accent`     | `#CDE9F6` |
| `background` | `#FFFFFF` |
| `text`       | `#000000` |
