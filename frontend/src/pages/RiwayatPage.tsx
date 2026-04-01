import { Search, FileText, Target, ClipboardList, FolderOpen, Download } from 'lucide-react'
import Card from '../components/ui/Card'
import RiskBadge from '../components/ui/RiskBadge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { RIWAYAT_ITEMS } from '../data/riwayat'
import type { HistoryItem } from '../types'

const TYPE_ICON: Record<HistoryItem['type'], React.ReactNode> = {
  narasi:   <FileText size={16} className="text-primary" />,
  stratkom: <Target size={16} className="text-success" />,
  brief:    <ClipboardList size={16} className="text-warning" />,
}

const TYPE_ICON_BG: Record<HistoryItem['type'], string> = {
  narasi:   'bg-primary-dim',
  stratkom: 'bg-success-dim',
  brief:    'bg-warning-dim',
}

const TYPE_BADGE: Record<HistoryItem['type'], string> = {
  narasi:   'bg-primary-dim text-primary',
  stratkom: 'bg-success-dim text-success',
  brief:    'bg-warning-dim text-warning',
}

const NAV_TARGET: Record<HistoryItem['type'], 'narasi' | 'stratkom' | 'brief'> = {
  narasi:   'narasi',
  stratkom: 'stratkom',
  brief:    'brief',
}

export default function RiwayatPage() {
  const { navigate } = useApp()

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="flex gap-2.5 flex-wrap mb-5">
        <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={13} className="text-text-muted" />
          <input
            className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-text-muted"
            placeholder="Cari dokumen..."
          />
        </div>
        <select className="bg-white border border-border rounded-lg px-3 py-2 text-[12px] text-text-main outline-none">
          <option>Semua Tipe</option>
          <option>Narasi Isu</option>
          <option>Strategi Komunikasi</option>
          <option>Executive Brief</option>
        </select>
        <input type="date" className="bg-white border border-border rounded-lg px-3 py-2 text-[12px] text-text-main outline-none" />
      </div>

      <Card>
        {RIWAYAT_ITEMS.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-surface/70 transition-colors cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_ICON_BG[item.type]}`}>
              {TYPE_ICON[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {(() => {
                  const colonIdx = item.title.indexOf(':')
                  if (colonIdx === -1) return <span className="text-[13px] font-semibold text-text-main truncate">{item.title}</span>
                  const prefix = item.title.slice(0, colonIdx)
                  const rest   = item.title.slice(colonIdx + 1).trimStart()
                  return <>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0 ${TYPE_BADGE[item.type]}`}>{prefix}</span>
                    <span className="text-[13px] font-semibold text-text-main truncate">{rest}</span>
                  </>
                })()}
              </div>
              <div className="text-[10.5px] font-mono text-text-muted mt-0.5">{item.meta}</div>
            </div>
            <RiskBadge level={item.risk} />
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => navigate(NAV_TARGET[item.type])}>
                <FolderOpen size={12} /> Buka
              </Button>
              <Button variant="ghost" size="sm">
                <Download size={12} /> Export
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
