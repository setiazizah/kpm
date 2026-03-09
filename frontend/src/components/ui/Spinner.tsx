
interface Props {
  className?: string
}

export default function Spinner({ className = '' }: Props) {
  return (
    <div
      className={`w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin ${className}`}
    />
  )
}
