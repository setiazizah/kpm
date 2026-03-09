import { RefreshCw, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from './ui/Button'

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  chat: 'Tanya Isu — Chatbot',
  narasi: 'Viewer Narasi Isu',
  stratkom: 'Viewer Strategi Komunikasi',
  brief: 'Executive Brief',
  konten: 'Browser Konten DB',
  riwayat: 'Riwayat Dokumen'
}

export default function Topbar() {
  const { page, navigate } = useApp()
  return (
    <header className="bg-white border-b border-border h-14 flex items-center gap-4 px-7 flex-shrink-0">
      <h1 className="font-semibold text-[15px] text-text-main">{titles[page]}</h1>
      <span className="text-[11px] font-mono text-text-muted">
        Crawl terakhir: 07:42 · 1.247 konten baru
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <RefreshCw size={13} />
          Refresh
        </Button>
        <Button size="sm" onClick={() => navigate('chat')}>
          <Plus size={13} />
          Analisis Isu Baru
        </Button>
      </div>
    </header>
  )
}
