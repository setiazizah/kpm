import { Pause, Play, RefreshCw } from 'lucide-react'
import { STATUS_DOT, STATUS_LABEL, STATUS_CLS, type Crawler } from '../../data/crawling'

interface Props {
  crawlers: Crawler[]
  onToggle: (id: number) => void
}

export default function CrawlerList({ crawlers, onToggle }: Props) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-[3px] h-[14px] bg-primary rounded" />
          <span className="text-[13px] font-semibold text-text-main">Status Crawler per Platform</span>
        </div>
        <button className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary border border-border rounded px-2 py-1 cursor-pointer">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <div className="divide-y divide-border">
        {crawlers.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3">
            <div className="relative flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${STATUS_DOT[c.status]}`} />
              {c.status === 'running' && (
                <div className={`absolute inset-0 rounded-full ${STATUS_DOT[c.status]} animate-ping opacity-70`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text-main">{c.name}</div>
              <div className="text-[10.5px] font-mono text-text-muted">{c.count} · {c.rate}</div>
            </div>
            <span className={`text-[10px] font-mono font-semibold mr-2 ${STATUS_CLS[c.status]}`}>
              {STATUS_LABEL[c.status]}
            </span>
            <button
              onClick={() => onToggle(c.id)}
              className="flex items-center gap-1 text-[11px] border border-border px-2.5 py-1 rounded text-text-muted hover:border-primary hover:text-primary cursor-pointer transition-all"
            >
              {c.status === 'running' ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Start</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
