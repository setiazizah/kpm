import { FileText, ChevronRight, BookmarkPlus, CheckCircle2 } from 'lucide-react'
import RiskBadge from '../ui/RiskBadge'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import type { IsuDetail } from '../../types/isu'
import type { Page } from '../../types'

type Analysis = {
  tipologi: string
  risiko: string
  langkah: string[]
}

interface Props {
  isuDetail: IsuDetail
  isuAnalysis: Analysis
  narasiLoading: boolean
  onNavigate: (page: Page) => void
  onGoToNarasi: () => void
}

export default function IsuDetailResult({ isuDetail: d, isuAnalysis, narasiLoading, onNavigate, onGoToNarasi }: Props) {
  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Hasil Analisis Isu</div>
          <h2 className="text-[20px] font-bold text-text-main">{d.nama}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <RiskBadge level={d.prioritas} />
            <span className="text-[11px] font-mono text-text-muted">{d.model} · {d.source}</span>
            <span className="text-[11px] font-mono text-text-muted">· {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm"><BookmarkPlus size={13} /> Brief</Button>
          <Button size="sm" onClick={() => onNavigate('narasi')}><FileText size={13} /> Narasi Lengkap</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-border rounded-xl p-4 text-center">
          <div className="text-[24px] font-bold text-amber-500">{d.volume.toLocaleString('id')}</div>
          <div className="text-[10px] font-mono text-text-muted mt-1">Volume Konten</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 text-center">
          <div className={`text-[20px] font-bold ${d.sentimen.type === 'negatif' ? 'text-danger' : d.sentimen.type === 'positif' ? 'text-success' : 'text-warning'}`}>
            {d.sentimen.label}
          </div>
          <div className="text-[10px] font-mono text-text-muted mt-1">Sentimen Dominan</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 text-center">
          <div className="text-[24px] font-bold text-success">{d.trend.label}</div>
          <div className="text-[10px] font-mono text-text-muted mt-1">Tren {d.trend.period}</div>
        </div>
      </div>

      {/* Narasi */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-2 border-l-[3px] border-primary pl-2">Ringkasan Narasi</div>
        <p className="text-[13.5px] leading-relaxed text-text-main">{d.narasi}</p>
      </div>

      {/* Tipologi & Risiko */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-2">Tipologi Narasi</div>
          <p className="text-[13px] text-text-main">{isuAnalysis.tipologi}</p>
        </div>
        <div className={`rounded-xl p-4 border ${d.prioritas === 'tinggi' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-2">Risiko Eskalasi</div>
          <p className={`text-[12.5px] font-medium ${d.prioritas === 'tinggi' ? 'text-danger' : 'text-warning'}`}>
            {isuAnalysis.risiko}
          </p>
        </div>
      </div>

      {/* Sub-topik */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-2">Sub-Topik Teridentifikasi</div>
        <div className="flex flex-wrap gap-1.5">
          {d.subtopik.map(t => (
            <span key={t} className="px-2.5 py-1 rounded-full border border-primary/30 bg-accent/50 text-[11px] font-mono text-primary">{t}</span>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-3 border-l-[3px] border-primary pl-2">Distribusi Platform</div>
        <div className="space-y-2.5">
          {d.platforms.map(p => (
            <div key={p.name}>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] text-text-main">{p.name}</span>
                <span className="text-[11px] font-mono text-text-muted">{p.count.toLocaleString('id')} ({p.pct}%)</span>
              </div>
              <div className="h-[6px] bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Langkah */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-3 border-l-[3px] border-primary pl-2">Rekomendasi Narasi</div>
        <div className="space-y-2">
          {isuAnalysis.langkah.map((r, i) => (
            <div key={i} className="flex gap-3 items-start">
              <CheckCircle2 size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[13px] leading-relaxed text-text-main">{r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rekomendasi tindakan */}
      <div className={`rounded-xl border p-4 ${d.prioritas === 'tinggi' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-1.5">Tindakan Segera</div>
        <p className="text-[12.5px] leading-relaxed text-text-main">{d.rekomendasi}</p>
      </div>

      {/* Aksi */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Aksi Lanjutan</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onGoToNarasi} disabled={narasiLoading}>
            {narasiLoading ? <Spinner className="w-3.5 h-3.5" /> : <FileText size={13} />}
            {narasiLoading ? 'Menyiapkan narasi…' : 'Dokumen Narasi'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('stratkom')}><ChevronRight size={13} /> Strategi Komunikasi</Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('brief')}><ChevronRight size={13} /> Executive Brief</Button>
        </div>
      </div>
    </div>
  )
}
