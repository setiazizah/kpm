import { useState } from 'react'
import { INIT_CRAWLERS, type Crawler } from '../data/crawling'
import CrawlerList from '../components/crawling/CrawlerList'
import PipelinePanel from '../components/crawling/PipelinePanel'

export default function CrawlingPage() {
  const [crawlers, setCrawlers] = useState<Crawler[]>(INIT_CRAWLERS)

  const toggle = (id: number) => {
    setCrawlers(prev => prev.map(c =>
      c.id !== id ? c : { ...c, status: c.status === 'running' ? 'idle' : 'running' }
    ))
  }

  const aktif    = crawlers.filter(c => c.status === 'running').length
  const errCount = crawlers.filter(c => c.status === 'error').length

  const metrics = [
    { lbl: 'Crawler Aktif',    val: String(aktif),                              sub: `dari ${crawlers.length} total`, color: 'border-t-success', valCls: 'text-success' },
    { lbl: 'Crawled Hari Ini', val: '4.821',                                     sub: '↑ dari target 4.000',           color: 'border-t-primary', valCls: 'text-primary' },
    { lbl: 'Success Rate',     val: '94.2%',                                     sub: '↓ 1.2% dari kemarin',           color: 'border-t-warning', valCls: 'text-warning' },
    { lbl: 'Error',            val: String(errCount === 0 ? 281 : errCount),     sub: 'konten gagal',                  color: 'border-t-danger',  valCls: 'text-danger'  },
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
        <CrawlerList crawlers={crawlers} onToggle={toggle} />
        <PipelinePanel />
      </div>
    </div>
  )
}
