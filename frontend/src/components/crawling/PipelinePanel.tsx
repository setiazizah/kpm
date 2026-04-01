import { PIPELINE, SCHEDULER, MONITORED_KEYWORDS } from '../../data/crawling'

export default function PipelinePanel() {
  return (
    <div className="space-y-3.5">
      {/* Pipeline */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-[3px] h-[14px] bg-primary rounded" />
          <span className="text-[13px] font-semibold text-text-main">Pipeline PostgreSQL → Qdrant</span>
        </div>
        <div className="space-y-3">
          {PIPELINE.map(p => (
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
          {MONITORED_KEYWORDS.map(kw => (
            <span key={kw} className="bg-surface border border-border text-[10.5px] font-mono px-2 py-0.5 rounded text-text-muted">{kw}</span>
          ))}
          <span className="text-[10.5px] font-mono text-text-muted px-1">+37 lagi</span>
        </div>
      </div>
    </div>
  )
}
