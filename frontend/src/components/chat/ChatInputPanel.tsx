import { useRef, useEffect } from 'react'
import { Zap, RotateCcw } from 'lucide-react'
import Spinner from '../ui/Spinner'
import { QUICK_PROMPTS } from '../../data/chat'

interface Props {
  input: string
  isLoading: boolean
  hasResult: boolean
  onInputChange: (v: string) => void
  onGenerate: () => void
  onReset: () => void
}

export default function ChatInputPanel({ input, isLoading, hasResult, onInputChange, onGenerate, onReset }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [input])

  return (
    <div className="px-6 pt-5 pb-4 border-b border-border bg-white">
      <div className="border border-border rounded-xl bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent outline-none text-[13.5px] resize-none px-4 pt-3 pb-2 placeholder:text-text-muted min-h-[48px] max-h-[120px]"
          placeholder="Masukkan nama isu atau pertanyaan untuk dianalisis…"
          rows={2}
          value={input}
          disabled={isLoading}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); onGenerate() } }}
        />
        <div className="flex items-center justify-between px-4 pb-3 gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_PROMPTS.map(p => (
              <button key={p}
                onClick={() => onInputChange(p)}
                className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-white text-text-muted hover:border-primary hover:text-primary transition-all cursor-pointer"
              >{p}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {hasResult && (
              <button onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-text-muted text-[12px] font-medium hover:border-danger hover:text-danger transition-all cursor-pointer"
              ><RotateCcw size={12} /> Reset</button>
            )}
            <button onClick={onGenerate}
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary-hover transition-all cursor-pointer disabled:opacity-40"
            >
              {isLoading ? <Spinner className="w-3.5 h-3.5" /> : <Zap size={13} />}
              Analisis
            </button>
          </div>
        </div>
      </div>
      <div className="text-[10px] font-mono text-text-muted mt-1.5">Ctrl+Enter untuk analisis · masukkan nama isu atau pertanyaan bebas</div>
    </div>
  )
}
