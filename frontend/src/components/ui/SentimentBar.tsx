
interface Props {
  pos: number
  neu: number
  neg: number
  showLegend?: boolean
}

export default function SentimentBar({ pos, neu, neg, showLegend = false }: Props) {
  return (
    <div>
      <div className="flex h-2 rounded overflow-hidden gap-0.5 my-2">
        <div className="bg-success rounded-l" style={{ width: `${pos}%` }} />
        <div className="bg-text-muted" style={{ width: `${neu}%` }} />
        <div className="bg-danger rounded-r" style={{ width: `${neg}%` }} />
      </div>
      {showLegend && (
        <div className="flex flex-col gap-1.5 mt-3">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-text-main font-medium">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              Positif
            </span>
            <span className="font-mono font-bold text-emerald-700">{pos}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-text-main font-medium">
              <span className="w-2 h-2 rounded-full bg-text-muted inline-block" />
              Netral
            </span>
            <span className="font-mono font-bold text-text-muted">{neu}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-text-main font-medium">
              <span className="w-2 h-2 rounded-full bg-danger inline-block" />
              Negatif
            </span>
            <span className="font-mono font-bold text-red-700">{neg}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
