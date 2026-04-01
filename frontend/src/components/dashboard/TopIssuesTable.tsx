import { ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import RiskBadge from '../ui/RiskBadge'
import { TOP_ISU } from '../../data/dashboard'
import { setSelectedIsu, ISU_DETAIL_MAP } from '../../store/isuStore'
import type { Page } from '../../types'

interface Props {
  onNavigate: (page: Page) => void
}

export default function TopIssuesTable({ onNavigate }: Props) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <div className="text-[13px] font-bold text-text-main">Top Isu Hari Ini</div>
          <div className="text-[11.5px] text-text-muted mt-0.5">Diurutkan berdasarkan volume</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onNavigate('monitoring')}>
          Lihat Semua <ChevronRight size={12} />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['#', 'Nama Isu', 'Volume', 'Platform', 'Sentimen', 'Trend', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border bg-surface whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_ISU.map(r => {
              const handleAnalysis = () => {
                const found = ISU_DETAIL_MAP[r.nama] ?? Object.values(ISU_DETAIL_MAP).find(d => r.nama.toLowerCase().includes(d.nama.toLowerCase()))
                setSelectedIsu(found ?? null)
                onNavigate('chat')
              }
              return (
                <tr
                  key={r.rank}
                  tabIndex={0}
                  role="button"
                  aria-label={`Analisis isu: ${r.nama}`}
                  onClick={handleAnalysis}
                  onKeyDown={e => e.key === 'Enter' && handleAnalysis()}
                  className="border-b border-border last:border-0 hover:bg-surface/60 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:bg-surface/60 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{r.rank}</td>
                  <td className="px-4 py-3 font-semibold text-text-main">{r.nama}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[80px] h-[5px] bg-surface rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.sent === 'positif' ? '#059669' : '#DC2626' }} />
                      </div>
                      <span className="font-mono text-[11px] text-text-muted">{r.vol.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.platform.map(p => (
                        <span key={p} className="bg-surface border border-border text-[10px] font-mono px-1.5 py-0.5 rounded text-text-muted">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded ${
                      r.sent === 'positif' ? 'bg-success-dim text-success' : 'bg-danger-dim text-danger'
                    }`}>{r.sent === 'positif' ? 'Positif' : 'Negatif'}</span>
                  </td>
                  <td className={`px-4 py-3 font-mono text-[12px] font-semibold ${r.trending === 'up' ? 'text-danger' : 'text-success'}`}>{r.trend}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleAnalysis() }}>Analisis</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
