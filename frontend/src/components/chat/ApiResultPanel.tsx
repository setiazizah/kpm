import { FileText, ChevronRight, User, Bot } from 'lucide-react'
import RiskBadge from '../ui/RiskBadge'
import Button from '../ui/Button'
import type { ApiResult } from '../../utils/chatHelpers'
import type { Page } from '../../types'

interface Props {
  apiResult: ApiResult
  channel: string
  tone: string
  onNavigate: (page: Page) => void
}

export default function ApiResultPanel({ apiResult, channel, tone, onNavigate }: Props) {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Hasil Analisis</div>
          <h2 className="text-[18px] font-bold text-text-main">{apiResult.isu}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <RiskBadge level="tinggi" />
            <span className="text-[11px] font-mono text-text-muted">{apiResult.docsCount} sumber · {channel} · {tone}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('narasi')}><FileText size={13} /> Lihat Narasi</Button>
          <Button size="sm" onClick={() => onNavigate('narasi')}><ChevronRight size={13} /> Generate StratKom</Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <User size={12} className="text-text-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Query</span>
        </div>
        <p className="text-[13px] text-text-main">{apiResult.query}</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-3 flex items-center gap-1.5">
          <Bot size={11} /> Ringkasan Narasi
        </div>
        <p className="text-[13.5px] leading-relaxed text-text-main">{apiResult.narasi}</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Poin Utama</div>
        <div className="space-y-0">
          {apiResult.key_points.map((kp, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
              <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-[13px] leading-relaxed text-text-main">{kp}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Aksi Lanjutan</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onNavigate('narasi')}><FileText size={13} /> Dokumen Narasi Lengkap</Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('stratkom')}><ChevronRight size={13} /> Strategi Komunikasi</Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('brief')}><ChevronRight size={13} /> Executive Brief</Button>
        </div>
      </div>
    </div>
  )
}
