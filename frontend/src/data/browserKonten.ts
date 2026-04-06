import type { ContentRow } from '../types'

export const KONTEN_ROWS: ContentRow[] = [
  { id: '001', platform: 'twitter',   content: 'BBM naik lagi, rakyat makin susah. Kapan pemerintah berpihak...', sentiment: 'negatif', tags: ['#BBMNaik'],         date: '02 Jan 07:31' },
  { id: '002', platform: 'media',     content: 'Pemerintah umumkan kenaikan BBM 15%, dampak ke harga sembako...', sentiment: 'netral',  tags: ['#BBMNaik'],         date: '01 Jan 18:45' },
  { id: '003', platform: 'tiktok',    content: 'Ini dampak kenaikan BBM ke UMKM dan warung kecil...',             sentiment: 'negatif', tags: ['#UMKM', '#BBM'],    date: '01 Jan 14:22' },
  { id: '004', platform: 'instagram', content: 'Infografis: Harga BBM di ASEAN — Indonesia masih lebih...',       sentiment: 'positif', tags: ['#Energi'],          date: '31 Des 11:05' },
  { id: '005', platform: 'twitter',   content: 'Subsidi BBM harusnya tepat sasaran. Setuju dengan kebijakan ini...', sentiment: 'positif', tags: ['#Subsidi'],      date: '31 Des 09:17' },
  { id: '006', platform: 'media',     content: 'Pengamat: Kenaikan BBM perlu diimbangi program perlindungan sosial...', sentiment: 'netral', tags: ['#Ekonomi'],  date: '30 Des 22:45' },
]

export const PLATFORM_LABEL: Record<string, string> = {
  twitter:   'Twitter',
  media:     'Media Online',
  tiktok:    'TikTok',
  instagram: 'Instagram',
}

export const SENTIMENT_CLASS: Record<string, string> = {
  positif: 'text-emerald-700 font-semibold',
  negatif: 'text-red-700 font-semibold',
  netral:  'text-slate-600 font-semibold',
}
