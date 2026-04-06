import { Check } from 'lucide-react'
import Button from '../ui/Button'

interface Props {
  pct: number
  saved: number
  skipped: number
  pending: number
  onSaveAll: () => void
  onSkipAll: () => void
  onReset: () => void
}

export default function LabelingProgress({ pct, saved, skipped, pending, onSaveAll, onSkipAll, onReset }: Props) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-text-main">Progress Labeling</span>
        <div className="flex gap-2">
          <button onClick={onReset}   className="text-[11px] text-text-muted hover:text-text-main border border-border px-2.5 py-1 rounded cursor-pointer">Reset</button>
          <button onClick={onSkipAll} className="text-[11px] text-text-muted hover:text-text-main border border-border px-2.5 py-1 rounded cursor-pointer">Lewati Semua</button>
          <Button size="sm" onClick={onSaveAll}><Check size={12} /> Simpan Semua</Button>
        </div>
      </div>
      <div className="h-[6px] bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-success rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] font-mono text-text-muted mt-1">
        {pct}% selesai · {saved} tersimpan · {skipped} dilewati · {pending} pending
      </div>
    </div>
  )
}
