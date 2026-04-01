export interface Crawler {
  id: number
  name: string
  platform: string
  status: 'running' | 'idle' | 'error'
  count: string
  rate: string
}

export interface PipelineItem {
  label: string
  val: number
  pct: number
  color: string
}

export const INIT_CRAWLERS: Crawler[] = [
  { id: 0, name: 'Twitter/X Crawler',        platform: 'Twitter/X',    status: 'running', count: '1.842 konten', rate: '98.1%'   },
  { id: 1, name: 'Media Online (Scrapy)',     platform: 'Media Online', status: 'running', count: '1.204 konten', rate: '99.2%'   },
  { id: 2, name: 'TikTok Crawler',           platform: 'TikTok',       status: 'running', count: '921 konten',   rate: '91.4%'   },
  { id: 3, name: 'Instagram Crawler',        platform: 'Instagram',    status: 'running', count: '542 konten',   rate: '88.3%'   },
  { id: 4, name: 'Google Trends (pytrends)', platform: 'GTrends',      status: 'running', count: '47 keyword',   rate: 'tiap 6j' },
  { id: 5, name: 'Qdrant Cloud Sync',        platform: 'Vector DB',    status: 'running', count: '4.540 vector', rate: '99.9%'   },
  { id: 6, name: 'PostgreSQL Sync',          platform: 'DB',           status: 'idle',    count: '–',            rate: '–'       },
]

export const PIPELINE: PipelineItem[] = [
  { label: 'Raw Data (PostgreSQL)', val: 4821,  pct: 88, color: 'bg-primary'   },
  { label: 'Auto-Labeled',          val: 3902,  pct: 81, color: 'bg-success'   },
  { label: 'Perlu Label Manual',    val: 12,    pct: 2,  color: 'bg-warning'   },
  { label: 'SFT Dataset Total',     val: 14821, pct: 74, color: 'bg-text-muted' },
  { label: 'Qdrant Synced',         val: 4540,  pct: 94, color: 'bg-danger'    },
]

export const SCHEDULER = [
  { label: 'Model 1 Batch', val: '02:00 WIB', badge: 'bg-warning-dim text-warning' },
  { label: 'GTrends sync',  val: 'Tiap 6 jam', badge: 'bg-primary-dim text-primary' },
  { label: 'Qdrant Sync',   val: 'Real-time',  badge: 'bg-success-dim text-success' },
  { label: 'DB Backup',     val: '00:00 WIB',  badge: 'bg-surface text-text-muted border border-border' },
]

export const MONITORED_KEYWORDS = [
  'PP TUNAS','BBM','judi online','banjir','hoaks vaksin',
  'literasi digital','internet desa','komdigi','pelajar','subsidi',
]

export const STATUS_DOT: Record<string, string>   = { running: 'bg-success', idle: 'bg-text-muted', error: 'bg-danger' }
export const STATUS_LABEL: Record<string, string>  = { running: 'Running',   idle: 'Idle',          error: 'Error'     }
export const STATUS_CLS: Record<string, string>    = { running: 'text-success', idle: 'text-text-muted', error: 'text-danger' }
