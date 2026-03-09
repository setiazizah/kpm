/**
 * Dummy data untuk mensimulasikan respons backend saat development.
 * Semua delay sengaja dibuat untuk mensimulasikan latency jaringan.
 */
import type {
  AnalyzeResponse,
  GenerateStratkomResponse,
  ReviseResponse,
  ExportContentResponse,
} from '../types/workflow'

// Delay helper
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ----------------------------------------------------------------
// TEMPLATE DUMMY — bisa di-override berdasarkan query keyword
// ----------------------------------------------------------------

function detectTopic(query: string): 'bbm' | 'umkm' | 'pangan' | 'generic' {
  const q = query.toLowerCase()
  if (q.includes('bbm') || q.includes('bahan bakar') || q.includes('bensin')) return 'bbm'
  if (q.includes('umkm') || q.includes('digitalisasi') || q.includes('usaha')) return 'umkm'
  if (q.includes('pangan') || q.includes('sembako') || q.includes('beras') || q.includes('harga')) return 'pangan'
  return 'generic'
}

const DUMMY_NARASI: Record<string, AnalyzeResponse['narasi']> = {
  bbm: {
    isu: 'Kenaikan Harga BBM 15%',
    narasi:
      'Kenaikan harga Bahan Bakar Minyak (BBM) sebesar 15% yang diumumkan Pemerintah pada 30 Desember 2024 memicu gelombang reaksi negatif di media sosial. Dalam 72 jam sejak pengumuman, tercatat 3.241 konten dengan sentimen dominan negatif (72%). Isu ini menjadi yang paling berdampak tinggi sepanjang kuartal pertama 2025. Pemerintah perlu menyiapkan narasi kontra yang empatik, transparan, dan didukung data konkret tentang manfaat jangka panjang kebijakan ini bagi pembangunan nasional.',
    key_points: [
      'Kenaikan 15% diumumkan 30 Des 2024 — 3.241 konten, 72% sentimen negatif dalam 72 jam',
      'Narasi "pemerintah tidak pro-rakyat" menyebar organik via oposisi di Twitter/X, jangkauan 2,4 juta akun',
      '#BBMNaik trending nasional 2 hari, 45.000+ tweet, 1.200+ video TikTok',
      'UMKM dan sopir angkutan jadi kelompok paling terdampak secara narasi publik',
      '34 artikel media mainstream dengan framing kritis — perlu klarifikasi resmi segera',
    ],
  },
  umkm: {
    isu: 'Digitalisasi UMKM 2025',
    narasi:
      'Program digitalisasi UMKM yang ditargetkan menjangkau 30 juta pelaku usaha pada 2025 mendapat respons beragam di publik. Meski terdapat antusiasme dari pelaku UMKM muda, sebagian besar pelaku usaha mikro tradisional masih menyatakan kekhawatiran soal literasi digital dan infrastruktur. Anggaran Rp 2 Triliun yang dialokasikan perlu dikomunikasikan secara transparan untuk menjaga kepercayaan publik.',
    key_points: [
      'Target 30 juta UMKM terdigitalisasi pada akhir 2025 — anggaran Rp 2 Triliun',
      'Tantangan utama: literasi digital rendah di daerah terpencil (68% UMKM di luar Jawa)',
      'Sentimen positif di segmen UMKM muda (18–35 tahun) — 64% mendukung program',
      'Narasi negatif: kekhawatiran data pribadi dan ketergantungan platform asing',
      'Kemitraan dengan Grab, Gojek, dan Shopee menjadi titik kontroversi tersendiri',
    ],
  },
  pangan: {
    isu: 'Stabilitas Harga Pangan Nasional',
    narasi:
      'Kenaikan harga beras dan sejumlah komoditas pangan strategis dalam 30 hari terakhir memicu kekhawatiran publik yang luas, khususnya menjelang Ramadan. Pemerintah melalui Bulog telah melakukan operasi pasar di 120 titik, namun dampaknya belum dirasakan secara merata. Komunikasi yang terkoordinasi antara Kemendag, Kemenperin, dan Bulog sangat diperlukan untuk meredakan kepanikan pasar.',
    key_points: [
      'Harga beras naik 18% dalam 30 hari terakhir — tertinggi sejak 2018',
      'Operasi pasar Bulog di 120 titik belum mampu menstabilkan harga di tingkat konsumen',
      'Sentimen negatif 68% di media sosial, dipicu video viral antrean panjang di operasi pasar',
      'Kemendag, Kemenperin, dan Bulog belum menunjukkan koordinasi narasi yang terpadu',
      'Permintaan meningkat 23% menjelang Ramadan — proyeksi tekanan harga berlanjut 6 minggu',
    ],
  },
  generic: {
    isu: 'Isu Komunikasi Publik',
    narasi:
      'Berdasarkan analisis data dari berbagai platform media sosial dan media online, isu yang diangkat membutuhkan penanganan komunikasi publik yang terstruktur dan responsif. Pemerintah perlu memastikan narasi yang konsisten, transparan, dan berbasis data untuk menjaga kepercayaan publik. Strategi komunikasi multi-channel yang melibatkan media tradisional dan digital secara terintegrasi sangat disarankan.',
    key_points: [
      'Volume konten terkait isu meningkat signifikan dalam 48 jam terakhir',
      'Sentimen dominan negatif — perlu counter-narasi berbasis fakta',
      'Media sosial menjadi arena utama pembentukan opini publik',
      'Koordinasi lintas kementerian/lembaga diperlukan untuk narasi terpadu',
      'Window waktu respons optimal: 24–48 jam sejak isu mencuat',
    ],
  },
}

const DUMMY_RETRIEVED_DOCS = {
  bbm: [
    { doc_id: 'd-001', content: 'Pengumuman resmi penyesuaian harga BBM per 30 Desember 2024: Premium Rp 12.000/L, Pertalite Rp 13.500/L, Pertamax Rp 14.500/L. Alasan: penyesuaian subsidi fiskal dan harga minyak dunia.', source: 'Kementerian ESDM', score: 0.97 },
    { doc_id: 'd-002', content: 'Data survei BPS: 78% rumah tangga berpenghasilan rendah menyatakan terdampak kenaikan BBM. Pengeluaran transportasi meningkat rata-rata Rp 250.000/bulan.', source: 'BPS Indonesia', score: 0.93 },
    { doc_id: 'd-003', content: 'Perbandingan harga BBM ASEAN 2024: Indonesia Rp 12.000 vs Malaysia Rp 8.200 vs Filipina Rp 16.700 vs Thailand Rp 15.100.', source: 'IEA Regional Report', score: 0.88 },
    { doc_id: 'd-004', content: 'Pemerintah menyiapkan BLT BBM Rp 600.000 untuk 20 juta Keluarga Penerima Manfaat. Penyaluran via Kantor Pos dan BRI mulai 5 Januari 2025.', source: 'Kemenko Perekonomian', score: 0.85 },
  ],
  umkm: [
    { doc_id: 'd-011', content: 'Roadmap Digitalisasi UMKM 2023–2025: target 30 juta UMKM onboard platform digital, anggaran Rp 2T dari APBN dan kemitraan swasta.', source: 'Kemenkop UKM', score: 0.96 },
    { doc_id: 'd-012', content: 'Survei INDEF: 62% UMKM di luar Jawa belum memiliki smartphone memadai untuk mengakses platform e-commerce. Infrastruktur internet jadi hambatan utama.', source: 'INDEF 2024', score: 0.91 },
    { doc_id: 'd-013', content: 'Kemitraan Kemenkop dengan Shopee, Tokopedia, Gojek: subsidi biaya platform 0% selama 12 bulan pertama untuk UMKM baru terdaftar.', source: 'Kemenkop UKM', score: 0.87 },
  ],
  pangan: [
    { doc_id: 'd-021', content: 'Data harga beras medium nasional Desember 2024: Rp 14.500/kg, naik dari Rp 12.300/kg Januari 2024. Kenaikan 18% tertinggi sejak 2018.', source: 'Panel Harga Pangan Kemendag', score: 0.95 },
    { doc_id: 'd-022', content: 'Operasi pasar Bulog: 120 titik di 34 provinsi, penyaluran beras SPHP 50.000 ton/minggu. Stok nasional aman hingga Mei 2025.', source: 'Bulog Persero', score: 0.90 },
    { doc_id: 'd-023', content: 'Proyeksi FAO: El Niño 2024 berdampak pada produksi padi nasional, estimasi penurunan produksi 8% dibandingkan tahun normal.', source: 'FAO Regional Office', score: 0.84 },
  ],
  generic: [
    { doc_id: 'd-031', content: 'Panduan Manajemen Komunikasi Krisis Pemerintah: respons pertama dalam 2 jam, klarifikasi resmi dalam 24 jam, pembaruan berkala setiap 12 jam.', source: 'Kemkominfo', score: 0.85 },
    { doc_id: 'd-032', content: 'Strategi komunikasi digital pemerintah 2024: prioritas konten edukatif, penggunaan infografis dan video pendek, penguatan kanal resmi.', source: 'Kemkominfo', score: 0.80 },
  ],
}

const DUMMY_STRATKOM: Record<string, GenerateStratkomResponse['stratkom']> = {
  bbm: {
    strategi: 'Komunikasi Proaktif Berbasis Empati dengan Data Konkret',
    pesan_utama:
      'Pemerintah memahami beban masyarakat, telah menyiapkan bantuan langsung, dan kebijakan ini adalah investasi jangka panjang untuk kemandirian energi Indonesia.',
    rekomendasi: [
      'Gelar press conference resmi hari ini 14:00 WIB — Menteri ESDM + Jubir Presiden, fokus pada transparansi data + pengumuman BLT',
      'Rilis infografis "5 Fakta BBM yang Perlu Kamu Tahu" di Instagram resmi kementerian — data perbandingan ASEAN',
      'Produksi video TikTok 60 detik dengan spokesperson muda — tone empatik, data driven',
      'Thread Twitter/X dengan visualisasi data alokasi dana subsidi ke pendidikan & kesehatan',
      'Aktifkan KOL (Key Opinion Leader) dari kalangan akademisi & pegiat ekonomi untuk amplifikasi narasi positif',
      'Siapkan FAQ untuk wartawan — ready dalam 2 jam sebelum press conference',
    ],
  },
  umkm: {
    strategi: 'Komunikasi Inklusif dengan Bukti Nyata di Lapangan',
    pesan_utama:
      'Digitalisasi UMKM bukan sekadar teknologi, tapi jalan menuju kemandirian ekonomi dan pasar yang lebih luas bagi seluruh pelaku usaha Indonesia.',
    rekomendasi: [
      'Kunjungan lapangan Menteri ke UMKM yang sudah berhasil digital — konten autentik untuk media sosial',
      'Testimoni video dari pelaku UMKM yang sukses — distribusi via Reels Instagram dan TikTok',
      'Webinar nasional gratis "UMKM Go Digital" — target 100.000 peserta, sertifikat resmi',
      'Infografis "Manfaat Nyata Program Digitalisasi" — data kuantitatif pertumbuhan omzet',
      'Kolaborasi dengan asosiasi UMKM daerah untuk sosialisasi tatap muka di 34 provinsi',
      'Hotline pengaduan & konsultasi digitalisasi 24/7 — tunjukkan komitmen after-sales',
    ],
  },
  pangan: {
    strategi: 'Komunikasi Terpadu Multi-Kementerian dengan Aksi Nyata Terukur',
    pesan_utama:
      'Pemerintah hadir dan bekerja keras memastikan pasokan pangan mencukupi dengan harga terjangkau — stok aman, distribusi diperkuat, operasi pasar diperluas.',
    rekomendasi: [
      'Press conference bersama Kemendag + Kemenperin + Bulog — tunjukkan koordinasi solid, bukan saling lempar tanggung jawab',
      'Live streaming operasi pasar Bulog via media sosial — transparansi real-time kepada publik',
      'Rilis data stok pangan nasional secara berkala (2x seminggu) — bangun kepercayaan dengan data',
      'Konten edukatif resep masak hemat Ramadan — reframe isu ke solusi praktis untuk keluarga',
      'Koordinasi dengan Bupati/Walikota di 10 kota dengan harga tertinggi — solusi lokal spesifik',
      'Evaluasi dan komunikasi dampak operasi pasar setiap 3 hari — tunjukkan progress nyata',
    ],
  },
  generic: {
    strategi: 'Komunikasi Reaktif-Proaktif dengan Siklus Pembaruan Berkala',
    pesan_utama:
      'Pemerintah responsif, transparan, dan berbasis data dalam menangani setiap isu demi kepentingan seluruh masyarakat.',
    rekomendasi: [
      'Rilis pernyataan resmi dalam 24 jam — jangan biarkan narasi kosong diisi pihak lain',
      'Tetapkan spokesperson tunggal yang berwenang dan terpercaya untuk isu ini',
      'Siapkan data dan fakta pendukung — infografis yang mudah dipahami publik awam',
      'Aktifkan kanal resmi: website, media sosial kementerian, dan Kominfo untuk amplifikasi',
      'Monitoring sentimen real-time dan penyesuaian pesan setiap 6 jam selama fase krisis',
      'Evaluasi efektivitas komunikasi setelah 72 jam — ukur pergeseran sentimen publik',
    ],
  },
}

const DUMMY_REVISED_DRAFT: Record<string, string> = {
  bbm: `SIARAN PERS
PEMERINTAH REPUBLIK INDONESIA
Kementerian Energi dan Sumber Daya Mineral

─────────────────────────────────────────────────────────
PENYESUAIAN HARGA BBM: KEBIJAKAN DEMI KEMANDIRIAN ENERGI
DAN PERLINDUNGAN RAKYAT
─────────────────────────────────────────────────────────

Jakarta, 2 Januari 2025

Pemerintah Republik Indonesia menyampaikan penjelasan resmi terkait penyesuaian harga Bahan Bakar Minyak (BBM) yang berlaku mulai 30 Desember 2024.

LATAR BELAKANG KEBIJAKAN

Penyesuaian harga BBM merupakan respons terhadap dinamika harga minyak dunia yang terus berfluktuasi dan kebutuhan untuk menjaga keberlanjutan fiskal negara. Kebijakan ini diambil setelah kajian mendalam dan mempertimbangkan daya beli masyarakat.

PAKET PERLINDUNGAN MASYARAKAT

Pemerintah telah menyiapkan paket perlindungan komprehensif:
• Bantuan Langsung Tunai (BLT) BBM: Rp 600.000 untuk 20 juta Keluarga Penerima Manfaat
• Penyaluran mulai 5 Januari 2025 melalui Kantor Pos dan BRI di seluruh Indonesia
• Subsidi transportasi umum diperkuat 20% di 15 kota besar

KONTEKS REGIONAL

Harga BBM Indonesia pasca-penyesuaian masih kompetitif di kawasan ASEAN:
• Indonesia: Rp 12.000/liter (±USD 0,74)
• Malaysia: Rp 15.800/liter (disubsidi pemerintah federal)
• Filipina: Rp 16.700/liter
• Thailand: Rp 15.100/liter

ALOKASI PENGHEMATAN SUBSIDI

Dana penghematan subsidi BBM akan dialokasikan penuh untuk:
• Pendidikan: Rp 45 Triliun (beasiswa, infrastruktur sekolah)
• Kesehatan: Rp 32 Triliun (BPJS Kesehatan, puskesmas daerah 3T)
• Infrastruktur daerah: Rp 28 Triliun (jalan, jembatan, irigasi)

Pemerintah memahami dan berempati atas kekhawatiran masyarakat. Kami berkomitmen untuk terus hadir dan memastikan setiap rupiah penghematan subsidi kembali kepada rakyat dalam bentuk yang lebih merata dan tepat sasaran.

Untuk informasi lebih lanjut, hubungi:
Pusat Informasi Kementerian ESDM: 0800-100-2222 (bebas pulsa)
Email: komunikasi@esdm.go.id

─────────────────────────────────────────────────────────
Disiapkan oleh: Biro Komunikasi dan Layanan Informasi Publik
Kementerian Energi dan Sumber Daya Mineral RI`,

  umkm: `SIARAN PERS
KEMENTERIAN KOPERASI DAN UKM
REPUBLIK INDONESIA

─────────────────────────────────────────────────────────
PROGRAM DIGITALISASI UMKM 2025: MENUJU 30 JUTA UMKM
BERDAYA SAING DIGITAL
─────────────────────────────────────────────────────────

Jakarta, 2 Januari 2025

KOMITMEN DAN CAPAIAN

Pemerintah melalui Kementerian Koperasi dan UKM berkomitmen mengakselerasi digitalisasi 30 juta UMKM pada 2025. Hingga akhir 2024, sebanyak 22 juta UMKM telah terhubung ke platform digital — melampaui target awal 18 juta.

SKEMA DUKUNGAN KOMPREHENSIF

Anggaran Rp 2 Triliun dialokasikan untuk:
• Subsidi platform: 0% biaya listing selama 12 bulan pertama
• Pelatihan digital: 500.000 UMKM per kuartal via webinar dan luring
• Infrastruktur: Pengadaan 50.000 paket internet subsidized di daerah 3T
• Pendampingan: 10.000 Digital Advisor tersebar di seluruh provinsi

KEMITRAAN STRATEGIS

Kolaborasi dengan Shopee, Tokopedia, Gojek, dan Grab memungkinkan:
• Akses ke 150 juta pembeli potensial di Indonesia
• Fitur logistik terintegrasi dengan tarif khusus UMKM
• Perlindungan data dan privasi sesuai UU PDP No. 27/2022

TESTIMONI PELAKU USAHA

"Sejak bergabung program digitalisasi 8 bulan lalu, omzet batik kami naik 340% — dari Rp 12 juta ke Rp 53 juta per bulan." — Ibu Sari, UMKM Batik Pekalongan

Untuk informasi pendaftaran program:
Website: digitalumkm.kemenkopukm.go.id
Hotline: 1500-587 (bebas pulsa, 24/7)`,

  pangan: `PERNYATAAN BERSAMA
KEMENTERIAN PERDAGANGAN | KEMENTERIAN PERTANIAN | PERUM BULOG

─────────────────────────────────────────────────────────
STABILISASI HARGA PANGAN NASIONAL: LANGKAH KONKRET
PEMERINTAH MENJELANG RAMADAN 2025
─────────────────────────────────────────────────────────

Jakarta, 2 Januari 2025

SITUASI TERKINI

Pemerintah memantau dengan cermat dinamika harga pangan strategis, khususnya beras, dalam 30 hari terakhir. Tekanan harga dipicu kombinasi dampak El Niño dan peningkatan permintaan menjelang Ramadan. Pemerintah hadir dengan langkah-langkah konkret dan terukur.

TINDAKAN SEGERA

Bulog:
• Operasi pasar di 320 titik (diperluas dari 120 titik) di 34 provinsi
• Penyaluran beras SPHP 50.000 ton/minggu — stok aman hingga Mei 2025
• Harga beras SPHP Rp 10.900/kg — di bawah HET nasional

Kemendag:
• Operasi pasar terpadu di 10 kota dengan harga tertinggi
• Percepatan impor beras cadangan 500.000 ton dari Thailand dan Vietnam
• Sidak pasar serentak di 34 provinsi mulai pekan ini

PROYEKSI DAN KOMITMEN

Pemerintah menargetkan stabilisasi harga beras ke kisaran Rp 12.000–13.000/kg dalam 3 minggu ke depan. Pembaruan data harga akan dirilis setiap Senin dan Kamis di website resmi Kemendag.

Masyarakat dapat melapor harga tidak wajar melalui:
Hotline: 0800-1000-235 (Kemendag, bebas pulsa)
Aplikasi: SiGapura (tersedia di Play Store dan App Store)`,

  generic: `DOKUMEN STRATEGI KOMUNIKASI PUBLIK
─────────────────────────────────────────────────────────

RINGKASAN EKSEKUTIF

Berdasarkan analisis isu dan rekomendasi strategi komunikasi yang telah disusun, dokumen ini menyajikan draft komunikasi publik yang siap digunakan.

PESAN INTI

Pemerintah berkomitmen untuk transparan, responsif, dan berbasis data dalam setiap pengambilan kebijakan publik. Kepercayaan masyarakat adalah fondasi utama tata kelola pemerintahan yang baik.

RENCANA TINDAK LANJUT

1. Penerbitan pernyataan resmi dalam 24 jam
2. Konferensi pers dengan data pendukung
3. Distribusi konten digital multi-channel
4. Monitoring dan evaluasi sentimen berkala

Untuk informasi lebih lanjut, silakan hubungi:
Biro Komunikasi dan Layanan Informasi Publik
Kementerian/Lembaga terkait`,
}

// ----------------------------------------------------------------
// DUMMY API FUNCTIONS
// ----------------------------------------------------------------

export async function dummyAnalyze(query: string, sessionId: string): Promise<AnalyzeResponse> {
  await delay(1800) // simulasi RAG + LLM latency
  const topic = detectTopic(query)
  return {
    status:         'success',
    session_id:     sessionId,
    narasi:         DUMMY_NARASI[topic],
    retrieved_docs: DUMMY_RETRIEVED_DOCS[topic] || DUMMY_RETRIEVED_DOCS.generic,
    export_url:     null,
    step_meta: {
      retrieval: { status: 'success', latency_ms: 342,  fallback_used: false },
      narasi:    { status: 'success', latency_ms: 1421, fallback_used: false },
    },
    message: 'Narasi isu berhasil dibuat.',
  }
}

export async function dummyGenerateStratkom(sessionId: string, query: string): Promise<GenerateStratkomResponse> {
  await delay(1400)
  const topic = detectTopic(query)
  return {
    status:     'success',
    session_id: sessionId,
    stratkom:   DUMMY_STRATKOM[topic],
    export_url: null,
    step_meta: {
      stratkom: { status: 'success', latency_ms: 1203, fallback_used: false },
    },
    message: 'Strategi komunikasi berhasil dibuat.',
  }
}

export async function dummyRevise(sessionId: string, query: string, _userEdits?: string): Promise<ReviseResponse> {
  await delay(2200)
  const topic = detectTopic(query)
  const draft = DUMMY_REVISED_DRAFT[topic] || DUMMY_REVISED_DRAFT.generic
  return {
    status:        'success',
    session_id:    sessionId,
    revised_draft: draft,
    export_url:    `https://storage.example.com/exports/${sessionId}-brief.docx`,
    step_meta: {
      revision: { status: 'success', latency_ms: 1876, fallback_used: false },
      export:   { status: 'success', latency_ms: 445,  fallback_used: false },
    },
    message: null,
  }
}

export async function dummyExportContent(
  sessionId: string,
  _contentType: string,
  format: string,
): Promise<ExportContentResponse> {
  await delay(800)
  return {
    status:       'success',
    session_id:   sessionId,
    content_type: _contentType,
    format:       format as 'docx' | 'pdf',
    export_url:   `https://storage.example.com/exports/${sessionId}-${_contentType}.${format}`,
    message:      null,
  }
}
