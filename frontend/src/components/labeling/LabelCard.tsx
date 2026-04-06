import { Check, SkipForward } from 'lucide-react'
import Button from '../ui/Button'
import { PLATFORM_COLOR, type LabelCard as LabelCardType } from '../../data/labeling'

interface Props {
  card: LabelCardType
  index: number
  total: number
  onToggleLabel: (cardId: number, label: string) => void
  onSave: (cardId: number) => void
  onSkip: (cardId: number) => void
}

export default function LabelCard({ card, index, total, onToggleLabel, onSave, onSkip }: Props) {
  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${
      card.status === 'saved'   ? 'border-success/40 opacity-70' :
      card.status === 'skipped' ? 'border-border opacity-50'     :
      'border-border hover:border-border'
    }`}>
      {/* Head */}
      <div className="px-4 py-2.5 border-b border-border bg-surface flex items-center gap-3 flex-wrap">
        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
          card.status === 'pending' ? 'bg-warning-dim text-warning' :
          card.status === 'saved'   ? 'bg-success-dim text-success' :
          'bg-surface text-text-muted border border-border'
        }`}>
          {card.status === 'pending' ? 'perlu_manual' : card.status === 'saved' ? 'dilabel' : 'dilewati'}
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${PLATFORM_COLOR[card.platform] ?? 'bg-surface text-text-muted'}`}>
          {card.platform}
        </span>
        <span className="text-[10px] font-mono text-text-muted">{card.author} · {card.waktu}</span>
        <span className="ml-auto text-[10px] font-mono text-text-muted">{card.artId}</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-[13px] text-text-main leading-relaxed mb-3">{card.konten}</p>
        <div className="flex flex-wrap gap-1.5">
          {card.labels.map(lbl => (
            <button
              key={lbl}
              onClick={() => card.status === 'pending' && onToggleLabel(card.id, lbl)}
              disabled={card.status !== 'pending'}
              className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-all cursor-pointer disabled:cursor-default ${
                card.selectedLabels.includes(lbl)
                  ? 'bg-primary-dim text-primary border-primary/40 font-semibold'
                  : 'bg-surface border-border text-text-muted hover:border-text-muted'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      {card.status === 'pending' && (
        <div className="px-4 py-2.5 bg-surface border-t border-border flex items-center gap-2">
          <Button size="sm" onClick={() => onSave(card.id)}>
            <Check size={12} /> Simpan Label
          </Button>
          <button
            onClick={() => onSkip(card.id)}
            className="flex items-center gap-1 text-[11px] text-text-muted border border-border bg-white px-2.5 py-1.5 rounded-lg hover:border-text-muted cursor-pointer"
          >
            <SkipForward size={12} /> Lewati
          </button>
          <span className="ml-auto text-[10px] font-mono text-text-muted">{index + 1} dari {total}</span>
        </div>
      )}
      {card.status === 'saved' && (
        <div className="px-4 py-2 bg-success-dim border-t border-success/20 flex items-center gap-2">
          <Check size={12} className="text-success" />
          <span className="text-[11px] text-success font-medium">Tersimpan · Label: {card.selectedLabels.join(', ')}</span>
        </div>
      )}
    </div>
  )
}
