import { TrendingUp, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import { KAT_COLOR, type MonitoringIsu } from '../../data/monitoring'
import { setSelectedIsu, ISU_DETAIL_MAP } from '../../store/isuStore'
import type { Page } from '../../types'

interface Props {
  filtered: MonitoringIsu[]
  onReset: () => void
  onNavigate: (page: Page) => void
}

export default function IssueTable({ filtered, onReset, onNavigate }: Props) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-[3px] h-[14px] bg-primary rounded" />
          <span className="text-[13px] font-semibold text-text-main">
            Semua Isu Aktif{' '}
            <span className="font-normal text-text-muted text-[12px]">({filtered.length} isu)</span>
          </span>
        </div>
        <Button variant="ghost" size="sm">↓ Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['#', 'Isu', 'Kategori', 'Sub-Topik', 'Volume', 'Sentimen', 'Platform', 'Trend', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border bg-surface whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-text-muted text-[13px]">
                  Tidak ada isu yang cocok ·{' '}
                  <button onClick={onReset} className="text-primary underline cursor-pointer">Reset filter</button>
                </td>
              </tr>
            ) : filtered.map(r => {
              const handleAnalysis = () => {
                const found = ISU_DETAIL_MAP[r.nama] ?? Object.values(ISU_DETAIL_MAP).find(d => r.nama.toLowerCase().includes(d.nama.toLowerCase()))
                setSelectedIsu(found ?? null)
                onNavigate('chat')
              }
              return (
                <tr
                  key={r.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Analisis isu: ${r.nama}`}
                  onClick={handleAnalysis}
                  onKeyDown={e => e.key === 'Enter' && handleAnalysis()}
                  className="border-b border-border last:border-0 hover:bg-surface/60 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:bg-surface/60 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{r.id}</td>
                  <td className="px-4 py-3 font-semibold text-text-main whitespace-nowrap">{r.nama}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${KAT_COLOR[r.kat] ?? 'bg-surface text-text-muted'}`}>
                      {r.kat}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.subtopik.map(s => (
                        <span key={s} className="bg-surface border border-border text-[10px] font-mono px-1.5 py-0.5 rounded text-text-muted">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] font-semibold text-text-main">{r.vol.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                      r.sent === 'positif' ? 'bg-success-dim text-success' : 'bg-danger-dim text-danger'
                    }`}>{r.sentPct}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.platform.map(p => (
                        <span key={p} className="bg-surface border border-border text-[10px] font-mono px-1.5 py-0.5 rounded text-text-muted">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-mono text-[12px] font-semibold ${r.up ? 'text-danger' : 'text-success'}`}>
                    <span className="flex items-center gap-0.5"><TrendingUp size={11} />{r.trend}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleAnalysis() }}>
                      Analisis <ChevronRight size={11} />
                    </Button>
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
