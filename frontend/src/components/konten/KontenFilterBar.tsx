import { Search, Filter } from 'lucide-react'
import Button from '../ui/Button'

interface Props {
  search: string
  onSearchChange: (v: string) => void
}

export default function KontenFilterBar({ search, onSearchChange }: Props) {
  return (
    <div className="px-5 py-3.5 border-b border-border flex flex-wrap gap-2.5">
      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
        <Search size={13} className="text-text-muted" />
        <input
          className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-text-muted"
          placeholder="Cari konten..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <select className="bg-surface border border-border rounded-lg px-3 py-2 text-[12px] text-text-muted outline-none">
        <option>Semua Platform</option>
        <option>Twitter</option>
        <option>Instagram</option>
        <option>TikTok</option>
        <option>Media Online</option>
      </select>
      <select className="bg-surface border border-border rounded-lg px-3 py-2 text-[12px] text-text-muted outline-none">
        <option>Semua Sentimen</option>
        <option>Positif</option>
        <option>Negatif</option>
        <option>Netral</option>
      </select>
      <input type="date" className="bg-surface border border-border rounded-lg px-3 py-2 text-[12px] text-text-muted outline-none" />
      <Button size="sm">
        <Filter size={13} />
        Filter
      </Button>
    </div>
  )
}
