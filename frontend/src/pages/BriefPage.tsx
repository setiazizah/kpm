import { useState, useEffect } from 'react'
import { Printer, Upload, ExternalLink, AlertCircle, Download, BookOpen } from 'lucide-react'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import Spinner from '../components/ui/Spinner'
import { useApp } from '../context/AppContext'

export default function BriefPage() {
  const { navigate, session, runRevise, runExport } = useApp()
  const [exporting,  setExporting]  = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const narasi   = session.narasi
  const stratkom = session.stratkom
  const draft    = session.revisedDraft
  const shownUrl = downloadUrl ?? session.exportUrl

  const isRevising = session.step === 'revising'

  // Trigger revisi otomatis saat halaman dibuka pertama kali
  useEffect(() => {
    if (!draft && session.step === 'stratkom_done' && narasi && stratkom) {
      runRevise(undefined, 'docx')
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async (fmt: 'docx' | 'pdf') => {
    setExporting(fmt)
    const url = await runExport('draft', fmt)
    setExporting(null)
    if (url) setDownloadUrl(url)
  }

  if (!narasi || !stratkom) {
    return (
      <div className="p-7 flex flex-col items-center justify-center h-full gap-4 text-text-muted">
        <AlertCircle size={36} className="text-border" />
        <p className="text-[14px]">Narasi dan StratKom harus tersedia sebelum membuat Executive Brief.</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('chat')}>Mulai dari Chat</Button>
          {narasi && (
            <Button variant="ghost" size="sm" onClick={() => navigate('narasi')}>Ke Narasi</Button>
          )}
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const refId  = `NRS-${new Date().getFullYear()}-${session.sessionId.slice(-4).toUpperCase()}`

  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[16px] font-bold text-text-main">Executive Brief</h2>
          <p className="text-[12px] text-text-muted">Ringkasan 1 halaman untuk pimpinan — siap cetak</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer size={13} /> Cetak
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => handleExport('pdf')}
            disabled={exporting === 'pdf'}
          >
            {exporting === 'pdf' ? <Spinner className="w-3.5 h-3.5" /> : <Download size={13} />}
            Export PDF
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport('docx')}
            disabled={exporting === 'docx'}
          >
            {exporting === 'docx' ? <Spinner className="w-3.5 h-3.5" /> : <Upload size={13} />}
            Export DOCX
          </Button>
        </div>
      </div>

      {shownUrl && (
        <a href={shownUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline mb-4">
          <ExternalLink size={12} /> Unduh dokumen yang diekspor
        </a>
      )}

      {/* Loading state */}
      {isRevising && (
        <div className="flex items-center gap-3 px-5 py-4 bg-primary-dim border border-primary/20 rounded-xl mb-4 text-[13px] text-blue-800">
          <Spinner /> Sedang menyusun Executive Brief…
        </div>
      )}

      {/* Brief card */}
      <div className="max-w-[720px] mx-auto bg-white border border-border rounded-xl overflow-hidden shadow-card">

        {/* Header */}
        <div className="bg-surface border-b-2 border-primary px-7 py-6 flex justify-between items-start">
          <div>
            <div className="text-[13px] font-semibold font-mono uppercase tracking-[2px] text-primary">
              KOMPUB AI — EXECUTIVE BRIEF
            </div>
            <div className="text-[18px] font-bold text-text-main mt-2">{narasi.isu}</div>
            <div className="text-[12px] text-text-muted mt-1">
              Analisis Dampak &amp; Rekomendasi Strategi Komunikasi
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-mono text-text-muted">{today}</div>
            <div className="mt-2"><RiskBadge level="tinggi" /></div>
            <div className="text-[10.5px] font-mono text-text-muted mt-2">Ref: {refId}</div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">

          {/* Ringkasan Eksekutif */}
          <div className="pb-5 border-b border-border">
            <div className="text-[9px] font-mono uppercase tracking-[2px] text-text-muted mb-2">Ringkasan Eksekutif</div>
            <p className="text-[13px] leading-relaxed text-text-main">{narasi.narasi}</p>
          </div>

          {/* Poin Kritis */}
          <div className="pb-5 border-b border-border">
            <div className="text-[9px] font-mono uppercase tracking-[2px] text-text-muted mb-3">Poin Kritis</div>
            <div className="space-y-2">
              {narasi.key_points.map((kp, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                  <p className="text-[13px] leading-relaxed text-text-main">{kp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategi */}
          <div className="pb-5 border-b border-border">
            <div className="text-[9px] font-mono uppercase tracking-[2px] text-text-muted mb-2">Strategi Komunikasi</div>
            <p className="text-[13px] leading-relaxed text-text-main">
              <strong className="text-primary">{stratkom.strategi}.</strong>
              {' '}{stratkom.pesan_utama}
            </p>
          </div>

          {/* Rekomendasi */}
          <div className="pb-5 border-b border-border">
            <div className="text-[9px] font-mono uppercase tracking-[2px] text-text-muted mb-3">Rekomendasi Tindakan Segera</div>
            <div className="space-y-1.5">
              {stratkom.rekomendasi.slice(0, 4).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[11px] font-mono font-bold text-primary flex-shrink-0 w-4">{i + 1}.</span>
                  <p className="text-[13px] leading-relaxed text-text-main">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Draft dokumen (jika sudah ada) */}
          {draft && (
            <div className="pb-5 border-b border-border">
              <div className="text-[9px] font-mono uppercase tracking-[2px] text-text-muted mb-3">Draft Dokumen Resmi</div>
              <pre className="text-[11.5px] font-mono text-text-main whitespace-pre-wrap leading-relaxed bg-surface border border-border rounded-lg p-4 max-h-64 overflow-y-auto">
                {draft}
              </pre>
            </div>
          )}

          {/* Referensi Regulasi */}
          {session.regulasi.length > 0 && (
            <div className="pb-5 border-b border-border">
              <div className="text-[9px] font-mono uppercase tracking-[2px] text-text-muted mb-3 flex items-center gap-1.5">
                <BookOpen size={9} /> Referensi Regulasi &amp; Dokumen
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {session.regulasi.map((reg, i) => (
                  <div key={i} className="bg-surface border border-border rounded px-2.5 py-1.5">
                    <div className="text-[10px] font-mono font-semibold text-primary leading-tight">{reg.nomor}</div>
                    <div className="text-[11px] text-text-main leading-snug mt-0.5">{reg.judul}</div>
                    <div className="text-[9.5px] font-mono text-text-muted mt-0.5">{reg.lembaga} · {reg.tahun}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between text-[11px] font-mono text-text-muted pt-1">
            <span>Disiapkan oleh: KomPub AI — Tim 4</span>
            <span>RAHASIA — Untuk Pimpinan</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="max-w-[720px] mx-auto mt-4 flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('stratkom')}>← StratKom</Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('chat')}>Mulai Analisis Baru</Button>
      </div>
    </div>
  )
}
