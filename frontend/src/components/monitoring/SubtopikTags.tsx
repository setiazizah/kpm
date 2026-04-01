import { SUBTOPIK_TRENDING } from '../../data/monitoring'

interface Props {
  activeTag: string
  onTagClick: (tag: string) => void
}

export default function SubtopikTags({ activeTag, onTagClick }: Props) {
  return (
    <div className="bg-white border border-border rounded-xl px-4 py-3.5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
        Sub-Topik Trending — klik untuk filter
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SUBTOPIK_TRENDING.map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick(tag === activeTag ? '' : tag)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer transition-all ${
              activeTag === tag
                ? 'bg-primary-dim text-primary border-primary/40'
                : 'bg-surface border-border text-text-muted hover:border-text-muted hover:text-text-main'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
