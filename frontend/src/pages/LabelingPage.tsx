import { useState } from 'react'
import Button from '../components/ui/Button'
import LabelingStats from '../components/labeling/LabelingStats'
import LabelingProgress from '../components/labeling/LabelingProgress'
import LabelCard from '../components/labeling/LabelCard'
import { INITIAL_CARDS, type LabelCard as LabelCardType } from '../data/labeling'

export default function LabelingPage() {
  const [cards, setCards] = useState<LabelCardType[]>(INITIAL_CARDS)

  const saved   = cards.filter(c => c.status === 'saved').length
  const skipped = cards.filter(c => c.status === 'skipped').length
  const total   = cards.length
  const pct     = Math.round(((saved + skipped) / total) * 100)
  const pending = cards.filter(c => c.status === 'pending')

  const toggleLabel = (cardId: number, label: string) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c
      const sel = c.selectedLabels.includes(label)
        ? c.selectedLabels.filter(l => l !== label)
        : [...c.selectedLabels, label]
      return { ...c, selectedLabels: sel }
    }))
  }

  const saveCard  = (cardId: number) => setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'saved'    as const } : c))
  const skipCard  = (cardId: number) => setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'skipped'  as const } : c))
  const saveAll   = () => setCards(prev => prev.map(c => ({ ...c, status: 'saved'   as const })))
  const skipAll   = () => setCards(prev => prev.map(c => ({ ...c, status: 'skipped' as const })))
  const resetAll  = () => setCards(INITIAL_CARDS)

  return (
    <div className="p-6 overflow-y-auto h-full space-y-4">
      <LabelingStats pending={pending.length} saved={saved} skipped={skipped} />
      <LabelingProgress
        pct={pct} saved={saved} skipped={skipped} pending={pending.length}
        onSaveAll={saveAll} onSkipAll={skipAll} onReset={resetAll}
      />

      <div className="space-y-3">
        {cards.map((card, idx) => (
          <LabelCard
            key={card.id}
            card={card}
            index={idx}
            total={total}
            onToggleLabel={toggleLabel}
            onSave={saveCard}
            onSkip={skipCard}
          />
        ))}
      </div>

      {pending.length === 0 && (
        <div className="bg-success-dim border border-success/30 rounded-xl p-5 text-center">
          <div className="text-success font-semibold text-[14px] mb-1">Semua item selesai dilabeling!</div>
          <p className="text-[12px] text-text-muted">{saved} tersimpan · {skipped} dilewati</p>
          <Button size="sm" className="mt-3" onClick={resetAll}>Reset untuk demo</Button>
        </div>
      )}
    </div>
  )
}
