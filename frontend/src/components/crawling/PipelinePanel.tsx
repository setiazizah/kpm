import { PIPELINE, SCHEDULER } from '../../data/crawling'
import type { KeywordItem, BatchRecord } from '../../types/crawler'

interface Props {
  keywords: KeywordItem[]
  batches:  BatchRecord[]
}

export default function PipelinePanel({ keywords, batches }: Props) {
  // Gunakan data pipeline default; bila ada batch nyata, hitung raw_data_count
  const latestBatch = batches[0]
  const rawCount    = latestBatch?.raw_data_count ?? null

  const pipeline = rawCount !== null
    ? PIPELINE.map(p =>
        p.label === 'Raw Data (PostgreSQL)'
          ? { ...p, val: rawCount, pct: Math.min(100, Math.round((rawCount / 6000) * 100)) }
          : p
      )
    : PIPELINE

  const displayKeywords = keywords.length > 0 ? keywords : null
  const extraCount      = keywords.length > 10 ? keywords.length - 10 : null

  return (
    <div className="space-y-3.5">
      {/* Pipeline */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-[3px] h-[14px] bg-primary rounded" />
          <span className="text-[13px] font-semibold text-text-main">Pipeline PostgreSQL → Qdrant</span>
        </div>
        <div className="space-y-3">
          {pipeline.map(p => (
            <div key={p.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12.5px] text-text-main">{p.label}</span>
                <span className="text-[11px] font-mono font-semibold text-text-main">{p.val.toLocaleString()}</span>
              </div>
              <div className="h-[5px] bg-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Scheduler</div>
        <div className="space-y-2">
          {SCHEDULER.map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-[12px] text-text-main">{s.label}</span>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${s.badge}`}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Keyword Dipantau</div>
        <div className="flex flex-wrap gap-1.5">
          {(displayKeywords ?? []).slice(0, 10).map(kw => (
            <span key={kw.keyword_id} className="bg-surface border border-border text-[10.5px] font-mono px-2 py-0.5 rounded text-text-muted">
              {kw.keyword_text}
            </span>
          ))}
          {displayKeywords === null && (
            // fallback ke static saat API belum tersedia
            ['PP TUNAS','BBM','judi online','banjir','hoaks vaksin','literasi digital','internet desa','komdigi','pelajar','subsidi'].map(kw => (
              <span key={kw} className="bg-surface border border-border text-[10.5px] font-mono px-2 py-0.5 rounded text-text-muted">{kw}</span>
            ))
          )}
          {extraCount !== null && (
            <span className="text-[10.5px] font-mono text-text-muted px-1">+{extraCount} lagi</span>
          )}
          {displayKeywords === null && (
            <span className="text-[10.5px] font-mono text-text-muted px-1">+37 lagi</span>
          )}
        </div>
      </div>
    </div>
  )
}
