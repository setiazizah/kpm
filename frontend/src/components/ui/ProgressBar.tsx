
interface Props {
  value: number
  max?: number
  color?: string
  className?: string
}

export default function ProgressBar({ value, max = 100, color = 'bg-primary', className = '' }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}
