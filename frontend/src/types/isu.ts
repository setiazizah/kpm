export interface PlatformDist {
  name: string
  count: number
  pct: number
  color: string
}

export interface IsuDetail {
  nama: string
  model: string
  source: string
  volume: number
  sentimen: { pct: number; label: string; type: 'positif' | 'negatif' | 'netral' }
  trend: { pct: number; label: string; period: string }
  subtopik: string[]
  narasi: string
  platforms: PlatformDist[]
  rekomendasi: string
  prioritas: 'tinggi' | 'sedang' | 'rendah'
}
