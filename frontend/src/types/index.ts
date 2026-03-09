export type Page = 'dashboard' | 'konten' | 'chat' | 'narasi' | 'stratkom' | 'brief' | 'riwayat'

export type RiskLevel = 'tinggi' | 'sedang' | 'rendah'

export interface IssueItem {
  rank: number
  label: string
  risk: RiskLevel
  trend?: 'up' | 'down'
}

export interface ContentRow {
  id: string
  platform: 'twitter' | 'instagram' | 'tiktok' | 'media'
  content: string
  sentiment: 'positif' | 'negatif' | 'netral'
  tags: string[]
  date: string
}

export interface HistoryItem {
  id: string
  type: 'narasi' | 'stratkom' | 'brief'
  title: string
  meta: string
  risk: RiskLevel
}
