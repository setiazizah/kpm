import type { RiskLevel } from '../../types'

interface Props {
  level: RiskLevel
}

const config: Record<RiskLevel, { label: string; className: string }> = {
  tinggi: {
    label: 'Tinggi',
    className: 'bg-danger-dim text-red-800 border border-red-300 font-bold'
  },
  sedang: {
    label: 'Sedang',
    className: 'bg-warning-dim text-amber-800 border border-amber-300 font-bold'
  },
  rendah: {
    label: 'Rendah',
    className: 'bg-success-dim text-emerald-800 border border-emerald-300 font-bold'
  }
}

export default function RiskBadge({ level }: Props) {
  const { label, className } = config[level]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  )
}
