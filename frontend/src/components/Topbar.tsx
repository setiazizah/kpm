import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from './ui/Button'

const titles: Record<string, string> = {
  dashboard:  'Overview',
  monitoring: 'Monitoring Isu',
  sentimen:   'Analisis Sentimen',
  konten:     'Browser Konten DB',
  chat:       'Tanya Isu',
  narasi:     'Viewer Narasi Isu',
  stratkom:   'Strategi Komunikasi',
  brief:      'Executive Brief',
  riwayat:    'Riwayat Dokumen',
  labeling:   'Labeling UI',
  crawling:   'Crawling Status',
}

const ranges = [
  { key: '1d', label: 'Hari ini' },
  { key: '7d', label: '7 Hari' },
  { key: '30d', label: '30 Hari' },
]

export default function Topbar() {
  const { page, navigate, newAnalysis } = useApp()
  const [range, setRange] = useState('1d')
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="bg-white border-b border-border h-[58px] flex items-center gap-4 px-6 flex-shrink-0 shadow-[0_2px_8px_rgba(112,144,176,0.06)]">
      <h1 className="font-bold text-[15px] text-text-main flex-1">{titles[page]}</h1>

      {/* Range filter */}
      <div className="flex gap-1 bg-accent p-[3px] rounded-lg">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-[11px] py-[4px] rounded-md text-[12px] font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
              range === r.key
                ? 'bg-white text-primary shadow-card font-semibold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Clock */}
      <span className="font-mono text-[11px] text-text-muted flex-shrink-0 min-w-[72px] text-right">
        {clock}
      </span>

      <Button size="sm" onClick={newAnalysis}>
        <Plus size={13} />
        Analisis Baru
      </Button>
    </header>
  )
}
