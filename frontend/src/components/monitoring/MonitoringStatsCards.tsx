import { DISTRIBUSI_SENTIMEN, SUBTOPIK_TERPANAS, VOLUME_PER_PLATFORM } from '../../data/monitoring'

export default function MonitoringStatsCards() {
  return (
    <div className="grid grid-cols-3 gap-3.5">

      {/* Distribusi Sentimen */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Distribusi Sentimen</div>
        {DISTRIBUSI_SENTIMEN.map(s => (
          <div key={s.l} className="flex items-center gap-2 mb-2 last:mb-0">
            <div className={`w-2 h-2 rounded-sm flex-shrink-0 ${s.c}`} />
            <span className="text-[12px] flex-1">{s.l}</span>
            <div className="w-[80px] h-[4px] bg-surface rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.c}`} style={{ width: `${s.p}%` }} />
            </div>
            <span className="text-[11px] font-mono w-[36px] text-right">{s.p}%</span>
          </div>
        ))}
        <div className="flex justify-between mt-3 pt-2.5 border-t border-border text-[10px] font-mono text-text-muted">
          <span>6 isu aktif</span><span>28.4K percakapan</span>
        </div>
      </div>

      {/* Sub-Topik Terpanas */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Sub-Topik Terpanas</div>
        {SUBTOPIK_TERPANAS.map(s => (
          <div key={s.lbl} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <span className="text-[11px] flex-1 truncate">{s.lbl}</span>
            <div className="w-[60px] h-[4px] bg-surface rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.c}`} style={{ width: `${s.pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-text-muted w-[30px] text-right">{s.vol}</span>
          </div>
        ))}
      </div>

      {/* Volume per Platform */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Volume per Platform</div>
        {VOLUME_PER_PLATFORM.map(s => (
          <div key={s.lbl} className="flex items-center gap-2 mb-2 last:mb-0">
            <span className="text-[11px] flex-1">{s.lbl}</span>
            <div className="w-[70px] h-[4px] bg-surface rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.c}`} style={{ width: `${s.pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-text-muted w-[32px] text-right">{s.vol}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
