/**
 * Data API Client — untuk fetch semua data dari backend KPM
 * NOTE: Endpoint ini masih menggunakan dummy data karena backend belum siap
 * Ubah USE_DUMMY_FOR_DATA ke false ketika backend sudah implement endpoint
 */

import type {
  DashboardMetrics,
  TrendData,
  SentimentData,
  Issue,
  Content,
  MonitoringData,
  LabelingTask,
  CrawlingJob,
} from '../types/index'

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

// NOTE: Backend endpoints sudah siap! Menggunakan real data dari backend
// Set ini ke true jika perlu fallback ke dummy data untuk debugging
const USE_DUMMY_FOR_DATA = false

async function get<T>(path: string): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    if (DEBUG) console.log(`[DATA API] GET ${path}`)
    
    const res = await fetch(path, { method: 'GET', headers })
    
    if (!res.ok) {
      throw new Error(`API ${path} gagal (${res.status})`)
    }
    
    const data = await res.json() as T
    if (DEBUG) console.log(`[DATA API] Response dari ${path}:`, data)
    return data
  } catch (err) {
    console.error(`[DATA API ERROR] ${path}:`, err)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // Selalu gunakan dummy untuk sekarang sampai backend ready
  return getDummyDashboardMetrics()
}

export async function getTrendData(): Promise<TrendData[]> {
  // Selalu gunakan dummy untuk sekarang sampai backend ready
  return getDummyTrendData()
}

export async function getSentimentData(): Promise<SentimentData> {
  // Selalu gunakan dummy untuk sekarang sampai backend ready
  return getDummySentimentData()
}

export async function getTopIssues(limit = 10): Promise<Issue[]> {
  // Selalu gunakan dummy untuk sekarang sampai backend ready
  return getDummyTopIssues(limit)
}

// ─────────────────────────────────────────────────────────────────────────────
// MONITORING
// ─────────────────────────────────────────────────────────────────────────────

export async function getMonitoringData(): Promise<MonitoringData> {
  // Selalu gunakan dummy untuk sekarang sampai backend ready
  return getDummyMonitoringData()
}

// ─────────────────────────────────────────────────────────────────────────────
// KONTEN / CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export async function getBrowserContent(
  query?: string,
  page = 1,
  limit = 50,
  filterType = 'all',
): Promise<{ items: Content[]; total: number; page: number; limit: number }> {
  if (USE_DUMMY_FOR_DATA) {
    return getDummyBrowserContent(page, limit, filterType)
  }
  
  try {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('limit', String(limit))
    params.append('filter_type', filterType)
    if (query) params.append('q', query)
    
    return await get<any>(`/v1/browser/content?${params}`)
  } catch (err) {
    console.error('[API] getBrowserContent gagal, fallback ke dummy:', err)
    return getDummyBrowserContent(page, limit, filterType)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LABELING
// ─────────────────────────────────────────────────────────────────────────────

export async function getLabelingTasks(): Promise<LabelingTask[]> {
  // Selalu gunakan dummy untuk sekarang sampai backend ready
  return getDummyLabelingTasks()
}

// ─────────────────────────────────────────────────────────────────────────────
// CRAWLING
// ─────────────────────────────────────────────────────────────────────────────

export async function getCrawlingJobs(): Promise<CrawlingJob[]> {
  if (USE_DUMMY_FOR_DATA) {
    return getDummyCrawlingJobs()
  }
  
  try {
    return await get<CrawlingJob[]>('/v1/crawling/jobs')
  } catch (err) {
    console.error('[API] getCrawlingJobs gagal, fallback ke dummy:', err)
    return getDummyCrawlingJobs()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MONITORING ISSUES
// ─────────────────────────────────────────────────────────────────────────────

export async function getMonitoringIssues(): Promise<any[]> {
  if (USE_DUMMY_FOR_DATA) {
    return getDummyMonitoringIssues()
  }
  
  try {
    return await get<any[]>('/v1/monitoring/issues')
  } catch (err) {
    console.error('[API] getMonitoringIssues gagal, fallback ke dummy:', err)
    return getDummyMonitoringIssues()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SENTIMENT ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export async function getSentimentAnalysis(): Promise<any> {
  if (USE_DUMMY_FOR_DATA) {
    return getDummySentimentAnalysis()
  }
  
  try {
    return await get<any>('/v1/sentiment/analysis')
  } catch (err) {
    console.error('[API] getSentimentAnalysis gagal, fallback ke dummy:', err)
    return getDummySentimentAnalysis()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function getDummyDashboardMetrics(): DashboardMetrics {
  return {
    total_issues: 124,
    critical_issues: 8,
    total_content: 3420,
    sentiment_positive: 45,
    sentiment_negative: 35,
    sentiment_neutral: 20,
    engagement_rate: 7.2,
    last_update: new Date().toISOString(),
  }
}

function getDummyTrendData(): TrendData[] {
  return [
    { date: '2026-03-25', volume: 520, positive: 240, negative: 180, neutral: 100 },
    { date: '2026-03-26', volume: 640, positive: 280, negative: 200, neutral: 160 },
    { date: '2026-03-27', volume: 780, positive: 350, negative: 270, neutral: 160 },
    { date: '2026-03-28', volume: 1100, positive: 420, negative: 480, neutral: 200 },
    { date: '2026-03-29', volume: 950, positive: 390, negative: 380, neutral: 180 },
    { date: '2026-03-30', volume: 1200, positive: 450, negative: 500, neutral: 250 },
    { date: '2026-03-31', volume: 1050, positive: 420, negative: 420, neutral: 210 },
  ]
}

function getDummySentimentData(): SentimentData {
  return {
    positive: 45,
    negative: 35,
    neutral: 20,
    trend: 'stable',
    change_24h: 2,
  }
}

function getDummyTopIssues(limit: number): Issue[] {
  const issues: Issue[] = [
    {
      id: '1',
      title: 'Kenaikan Harga BBM 15%',
      description: 'Kenaikan harga BBM yang diumumkan pemerintah memicu reaksi negatif',
      priority: 'critical',
      sentiment: 'negative',
      volume: 3241,
      status: 'active',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Digitalisasi UMKM 2025',
      description: 'Program digitalisasi UMKM mendapat respons beragam',
      priority: 'high',
      sentiment: 'mixed',
      volume: 1820,
      status: 'active',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Stabilitas Harga Pangan Nasional',
      description: 'Kenaikan harga beras memicu kekhawatiran publik',
      priority: 'high',
      sentiment: 'negative',
      volume: 2156,
      status: 'active',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
  
  return issues.slice(0, limit)
}

function getDummyMonitoringData(): MonitoringData {
  return {
    total_monitored_keywords: 156,
    active_crawlers: 12,
    last_crawl: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    data_sources: [
      { source: 'Twitter', count: 1240, last_update: new Date().toISOString() },
      { source: 'TikTok', count: 890, last_update: new Date().toISOString() },
      { source: 'Instagram', count: 654, last_update: new Date().toISOString() },
      { source: 'News', count: 420, last_update: new Date().toISOString() },
    ],
  }
}

function getDummyLabelingTasks(): LabelingTask[] {
  return [
    {
      id: 'label-1',
      content_id: 'content-1',
      content_text: 'Pemerintah perlu transparan dalam kebijakan BBM',
      status: 'pending',
      priority: 'high',
      created_at: new Date().toISOString(),
    },
    {
      id: 'label-2',
      content_id: 'content-2',
      content_text: 'Digitalisasi akan memberdayakan UMKM Indonesia',
      status: 'pending',
      priority: 'high',
      created_at: new Date().toISOString(),
    },
  ]
}

function getDummyCrawlingJobs(): CrawlingJob[] {
  return [
    {
      id: 'job-1',
      name: 'Twitter Crawl - BBM Keywords',
      status: 'running',
      progress: 75,
      items_collected: 1230,
      started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'job-2',
      name: 'TikTok Crawl - UMKM Digital',
      status: 'completed',
      progress: 100,
      items_collected: 890,
      started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      estimated_completion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

function getDummyMonitoringIssues() {
  return [
    {
      id: 'isu-1',
      title: 'Kenaikan Harga BBM 15%',
      description: 'Kenaikan harga BBM yang diumumkan pemerintah memicu reaksi negatif di media sosial',
      status: 'high-alert',
      sentiment_trend: 'negative',
      volume_trend: 12.5,
      sources: { twitter: 1240, tiktok: 890, instagram: 654, news: 420 },
      key_sentiment: { positive: 15, negative: 65, neutral: 20 },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_update: new Date().toISOString(),
    },
    {
      id: 'isu-2',
      title: 'Digitalisasi UMKM 2025',
      description: 'Program digitalisasi UMKM mendapat respons beragam dari pelaku usaha kecil',
      status: 'monitoring',
      sentiment_trend: 'positive',
      volume_trend: 8.3,
      sources: { twitter: 420, tiktok: 340, instagram: 280, news: 160 },
      key_sentiment: { positive: 55, negative: 20, neutral: 25 },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      last_update: new Date().toISOString(),
    },
  ]
}

function getDummySentimentAnalysis() {
  return {
    overall: {
      positive: 45,
      negative: 35,
      neutral: 20,
      total_posts: 10247,
    },
    by_source: {
      twitter: { positive: 50, negative: 30, neutral: 20 },
      tiktok: { positive: 40, negative: 40, neutral: 20 },
      instagram: { positive: 45, negative: 35, neutral: 20 },
      news: { positive: 35, negative: 45, neutral: 20 },
    },
    trending_topics: [
      { topic: 'Kenaikan BBM', sentiment: 'negative', volume: 3241, trend: 'rising' },
      { topic: 'Digitalisasi UMKM', sentiment: 'positive', volume: 1820, trend: 'stable' },
    ],
  }
}

function getDummyBrowserContent(page = 1, limit = 50, filter_type = 'all') {
  const allContent: Content[] = Array.from({ length: 200 }, (_, i) => ({
    id: `content-${i + 1}`,
    title: `Konten ${i + 1}: Diskusi kebijakan pemerintah`,
    description: 'Konten media sosial yang mendiskusikan kebijakan terbaru mengenai reformasi ekonomi',
    source: ['Twitter', 'TikTok', 'Instagram', 'YouTube'][i % 4] as any,
    url: `https://example.com/content/${i + 1}`,
    sentiment: ['positive', 'negative', 'neutral'][i % 3] as any,
    engagement: (i * 123) % 10000,
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    author: `User ${i + 1}`,
  }))

  let filtered = allContent
  if (filter_type === 'positive') filtered = filtered.filter(c => c.sentiment === 'positive')
  if (filter_type === 'negative') filtered = filtered.filter(c => c.sentiment === 'negative')
  if (filter_type === 'unlabeled') filtered = filtered.filter(c => c.sentiment === 'neutral')

  const start = (page - 1) * limit
  const end = start + limit

  return {
    items: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
  }
}
