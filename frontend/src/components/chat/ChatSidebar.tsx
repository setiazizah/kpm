import { CHANNEL_OPTIONS, TONE_OPTIONS } from '../../data/chat'
import type { WorkflowChannel, WorkflowTone } from '../../types/workflow'

interface Props {
  channel: WorkflowChannel
  tone: WorkflowTone
  sessionId: string
  history: { query: string; isu: string }[]
  onChannelChange: (v: WorkflowChannel) => void
  onToneChange: (v: WorkflowTone) => void
}

export default function ChatSidebar({ channel, tone, sessionId, history, onChannelChange, onToneChange }: Props) {
  return (
    <div className="w-[190px] bg-surface border-r border-border flex flex-col flex-shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-2">Channel</div>
        {CHANNEL_OPTIONS.map(o => (
          <label key={o.value} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="radio" name="channel" value={o.value}
              checked={channel === o.value} onChange={() => onChannelChange(o.value)}
              className="accent-primary" />
            <span className="text-[12px] text-text-main">{o.label}</span>
          </label>
        ))}
      </div>
      <div className="px-4 pt-3 pb-3 border-b border-border">
        <div className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-2">Tone</div>
        {TONE_OPTIONS.map(o => (
          <label key={o.value} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="radio" name="tone" value={o.value}
              checked={tone === o.value} onChange={() => onToneChange(o.value)}
              className="accent-primary" />
            <span className="text-[12px] text-text-main">{o.label}</span>
          </label>
        ))}
      </div>
      {history.length > 0 && (
        <div className="flex-1 px-3 pt-3 overflow-y-auto">
          <div className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-2 px-1">Riwayat</div>
          {history.map((h, i) => (
            <div key={i}
              className="px-2 py-1.5 rounded text-[11px] text-text-muted hover:bg-accent/60 hover:text-text-main cursor-pointer truncate"
              title={h.query}
            >{h.isu}</div>
          ))}
        </div>
      )}
      <div className="mt-auto px-3 pb-3 text-[9px] font-mono text-text-muted truncate">
        {sessionId.slice(0, 16)}…
      </div>
    </div>
  )
}
