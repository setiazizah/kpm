import { Eye } from 'lucide-react'
import SourceBadge from '../ui/SourceBadge'
import Button from '../ui/Button'
import { PLATFORM_LABEL, SENTIMENT_CLASS } from '../../data/browserKonten'
import type { ContentRow } from '../../types'

interface Props {
  rows: ContentRow[]
}

const PAGES = ['‹', '1', '2', '3', '...', '63', '›']

export default function KontenTable({ rows }: Props) {
  return (
    <>
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
            {rows.map(row => (
              <tr key={row.id} className="border-b border-border hover:bg-surface/70 transition-colors">
                <td className="px-4 py-3 text-[11px] font-mono text-text-muted font-medium">{row.id}</td>
                <td className="px-4 py-3">
                  <SourceBadge label={PLATFORM_LABEL[row.platform]} />
                </td>
                <td className="px-4 py-3 max-w-[280px] truncate text-[12.5px] text-text-main">
                  {row.content}
                </td>
                <td className={`px-4 py-3 text-[12.5px] ${SENTIMENT_CLASS[row.sentiment]}`}>
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

      <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
        <span className="text-[11.5px] font-mono text-text-muted">Menampilkan 1–20 dari 1.247 konten</span>
        <div className="flex gap-1">
          {PAGES.map((p, i) => (
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
    </>
  )
}
