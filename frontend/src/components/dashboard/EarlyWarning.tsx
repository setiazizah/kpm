import { EARLY_WARNINGS } from '../../data/dashboard'
import type { Page } from '../../types'

interface Props {
  onNavigate: (page: Page) => void
}

export default function EarlyWarning({ onNavigate }: Props) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-bold text-text-main">Early Warning System</div>
          <div className="text-[11.5px] text-text-muted mt-0.5">Sinyal real-time yang butuh perhatian</div>
        </div>
        <span className="text-[11.5px] text-text-muted">Update: 2 mnt lalu</span>
      </div>
      <div className="space-y-2">
        {EARLY_WARNINGS.map(a => (
          <div
            key={a.title}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-l-[3px] ${a.color} transition-colors duration-150 hover:brightness-[0.97]`}
          >
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px] text-text-main">{a.title}</div>
              <div className="text-[11.5px] text-text-muted mt-0.5">{a.sub}</div>
            </div>
            <button
              onClick={() => onNavigate(a.navKey)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${a.btnCls}`}
            >
              {a.btnLbl}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
