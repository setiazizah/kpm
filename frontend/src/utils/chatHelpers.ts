import type { IsuDetail } from '../types/isu'

export interface ApiResult {
  isu: string
  narasi: string
  key_points: string[]
  docsCount: number
  query: string
}

export interface ChatMsg {
  role: 'user' | 'bot'
  text: string
}

export function buildIsuAnalysis(d: IsuDetail) {
  return {
    tipologi:
      d.sentimen.type === 'negatif' ? 'Kontra-pemerintah / disinformasi'
      : d.sentimen.type === 'positif' ? 'Dukungan & apresiasi publik'
      : 'Campuran pro-kontra',
    risiko:
      d.prioritas === 'tinggi'  ? 'TINGGI — potensi viral lintas platform 6–12 jam ke depan'
      : d.prioritas === 'sedang' ? 'SEDANG — pantau aktif setiap 4 jam'
      : 'RENDAH — tidak ada indikasi eskalasi signifikan',
    langkah: [
      `Rilis pernyataan resmi yang menjawab langsung poin "${d.subtopik[0]}"`,
      `Aktifkan KOL terpercaya di ${d.platforms[0].name} (dominan ${d.platforms[0].pct}%)`,
      'Siapkan konten counter-narasi format video pendek untuk TikTok & Reels',
      'Monitor kata kunci terkait setiap 2 jam hingga sentimen turun di bawah 50%',
    ],
  }
}

export function getIsuChatReply(q: string, d: IsuDetail): string {
  const lq = q.toLowerCase()
  if (lq.includes('platform') || lq.includes('mana'))
    return `Platform dominan: **${d.platforms[0].name}** (${d.platforms[0].pct}%) dari total ${d.volume.toLocaleString('id')} konten. Disusul ${d.platforms[1]?.name} (${d.platforms[1]?.pct}%).`
  if (lq.includes('sentimen') || lq.includes('negatif') || lq.includes('positif'))
    return `Sentimen: **${d.sentimen.label}** — tren ${d.trend.label} dalam ${d.trend.period} terakhir.`
  if (lq.includes('rekomendasi') || lq.includes('harus') || lq.includes('langkah'))
    return d.rekomendasi
  if (lq.includes('topik') || lq.includes('subtopik'))
    return `Sub-topik teridentifikasi: ${d.subtopik.map(t => `**${t}**`).join(', ')}.`
  if (lq.includes('generate') || lq.includes('narasi') || lq.includes('buat'))
    return `Draf narasi counter untuk "${d.nama}":\n\n"${d.nama} sedang ditangani secara serius. Pemerintah telah mengambil langkah konkret terkait ${d.subtopik.slice(0, 2).join(' dan ')}. Masyarakat diimbau memverifikasi informasi melalui kanal resmi."\n\nPerlu disesuaikan untuk platform tertentu?`
  return `Isu "${d.nama}": ${d.volume.toLocaleString('id')} konten, sentimen ${d.sentimen.label}. Tanyakan distribusi platform, aktor penyebar, atau minta generate narasi counter.`
}
