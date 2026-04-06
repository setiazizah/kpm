import type { IsuDetail } from '../types/isu'

export const ISU_DETAIL_MAP: Record<string, IsuDetail> = {
  'Hoaks Vaksin': {
    nama: 'Hoaks Vaksin',
    model: 'Model 1',
    source: 'Qdrant RAG',
    volume: 3124,
    sentimen: { pct: 88, label: 'Negatif 88%', type: 'negatif' },
    trend: { pct: 340, label: '↑ 340%', period: '24j' },
    subtopik: ['chip pelacak', 'vaksin berbahaya', 'konspirasi', 'disinformasi', 'whatsapp', 'klarifikasi'],
    narasi:
      'Narasi hoaks menyebar di TikTok dan WhatsApp. Isi: vaksin mengandung chip pelacak pemerintah. Akun follower besar turut menyebarkan. Counter-narasi dari dokter ada tapi kalah cepat.',
    platforms: [
      { name: 'TikTok',          count: 1842, pct: 59, color: '#FF0050' },
      { name: 'WhatsApp (est.)', count: 980,  pct: 31, color: '#25D366' },
      { name: 'Twitter/X',       count: 210,  pct: 7,  color: '#1DA1F2' },
      { name: 'Instagram',       count: 92,   pct: 3,  color: '#E1306C' },
    ],
    rekomendasi:
      '⚠️ PRIORITAS TINGGI. Rilis klarifikasi resmi Komdigi + Kemenkes dalam 3 jam. Laporkan akun penyebar ke TikTok. Aktivasi KOL kesehatan. Buat FAQ untuk grup WhatsApp.',
    prioritas: 'tinggi',
  },
  'Judi Online Pelajar': {
    nama: 'Judi Online Pelajar',
    model: 'Model 1',
    source: 'Qdrant RAG',
    volume: 2870,
    sentimen: { pct: 91, label: 'Negatif 91%', type: 'negatif' },
    trend: { pct: 280, label: '↑ 280%', period: '24j' },
    subtopik: ['pelajar SMP', 'aplikasi judi', 'orang tua', 'kemenkominfo', 'blokir'],
    narasi:
      'Isu judi online menyasar pelajar SMP-SMA viral di Twitter dan TikTok. Video pelajar bermain judi online beredar luas. Desakan blokir aplikasi menguat. Tanggapan Kominfo dinilai lambat oleh warganet.',
    platforms: [
      { name: 'Twitter/X',    count: 1580, pct: 55, color: '#1DA1F2' },
      { name: 'TikTok',       count: 860,  pct: 30, color: '#FF0050' },
      { name: 'Instagram',    count: 287,  pct: 10, color: '#E1306C' },
      { name: 'Media Online', count: 143,  pct: 5,  color: '#6B7A8F' },
    ],
    rekomendasi:
      '⚠️ PRIORITAS TINGGI. Keluarkan pernyataan resmi Kominfo terkait tindakan pemblokiran. Koordinasi dengan Kemendikbud untuk edukasi sekolah. Aktifkan saluran aduan orang tua.',
    prioritas: 'tinggi',
  },
  'Banjir Jabodetabek': {
    nama: 'Banjir Jabodetabek',
    model: 'Model 1',
    source: 'Qdrant RAG',
    volume: 5210,
    sentimen: { pct: 68, label: 'Negatif 68%', type: 'negatif' },
    trend: { pct: 190, label: '↑ 190%', period: '24j' },
    subtopik: ['banjir', 'penanganan lambat', 'BPBD', 'pompa air', 'normalisasi sungai'],
    narasi:
      'Banjir besar melanda Jabodetabek akibat curah hujan ekstrem. Kritik terhadap lambatnya respons pemerintah daerah mendominasi. Warga menggunakan media sosial untuk meminta evakuasi. Informasi posko bantuan tersebar tidak merata.',
    platforms: [
      { name: 'Twitter/X',    count: 2605, pct: 50, color: '#1DA1F2' },
      { name: 'TikTok',       count: 1563, pct: 30, color: '#FF0050' },
      { name: 'Instagram',    count: 521,  pct: 10, color: '#E1306C' },
      { name: 'Media Online', count: 521,  pct: 10, color: '#6B7A8F' },
    ],
    rekomendasi:
      '⚠️ PRIORITAS TINGGI. Aktifkan Crisis Communication Center. Posting update berkala di semua platform setiap 2 jam. Koordinasi dengan BNPB untuk konten evakuasi. Bantu distribusi info posko.',
    prioritas: 'tinggi',
  },
  'Literasi Digital': {
    nama: 'Literasi Digital',
    model: 'Model 1',
    source: 'Qdrant RAG',
    volume: 4130,
    sentimen: { pct: 55, label: 'Positif 55%', type: 'positif' },
    trend: { pct: 45, label: '↑ 45%', period: '24j' },
    subtopik: ['program pemerintah', 'pelatihan', 'UMKM digital', 'desa digital', 'kompetensi'],
    narasi:
      'Program Literasi Digital mendapat respons beragam. Apresiasi atas jangkauan program ke daerah terpencil. Namun kritik muncul soal kualitas materi pelatihan dan relevansi bagi UMKM lokal. Komunitas digital grassroots meminta keterlibatan lebih aktif.',
    platforms: [
      { name: 'Twitter/X',    count: 1900, pct: 46, color: '#1DA1F2' },
      { name: 'Instagram',    count: 1073, pct: 26, color: '#E1306C' },
      { name: 'TikTok',       count: 826,  pct: 20, color: '#FF0050' },
      { name: 'Media Online', count: 331,  pct: 8,  color: '#6B7A8F' },
    ],
    rekomendasi:
      'Tingkatkan transparansi laporan capaian program. Libatkan komunitas digital lokal dalam penyusunan kurikulum. Buat konten success story UMKM digital yang lebih relatable.',
    prioritas: 'sedang',
  },
  'Internet Gratis Desa': {
    nama: 'Internet Gratis Desa',
    model: 'Model 1',
    source: 'Qdrant RAG',
    volume: 3650,
    sentimen: { pct: 61, label: 'Positif 61%', type: 'positif' },
    trend: { pct: 38, label: '↑ 38%', period: '24j' },
    subtopik: ['BTS 4G', 'desa 3T', 'akses internet', 'Bakti Kominfo', 'konektivitas'],
    narasi:
      'Program internet gratis desa mendapat sambutan antusias di wilayah 3T. Keluhan tentang kecepatan koneksi yang tidak stabil juga muncul. Kepala desa aktif mempromosikan manfaat program. Ada permintaan perluasan cakupan ke desa-desa perbatasan.',
    platforms: [
      { name: 'Twitter/X',    count: 1460, pct: 40, color: '#1DA1F2' },
      { name: 'Facebook',     count: 1095, pct: 30, color: '#1877F2' },
      { name: 'Instagram',    count: 730,  pct: 20, color: '#E1306C' },
      { name: 'Media Online', count: 365,  pct: 10, color: '#6B7A8F' },
    ],
    rekomendasi:
      'Publikasikan roadmap perluasan cakupan BTS. Buat kanal pengaduan kecepatan internet yang responsif. Kembangkan konten testimoni warga desa untuk memperkuat narasi positif.',
    prioritas: 'sedang',
  },
  'PP TUNAS': {
    nama: 'PP TUNAS',
    model: 'Model 1',
    source: 'Qdrant RAG',
    volume: 8450,
    sentimen: { pct: 71, label: 'Positif 71%', type: 'positif' },
    trend: { pct: 12, label: '↑ 12%', period: '24j' },
    subtopik: ['perlindungan anak', 'internet sehat', 'parental control', 'regulasi', 'pendidikan digital'],
    narasi:
      'PP TUNAS (Tata Kelola Penggunaan Anak di Internet) mendapat sambutan positif dari kalangan orang tua dan pendidik. Apresiasi tinggi atas poin parental control yang diwajibkan platform. Beberapa kalangan industri menyuarakan kekhawatiran implementasi teknis.',
    platforms: [
      { name: 'Twitter/X',    count: 3802, pct: 45, color: '#1DA1F2' },
      { name: 'Instagram',    count: 2535, pct: 30, color: '#E1306C' },
      { name: 'TikTok',       count: 1690, pct: 20, color: '#FF0050' },
      { name: 'Media Online', count: 423,  pct: 5,  color: '#6B7A8F' },
    ],
    rekomendasi:
      'Manfaatkan momentum positif untuk edukasi publik tentang fitur PP TUNAS. Libatkan komunitas parenting sebagai duta. Siapkan FAQ teknis untuk industri platform digital.',
    prioritas: 'sedang',
  },
}
