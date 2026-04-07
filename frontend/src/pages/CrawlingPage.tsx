import { useEffect, useState } from 'react'
import { INIT_CRAWLERS, type Crawler } from '../data/crawling'
import CrawlerList from '../components/crawling/CrawlerList'
import PipelinePanel from '../components/crawling/PipelinePanel'
import { getBatches, getKeywords, triggerCrawl } from '../api/crawlerApi'
import type { KeywordItem, BatchRecord } from '../types/crawler'

export default function CrawlingPage() {
  const [crawlers, setCrawlers]   = useState<Crawler[]>(INIT_CRAWLERS)
  const [keywords, setKeywords]   = useState<KeywordItem[]>([])
  const [batches, setBatches]     = useState<BatchRecord[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [triggering, setTriggering] = useState<Set<number>>(new Set())

  // ── Platform → API platform string mapping ────────────────────────────────
  const PLATFORM_MAP: Record<number, string> = {
    1: 'media_online',
    2: 'tiktok',
  }

  // ── Fetch initial data ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      try {
        const [batchData, kwData] = await Promise.all([
          getBatches(20),
          getKeywords(true),
        ])
        if (cancelled) return
        setBatches(batchData)
        setKeywords(kwData)
      } catch {
        // backend mungkin belum jalan, keep data default
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  // ── Refresh ───────────────────────────────────────────────────────────────
  const refresh = async () => {
    setRefreshing(true)
    try {
      const [batchData, kwData] = await Promise.all([
        getBatches(20),
        getKeywords(true),
      ])
      setBatches(batchData)
      setKeywords(kwData)
    } catch {
      // silent
    } finally {
      setRefreshing(false)
    }
  }

  // ── Trigger crawl / toggle ─────────────────────────────────────────────────
  const toggle = async (id: number) => {
    const crawler = crawlers.find(c => c.id === id)
    if (!crawler) return

    const isRunning = crawler.status === 'running'

    // Jika ini platform yang didukung backend dan mau di-start, trigger API
    if (!isRunning && PLATFORM_MAP[id] !== undefined) {
      setTriggering(prev => new Set(prev).add(id))
      try {
        await triggerCrawl(PLATFORM_MAP[id])
        setCrawlers(prev => prev.map(c =>
          c.id !== id ? c : { ...c, status: 'running' }
        ))
      } catch {
        setCrawlers(prev => prev.map(c =>
          c.id !== id ? c : { ...c, status: 'error' }
        ))
      } finally {
        setTriggering(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    } else {
      // Local toggle untuk platform lain
      setCrawlers(prev => prev.map(c =>
        c.id !== id ? c : { ...c, status: isRunning ? 'idle' : 'running' }
      ))
    }
  }

  // ── Metrics dari batch history ─────────────────────────────────────────────
  const latestBatch   = batches[0] ?? null
  const totalCrawled  = batches.reduce((s, b) => s + (b.raw_data_count ?? 0), 0)
  const avgSuccessRate = batches.length > 0
    ? (batches.reduce((s, b) => s + b.success_rate_pct, 0) / batches.length).toFixed(1) + '%'
    : null
  const estimatedErrors = latestBatch
    ? Math.round((100 - latestBatch.success_rate_pct) * (latestBatch.raw_data_count ?? 0) / 100)
    : null

  const aktif = crawlers.filter(c => c.status === 'running').length

  const metrics = [
    {
      lbl: 'Crawler Aktif',
      val: String(aktif),
      sub: `dari ${crawlers.length} total`,
      color: 'border-t-success', valCls: 'text-success',
    },
    {
      lbl: 'Total Crawled',
      val: loading ? '…' : (totalCrawled > 0 ? totalCrawled.toLocaleString('id') : '–'),
      sub: latestBatch ? `batch terakhir: ${latestBatch.status}` : 'belum ada batch',
      color: 'border-t-primary', valCls: 'text-primary',
    },
    {
      lbl: 'Success Rate',
      val: loading ? '…' : (avgSuccessRate ?? '–'),
      sub: latestBatch ? `dari ${batches.length} batch` : 'belum ada data',
      color: 'border-t-warning', valCls: 'text-warning',
    },
    {
      lbl: 'Error',
      val: loading ? '…' : (estimatedErrors !== null ? String(estimatedErrors) : '–'),
      sub: 'estimasi dari batch terakhir',
      color: 'border-t-danger', valCls: 'text-danger',
    },
  ]

  return (
    <div className="p-6 overflow-y-auto h-full space-y-4">
      <div className="grid grid-cols-4 gap-3.5">
        {metrics.map(m => (
          <div key={m.lbl} className={`bg-white border border-border border-t-[2px] ${m.color} rounded-xl p-[18px]`}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">{m.lbl}</div>
            <div className={`text-[30px] font-bold leading-none mb-1.5 ${m.valCls}`}>{m.val}</div>
            <div className="text-[11px] font-mono text-text-muted">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <CrawlerList crawlers={crawlers} onToggle={toggle} onRefresh={refresh} refreshing={refreshing} triggering={triggering} />
        <PipelinePanel keywords={keywords} batches={batches} />
      </div>
    </div>
  )
}
