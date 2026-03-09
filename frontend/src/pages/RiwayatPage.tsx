import { Search, FileText, Target, ClipboardList, FolderOpen, Download } from 'lucide-react'
import Card from '../components/ui/Card'
import RiskBadge from '../components/ui/RiskBadge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import type { HistoryItem } from '../types'

const items: HistoryItem[] = [
  { id: 'narasi-bbm', type: 'narasi', title: 'Narasi Isu: Kenaikan Harga BBM 15%', meta: 'Narasi · 02 Jan 2025 · Revisi #1', risk: 'tinggi' },
  { id: 'stratkom-bbm', type: 'stratkom', title: 'StratKom: Kenaikan BBM — Press + Social Media', meta: 'Strategi Komunikasi · 02 Jan 2025 · Revisi #2', risk: 'tinggi' },
  { id: 'brief-bbm', type: 'brief', title: 'Executive Brief: Kenaikan BBM — Untuk Pimpinan', meta: 'Executive Brief · 02 Jan 2025', risk: 'tinggi' },
  { id: 'narasi-listrik', type: 'narasi', title: 'Narasi Isu: Subsidi Listrik Rumah Tangga', meta: 'Narasi · 30 Des 2024 · Revisi #3', risk: 'sedang' },
  { id: 'stratkom-listrik', type: 'stratkom', title: 'StratKom: Subsidi Listrik — Internal + Media', meta: 'Strategi Komunikasi · 30 Des 2024', risk: 'sedang' },
  { id: 'narasi-sembako', type: 'narasi', title: 'Narasi Isu: Harga Sembako Jelang Tahun Baru', meta: 'Narasi · 28 Des 2024', risk: 'rendah' }
]

const typeIcon = {
  narasi: <FileText size={16} className="text-primary" />,
  stratkom: <Target size={16} className="text-success" />,
  brief: <ClipboardList size={16} className="text-warning" />
}

const typeIconBg = {
  narasi: 'bg-primary-dim',
  stratkom: 'bg-success-dim',
  brief: 'bg-warning-dim'
}

const navTarget: Record<string, 'narasi' | 'stratkom' | 'brief'> = {
  narasi: 'narasi',
  stratkom: 'stratkom',
  brief: 'brief'
}

export default function RiwayatPage() {
  const { navigate } = useApp()

  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* Filters */}
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
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-surface/70 transition-colors cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeIconBg[item.type]}`}>
              {typeIcon[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text-main truncate">{item.title}</div>
              <div className="text-[10.5px] font-mono text-text-muted mt-0.5">{item.meta}</div>
            </div>
            <RiskBadge level={item.risk} />
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => navigate(navTarget[item.type])}>
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
