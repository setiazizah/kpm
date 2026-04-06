import { Search, X } from 'lucide-react'
import Button from '../ui/Button'

interface Props {
  search: string
  katFilter: string
  sentFilter: string
  activeTag: string
  onSearch: (v: string) => void
  onKat: (v: string) => void
  onSent: (v: string) => void
  onReset: () => void
}

export default function MonitoringFilterBar({
  search, katFilter, sentFilter, activeTag,
  onSearch, onKat, onSent, onReset,
}: Props) {
  const hasFilter = !!(search || katFilter || sentFilter || activeTag)

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
        <Search size={13} className="text-text-muted flex-shrink-0" />
        <input
          className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-text-muted"
          placeholder="Cari isu atau keyword…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <select
        className="bg-white border border-border rounded-lg px-3 py-2 text-[12px] text-text-muted outline-none"
        value={katFilter}
        onChange={e => onKat(e.target.value)}
      >
        <option value="">Semua Kategori</option>
        {['Digital', 'Bencana', 'Kesehatan', 'Sosial'].map(k => <option key={k}>{k}</option>)}
      </select>
      <select
        className="bg-white border border-border rounded-lg px-3 py-2 text-[12px] text-text-muted outline-none"
        value={sentFilter}
        onChange={e => onSent(e.target.value)}
      >
        <option value="">Semua Sentimen</option>
        {['Positif', 'Negatif', 'Netral'].map(s => <option key={s}>{s}</option>)}
      </select>
      {hasFilter && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[12px] text-text-muted border border-border rounded-lg px-3 py-2 bg-white hover:border-danger hover:text-danger cursor-pointer"
        >
          <X size={12} /> Reset
        </button>
      )}
      <Button size="sm" onClick={() => {}}>+ Tambah Isu</Button>
    </div>
  )
}
