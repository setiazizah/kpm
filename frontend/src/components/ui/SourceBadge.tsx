
interface Props {
  label: string
  className?: string
}

export default function SourceBadge({ label, className = '' }: Props) {
  const styles: Record<string, string> = {
    Twitter: 'bg-blue-100 text-blue-800 border border-blue-200',
    Instagram: 'bg-pink-100 text-pink-800 border border-pink-200',
    TikTok: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    'Media Online': 'bg-primary-dim text-blue-800 border border-blue-200'
  }
  const cls = styles[label] ?? 'bg-surface text-text-muted border border-border'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono font-medium ${cls} ${className}`}>
      {label}
    </span>
  )
}
