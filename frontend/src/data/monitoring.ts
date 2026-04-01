export interface MonitoringIsu {
  id: string
  nama: string
  kat: string
  subtopik: string[]
  vol: number
  sent: string
  sentPct: string
  platform: string[]
  trend: string
  up: boolean
}

export const ALL_ISU: MonitoringIsu[] = [
  { id: '01', nama: 'PP TUNAS',              kat: 'Sosial',    subtopik: ['pp tunas anak', 'kebijakan'],         vol: 8241, sent: 'positif', sentPct: '+71%', platform: ['Twitter/X', 'IG'],    trend: '+24%',  up: true },
  { id: '02', nama: 'Banjir Jabodetabek',    kat: 'Bencana',   subtopik: ['banjir jakarta', 'evakuasi'],         vol: 6412, sent: 'negatif', sentPct: '-68%', platform: ['Twitter/X', 'Media'], trend: '+67%',  up: true },
  { id: '03', nama: 'Internet Gratis Desa',  kat: 'Digital',   subtopik: ['internet desa 3T', 'sinyal pelosok'], vol: 4520, sent: 'positif', sentPct: '+61%', platform: ['TikTok', 'Media'],    trend: '+12%',  up: true },
  { id: '04', nama: 'Hoaks Vaksin',          kat: 'Kesehatan', subtopik: ['vaksin palsu', 'hoaks kesehatan'],    vol: 3124, sent: 'negatif', sentPct: '-88%', platform: ['TikTok', 'WA'],       trend: '+340%', up: true },
  { id: '05', nama: 'Literasi Digital Anak', kat: 'Digital',   subtopik: ['sosmed anak', 'edukasi'],             vol: 2520, sent: 'positif', sentPct: '+55%', platform: ['IG', 'Media'],        trend: '+8%',   up: true },
  { id: '06', nama: 'Judi Online Pelajar',   kat: 'Sosial',    subtopik: ['judi online', 'pelajar'],             vol: 2140, sent: 'negatif', sentPct: '-91%', platform: ['TikTok', 'IG'],       trend: '+185%', up: true },
]

export const SUBTOPIK_TRENDING = [
  'judi online', 'vaksin palsu', 'banjir jakarta', 'internet desa 3T',
  'pp tunas anak', 'hoaks kesehatan', 'literasi digital', 'blokir konten',
  'sosmed anak', 'sinyal pelosok',
]

export const KAT_COLOR: Record<string, string> = {
  Sosial:    'bg-primary-dim text-primary',
  Bencana:   'bg-warning-dim text-warning',
  Digital:   'bg-success-dim text-success',
  Kesehatan: 'bg-danger-dim text-danger',
}

export const DISTRIBUSI_SENTIMEN = [
  { l: 'Positif', p: 58.3, c: 'bg-success' },
  { l: 'Negatif', p: 26.8, c: 'bg-danger'  },
  { l: 'Netral',  p: 14.9, c: 'bg-warning' },
]

export const SUBTOPIK_TERPANAS = [
  { lbl: 'chip pelacak',   vol: '2.9K', pct: 92, c: 'bg-danger'  },
  { lbl: 'banjir jakarta', vol: '2.3K', pct: 78, c: 'bg-warning' },
  { lbl: 'judi online',    vol: '2.1K', pct: 68, c: 'bg-danger'  },
  { lbl: 'internet 3T',    vol: '1.5K', pct: 52, c: 'bg-success' },
  { lbl: 'pp tunas anak',  vol: '1.3K', pct: 45, c: 'bg-primary' },
]

export const VOLUME_PER_PLATFORM = [
  { lbl: 'Twitter/X',    vol: '9.8K', pct: 88, c: 'bg-primary' },
  { lbl: 'TikTok',       vol: '8.2K', pct: 74, c: 'bg-success' },
  { lbl: 'Media Online', vol: '6.9K', pct: 62, c: 'bg-warning' },
  { lbl: 'Instagram',    vol: '3.3K', pct: 30, c: 'bg-danger'  },
]
