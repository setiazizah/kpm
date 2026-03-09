import { useState } from 'react'
import {
  Upload, FileDown, Wand2, Calendar, Clock, BarChart2,
  Target, ClipboardList, FileText, ExternalLink, AlertCircle,
} from 'lucide-react'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import Spinner from '../components/ui/Spinner'
import { useApp } from '../context/AppContext'

export default function NarasiPage() {
  const { navigate, session, runGenerateStratkom, runExport } = useApp()
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)

  const narasi     = session.narasi
  const docs       = session.retrievedDocs
  const isLoading  = session.step === 'stratkom_loading'
  const stratDone  = session.step === 'stratkom_done' || session.step === 'revising' || session.step === 'done'

  const handleGenerateStratkom = async () => {
    await runGenerateStratkom()
    navigate('stratkom')
  }

  const handleExport = async (fmt: 'docx' | 'pdf') => {
    setExporting(fmt)
    const url = await runExport('narasi', fmt)
    setExporting(null)
    if (url) setExportedUrl(url)
  }

  if (!narasi) {
    return (
      <div className="p-7 flex flex-col items-center justify-center h-full gap-4 text-text-muted">
        <AlertCircle size={36} className="text-border" />
        <p className="text-[14px]">Belum ada data narasi. Mulai dengan mengetik pertanyaan di halaman <strong>Chat</strong>.</p>
        <Button size="sm" onClick={() => navigate('chat')}>Ke Halaman Chat</Button>
      </div>
    )
  }

  const stepMeta = session.stepMeta

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="grid grid-cols-[1fr_300px] gap-5">

        {/* ── LEFT ── */}
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-main">Narasi Isu: {narasi.isu}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <RiskBadge level="tinggi" />
                <span className="bg-surface border border-border px-2 py-0.5 rounded text-[10.5px] font-mono text-text-muted flex items-center gap-1">
                  <Calendar size={10} /> {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="bg-surface border border-border px-2 py-0.5 rounded text-[10.5px] font-mono text-text-muted flex items-center gap-1">
                  <BarChart2 size={10} /> {docs.length} sumber
                </span>
                <span className="bg-surface border border-border px-2 py-0.5 rounded text-[10.5px] font-mono text-text-muted flex items-center gap-1">
                  <Clock size={10} /> Channel: {session.channel} · {session.tone}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost" size="sm"
                onClick={() => handleExport('docx')}
                disabled={exporting === 'docx'}
              >
                {exporting === 'docx' ? <Spinner className="w-3.5 h-3.5" /> : <Upload size={13} />}
                Export DOCX
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => handleExport('pdf')}
                disabled={exporting === 'pdf'}
              >
                {exporting === 'pdf' ? <Spinner className="w-3.5 h-3.5" /> : <FileDown size={13} />}
                Export PDF
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateStratkom}
                disabled={isLoading || stratDone}
              >
                {isLoading ? <Spinner className="w-3.5 h-3.5" /> : <Wand2 size={13} />}
                {stratDone ? 'StratKom Selesai ✓' : 'Generate StratKom'}
              </Button>
            </div>
          </div>

          {exportedUrl && (
            <a
              href={exportedUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-primary hover:underline"
            >
              <ExternalLink size={12} /> Unduh dokumen yang diekspor
            </a>
          )}

          {/* Ringkasan */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Ringkasan Isu</div>
            <p className="text-[13.5px] leading-relaxed text-text-main">{narasi.narasi}</p>
          </div>

          {/* Poin Kunci */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Poin-Poin Kunci</div>
            <div className="space-y-0">
              {narasi.key_points.map((kp, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-[13px] leading-relaxed text-text-main">{kp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dokumen RAG */}
          {docs.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">
                Sumber Dokumen ({docs.length} retrieved)
              </div>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.doc_id} className="bg-surface border border-border rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-semibold text-primary">{doc.source}</span>
                      {doc.score != null && (
                        <span className="text-[10px] font-mono text-text-muted">score: {doc.score.toFixed(2)}</span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-text-main leading-relaxed line-clamp-3">{doc.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step metadata */}
          {Object.keys(stepMeta).length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="text-[10.5px] font-mono uppercase tracking-widest text-text-muted mb-3">Pipeline Meta</div>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(stepMeta).map(([name, meta]) => (
                  <div key={name} className="bg-surface border border-border rounded-lg px-3 py-2 text-[11px] font-mono">
                    <span className="font-semibold text-text-main">{name}</span>
                    {' '}<span className={meta.status === 'success' ? 'text-emerald-700' : 'text-amber-700'}>{meta.status}</span>
                    {meta.latency_ms != null && <span className="text-text-muted"> {meta.latency_ms}ms</span>}
                    {meta.fallback_used && <span className="text-amber-600"> [fallback]</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-4">
          {/* Aksi */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-[13px] font-semibold text-text-main">Aksi Cepat</div>
            <div className="p-4 flex flex-col gap-2">
              <Button
                className="w-full justify-center" size="sm"
                onClick={handleGenerateStratkom}
                disabled={isLoading || stratDone}
              >
                {isLoading ? <Spinner className="w-3.5 h-3.5" /> : <Target size={13} />}
                {stratDone ? 'StratKom Siap ✓' : 'Generate Strategi Komunikasi'}
              </Button>
              {stratDone && (
                <Button variant="ghost" className="w-full justify-center" size="sm" onClick={() => navigate('stratkom')}>
                  Lihat StratKom →
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-center" size="sm" onClick={() => navigate('brief')}>
                <ClipboardList size={13} /> Executive Brief
              </Button>
              <Button variant="ghost" className="w-full justify-center" size="sm" onClick={() => handleExport('docx')}>
                <Upload size={13} /> Export DOCX
              </Button>
              <Button variant="ghost" className="w-full justify-center" size="sm" onClick={() => handleExport('pdf')}>
                <FileDown size={13} /> Export PDF
              </Button>
            </div>
          </div>

          {/* Query info */}
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="text-[11px] font-mono uppercase tracking-wide text-text-muted mb-2 flex items-center gap-1">
              <FileText size={12} /> Query Saat Ini
            </div>
            <p className="text-[12.5px] text-text-main leading-relaxed">{session.query}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="bg-primary-dim text-blue-800 border border-primary/30 px-2 py-0.5 rounded text-[10px] font-mono">
                {session.channel}
              </span>
              <span className="bg-success-dim text-emerald-800 border border-green-300 px-2 py-0.5 rounded text-[10px] font-mono">
                {session.tone}
              </span>
            </div>
          </div>

          {/* Error */}
          {session.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2 text-[12px] text-red-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {session.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
