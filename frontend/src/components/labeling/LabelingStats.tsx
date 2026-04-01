interface Props {
  pending: number
  saved: number
  skipped: number
}

export default function LabelingStats({ pending, saved, skipped }: Props) {
  const stats = [
    { lbl: 'Perlu Label Manual', val: String(pending), color: 'border-t-warning', valCls: 'text-warning' },
    { lbl: 'Sudah Dilabel',      val: String(saved),   color: 'border-t-success', valCls: 'text-success' },
    { lbl: 'Dilewati',           val: String(skipped), color: 'border-t-danger',  valCls: 'text-danger'  },
    { lbl: 'Auto-Labeled',       val: '3.890',         color: 'border-t-primary', valCls: 'text-primary' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {stats.map(m => (
        <div key={m.lbl} className={`bg-white border border-border border-t-[2px] ${m.color} rounded-xl p-4`}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">{m.lbl}</div>
          <div className={`text-[28px] font-bold leading-none ${m.valCls}`}>{m.val}</div>
        </div>
      ))}
    </div>
  )
}
