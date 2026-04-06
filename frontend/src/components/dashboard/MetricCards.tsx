import { TrendingUp, TrendingDown, MessageCircle, Smile, AlertOctagon, Eye, type LucideIcon } from 'lucide-react'
import { METRIC_CARDS, type MetricCardData } from '../../data/dashboard'

const ICON_MAP: Record<MetricCardData['icon'], LucideIcon> = {
  'message-circle': MessageCircle,
  'smile':          Smile,
  'alert-octagon':  AlertOctagon,
  'eye':            Eye,
}

export default function MetricCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {METRIC_CARDS.map(m => {
        const Icon = ICON_MAP[m.icon]
        return (
          <div key={m.lbl} className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-card-md transition-shadow cursor-default shadow-card">
            <div className={`w-12 h-12 rounded-full ${m.iconBg} ${m.iconColor} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] font-medium text-text-muted mb-0.5">{m.lbl}</div>
              <div className="text-[26px] font-extrabold text-text-main leading-none mb-1">{m.val}</div>
              <div className={`text-[11.5px] font-semibold flex items-center gap-1 ${m.up ? 'text-success' : 'text-danger'}`}>
                {m.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {m.delta}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
