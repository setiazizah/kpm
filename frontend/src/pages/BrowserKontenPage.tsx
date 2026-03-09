import { useState } from 'react'
import { Search, Filter, Eye } from 'lucide-react'
import Card from '../components/ui/Card'
import SourceBadge from '../components/ui/SourceBadge'
import Button from '../components/ui/Button'
import type { ContentRow } from '../types'

const rows: ContentRow[] = [
  { id: '001', platform: 'twitter', content: 'BBM naik lagi, rakyat makin susah. Kapan pemerintah berpihak...', sentiment: 'negatif', tags: ['#BBMNaik'], date: '02 Jan 07:31' },
  { id: '002', platform: 'media', content: 'Pemerintah umumkan kenaikan BBM 15%, dampak ke harga sembako...', sentiment: 'netral', tags: ['#BBMNaik'], date: '01 Jan 18:45' },
  { id: '003', platform: 'tiktok', content: 'Ini dampak kenaikan BBM ke UMKM dan warung kecil...', sentiment: 'negatif', tags: ['#UMKM', '#BBM'], date: '01 Jan 14:22' },
  { id: '004', platform: 'instagram', content: 'Infografis: Harga BBM di ASEAN — Indonesia masih lebih...', sentiment: 'positif', tags: ['#Energi'], date: '31 Des 11:05' },
  { id: '005', platform: 'twitter', content: 'Subsidi BBM harusnya tepat sasaran. Setuju dengan kebijakan ini...', sentiment: 'positif', tags: ['#Subsidi'], date: '31 Des 09:17' },
  { id: '006', platform: 'media', content: 'Pengamat: Kenaikan BBM perlu diimbangi program perlindungan sosial...', sentiment: 'netral', tags: ['#Ekonomi'], date: '30 Des 22:45' }
]

const platformLabel: Record<string, string> = {
  twitter: 'Twitter',
  media: 'Media Online',
  tiktok: 'TikTok',
  instagram: 'Instagram'
}

const sentimentClass: Record<string, string> = {
  positif: 'text-emerald-700 font-semibold',
  negatif: 'text-red-700 font-semibold',
  netral: 'text-slate-600 font-semibold'
}

export default function BrowserKontenPage() {
  const [search, setSearch] = useState('')

  const filtered = rows.filter(r =>
    r.content.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-7 overflow-y-auto h-full">
      <Card>
        {/* Filter Bar */}
        <div className="px-5 py-3.5 border-b border-border flex flex-wrap gap-2.5">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={13} className="text-text-muted" />
            <input
              className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-text-muted"
              placeholder="Cari konten..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['#', 'Platform', 'Konten', 'Sentimen', 'Label Isu', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10.5px] font-mono font-bold uppercase tracking-widest text-text-main border-b border-border whitespace-nowrap bg-surface">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className="border-b border-border hover:bg-surface/70 transition-colors">
                  <td className="px-4 py-3 text-[11px] font-mono text-text-muted font-medium">{row.id}</td>
                  <td className="px-4 py-3">
                    <SourceBadge label={platformLabel[row.platform]} />
                  </td>
                  <td className="px-4 py-3 max-w-[280px] truncate text-[12.5px] text-text-main">
                    {row.content}
                  </td>
                  <td className={`px-4 py-3 text-[12.5px] ${sentimentClass[row.sentiment]}`}>
                    ● {row.sentiment.charAt(0).toUpperCase() + row.sentiment.slice(1)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {row.tags.map(tag => (
                        <span key={tag} className="bg-surface border border-border text-[10px] font-mono px-2 py-0.5 rounded text-text-muted">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-text-muted whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm">
                      <Eye size={12} />
                      Lihat
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          <span className="text-[11.5px] font-mono text-text-muted">Menampilkan 1–20 dari 1.247 konten</span>
          <div className="flex gap-1">
            {['‹', '1', '2', '3', '...', '63', '›'].map((p, i) => (
              <button
                key={i}
                className={`w-7 h-7 rounded flex items-center justify-center text-[12px] border transition-colors cursor-pointer ${
                  p === '1'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-border text-text-muted hover:bg-surface'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
