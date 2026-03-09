import React, { useState } from 'react'
import {
  Upload, Wand2, Target, Newspaper, Smartphone, Pin,
  ExternalLink, AlertCircle, FileDown,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useApp } from '../context/AppContext'

export default function StratkomPage() {
  const { navigate, session, runRevise, runExport } = useApp()
  const [revisiText, setRevisiText] = useState('')
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)

  const stratkom  = session.stratkom
  const isRevising = session.step === 'revising'
  const briefDone  = session.step === 'done'

  const handleGenerateBrief = async () => {
    await runRevise(revisiText || undefined, 'docx')
    navigate('brief')
  }

  const handleExport = async (fmt: 'docx' | 'pdf') => {
    setExporting(fmt)
    const url = await runExport('stratkom', fmt)
    setExporting(null)
    if (url) setExportedUrl(url)
  }

  if (!stratkom) {
    return (
      <div className="p-7 flex flex-col items-center justify-center h-full gap-4 text-text-muted">
        <AlertCircle size={36} className="text-border" />
        <p className="text-[14px]">Belum ada strategi komunikasi. Generate dari halaman <strong>Narasi Isu</strong> terlebih dahulu.</p>
        <Button size="sm" onClick={() => navigate('narasi')}>Ke Halaman Narasi</Button>
      </div>
    )
  }

  const channelIcons: Record<string, React.ReactNode> = {
    press:    <Newspaper size={14} />,
    social:   <Smartphone size={14} />,
    internal: <Pin size={14} />,
  }

  const channelLabels: Record<string, string> = {
    press:    'Press Conference',
    social:   'Social Media',
    internal: 'Internal',
  }

  const channelCls: Record<string, string> = {
    press:    'bg-primary-dim text-blue-800 border border-primary/30',
    social:   'bg-success-dim text-emerald-800 border border-green-300',
    internal: 'bg-warning-dim text-amber-800 border border-amber-300',
  }

  const ch = session.channel

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="grid grid-cols-[1fr_300px] gap-5">

        {/* ── LEFT ── */}
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-main">
                Strategi Komunikasi: {session.narasi?.isu ?? 'Isu'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${channelCls[ch] ?? channelCls.press}`}>
                  {channelIcons[ch]} {channelLabels[ch] ?? ch}
                </span>
                <span className="bg-surface border border-border px-2 py-0.5 rounded text-[10.5px] font-mono text-text-muted">Tone: {session.tone}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => handleExport('docx')} disabled={exporting === 'docx'}>
                {exporting === 'docx' ? <Spinner className="w-3.5 h-3.5" /> : <Upload size={13} />}
                Export DOCX
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'}>
                {exporting === 'pdf' ? <Spinner className="w-3.5 h-3.5" /> : <FileDown size={13} />}
                Export PDF
              </Button>
              <Button size="sm" onClick={handleGenerateBrief} disabled={isRevising || briefDone}>
                {isRevising ? <Spinner className="w-3.5 h-3.5" /> : null}
                {briefDone ? 'Brief Siap ✓' : 'Brief Eksekutif →'}
              </Button>
            </div>
          </div>

          {exportedUrl && (
            <a href={exportedUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-primary hover:underline">
              <ExternalLink size={12} /> Unduh dokumen StratKom
            </a>
          )}

          {/* Strategi Utama */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Strategi Utama</div>
            <p className="text-[13.5px] leading-relaxed text-text-main">
              <strong className="text-primary">{stratkom.strategi}.</strong>
            </p>
          </div>

          {/* Pesan Utama */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Pesan Utama</div>
            <div className="flex gap-2.5 p-3 bg-surface border border-border rounded-lg text-[13px] leading-relaxed">
              <Target size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <span className="text-text-main">{stratkom.pesan_utama}</span>
            </div>
          </div>

          {/* Rekomendasi */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">
              Rekomendasi Aksi ({stratkom.rekomendasi.length})
            </div>
            <div className="space-y-2.5">
              {stratkom.rekomendasi.map((r, i) => (
                <div key={i} className="flex gap-3 p-3 bg-surface border border-border rounded-lg text-[13px] leading-relaxed">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-text-main">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline meta */}
          {session.stepMeta.stratkom && (
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-2">Pipeline Meta</div>
              <div className="text-[11px] font-mono text-text-muted">
                stratkom ·{' '}
                <span className="text-emerald-700">{session.stepMeta.stratkom.status}</span>
                {session.stepMeta.stratkom.latency_ms != null && ` · ${session.stepMeta.stratkom.latency_ms}ms`}
                {session.stepMeta.stratkom.fallback_used && ' · [fallback]'}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-4">
          {/* Revisi */}
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="text-[11px] font-mono uppercase tracking-wide text-text-muted mb-3 flex items-center gap-1">
              <Wand2 size={12} /> Instruksi Revisi (Opsional)
            </div>
            <textarea
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-[12.5px] outline-none resize-none min-h-[80px] focus:border-primary transition-colors placeholder:text-text-muted"
              placeholder="Contoh: 'Ubah tone menjadi lebih empati' atau 'Tambahkan data perbandingan ASEAN'…"
              value={revisiText}
              onChange={e => setRevisiText(e.target.value)}
            />
            <Button
              className="w-full justify-center mt-2.5" size="sm"
              onClick={handleGenerateBrief}
              disabled={isRevising || briefDone}
            >
              {isRevising ? <Spinner className="w-3.5 h-3.5" /> : null}
              {briefDone ? 'Brief Eksekutif Siap ✓' : 'Generate Brief Eksekutif'}
            </Button>
          </div>

          {/* Narasi ringkas */}
          {session.narasi && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-[13px] font-semibold text-text-main">
                Konteks Narasi
              </div>
              <div className="p-4">
                <p className="text-[12px] font-semibold text-text-main mb-1">{session.narasi.isu}</p>
                <p className="text-[12px] text-text-muted leading-relaxed line-clamp-4">{session.narasi.narasi}</p>
                <button
                  className="mt-2 text-[11px] text-primary hover:underline"
                  onClick={() => navigate('narasi')}
                >
                  ← Kembali ke Narasi
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {session.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2 text-[12px] text-red-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {session.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
