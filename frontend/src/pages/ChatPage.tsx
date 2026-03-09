import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Bot, User, FileText, AlertCircle } from 'lucide-react'
import RiskBadge from '../components/ui/RiskBadge'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import type { WorkflowChannel, WorkflowTone } from '../types/workflow'

const CHANNEL_OPTIONS: { value: WorkflowChannel; label: string }[] = [
  { value: 'press',    label: 'Press / Media' },
  { value: 'social',   label: 'Social Media' },
  { value: 'internal', label: 'Internal' },
]

const TONE_OPTIONS: { value: WorkflowTone; label: string }[] = [
  { value: 'formal',      label: 'Formal' },
  { value: 'semi-formal', label: 'Semi-Formal' },
  { value: 'informal',    label: 'Informal' },
]

interface ChatMessage {
  role:     'user' | 'assistant'
  content:  string
  isResult?: boolean
  query?:   string
}

export default function ChatPage() {
  const { navigate, runAnalyze, session } = useApp()

  const [input,    setInput]    = useState('')
  const [channel,  setChannel]  = useState<WorkflowChannel>('press')
  const [tone,     setTone]     = useState<WorkflowTone>('formal')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role:    'assistant',
      content: 'Halo! Saya siap membantu menganalisis isu publik. Silakan ketik pertanyaan Anda tentang isu yang ingin dianalisis. Saya akan mengambil data dari basis pengetahuan yang sudah dikumpulkan.',
    },
  ])

  const bottomRef = useRef<HTMLDivElement>(null)
  const isLoading = session.step === 'analyzing'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || isLoading) return
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setInput('')

    const narasi = await runAnalyze(q, channel, tone)
    if (!narasi) return

    const docsCount = session.retrievedDocs.length
    setMessages(prev => [
      ...prev,
      {
        role:     'assistant',
        content:  `RESULT::${JSON.stringify({ isu: narasi.isu, narasi: narasi.narasi, key_points: narasi.key_points, docsCount })}`,
        isResult: true,
        query:    q,
      },
    ])
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left panel */}
      <div className="w-[200px] bg-surface border-r border-border flex flex-col flex-shrink-0">
        <div className="p-3">
          <Button
            className="w-full justify-center"
            size="sm"
            onClick={() => setMessages(prev => [prev[0]])}
          >
            <Plus size={13} /> Sesi Baru
          </Button>
        </div>

        <div className="px-3 pb-2 space-y-3">
          <div>
            <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-1.5">Channel</div>
            {CHANNEL_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="radio" name="channel" value={opt.value}
                  checked={channel === opt.value}
                  onChange={() => setChannel(opt.value)}
                  className="accent-primary"
                />
                <span className="text-[11.5px] text-text-main">{opt.label}</span>
              </label>
            ))}
          </div>
          <div>
            <div className="text-[9.5px] font-mono uppercase tracking-widest text-text-muted mb-1.5">Tone</div>
            {TONE_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="radio" name="tone" value={opt.value}
                  checked={tone === opt.value}
                  onChange={() => setTone(opt.value)}
                  className="accent-primary"
                />
                <span className="text-[11.5px] text-text-main">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-auto px-3 pb-3 text-[9px] font-mono text-text-muted">
          {session.sessionId.slice(0, 16)}…
        </div>
      </div>

      {/* Chat main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className="flex gap-3 flex-row-reverse self-end max-w-[820px]">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-white" />
                </div>
                <div className="bg-accent border border-primary/30 rounded-xl px-4 py-3 text-[13.5px] leading-relaxed text-blue-900 font-medium">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3 max-w-[820px]">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
                <div>
                  {msg.isResult && msg.content.startsWith('RESULT::') ? (
                    <ResultCard
                      data={JSON.parse(msg.content.slice(8))}
                      isLatest={i === messages.length - 1 && session.step === 'analyzed'}
                      onViewNarasi={() => navigate('narasi')}
                    />
                  ) : (
                    <div className="bg-surface border border-border rounded-xl px-4 py-3 text-[13.5px] leading-relaxed text-text-main">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {isLoading && (
            <div className="flex gap-3 max-w-[820px]">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary-dim border border-primary/20 rounded-lg text-[12.5px] text-blue-800 font-medium">
                <Spinner />
                Mengambil konteks dari database &amp; menganalisis narasi…
              </div>
            </div>
          )}

          {session.step === 'error' && session.errorMessage && (
            <div className="flex gap-2 items-center text-[12.5px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={14} /> {session.errorMessage}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-8 pb-5 pt-4 border-t border-border bg-white">
          <div className="text-[11px] font-mono text-text-muted mb-2">
            Channel: <span className="text-primary font-semibold">{channel}</span>
            {' · '}Tone: <span className="text-primary font-semibold">{tone}</span>
            {session.retrievedDocs.length > 0 && (
              <> · <span className="text-emerald-700">{session.retrievedDocs.length} dok. relevan</span></>
            )}
          </div>
          <div className="flex gap-2.5 bg-surface border border-border rounded-xl px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              className="flex-1 bg-transparent outline-none text-[13.5px] resize-none min-h-[20px] max-h-[120px] placeholder:text-text-muted"
              placeholder="Tanyakan isu yang ingin dianalisis… (Enter untuk kirim)"
              rows={1}
              value={input}
              disabled={isLoading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white hover:bg-primary-hover transition-colors flex-shrink-0 self-end cursor-pointer disabled:opacity-40"
            >
              {isLoading ? <Spinner className="w-3.5 h-3.5" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-component untuk tampilan hasil analisis
function ResultCard({
  data,
  isLatest,
  onViewNarasi,
}: {
  data: { isu: string; narasi: string; key_points: string[]; docsCount: number }
  isLatest: boolean
  onViewNarasi: () => void
}) {
  return (
    <div>
      <div className="bg-surface border border-border rounded-xl px-4 py-3 text-[13.5px] leading-relaxed text-text-main">
        <p className="font-bold text-text-main mb-2">Analisis Isu: {data.isu}</p>
        <p className="mb-2 text-[12px] font-mono text-text-muted">
          Berdasarkan <strong className="text-primary">{data.docsCount} dokumen</strong> relevan yang ditemukan:
        </p>
        <p className="mb-3">{data.narasi}</p>
        <div className="border-t border-border pt-3 mt-2 space-y-1">
          {data.key_points.map((kp, j) => (
            <div key={j} className="flex gap-2 text-[12.5px]">
              <span className="text-primary font-bold">·</span>
              <span>{kp}</span>
            </div>
          ))}
        </div>
      </div>
      {isLatest && (
        <div className="flex gap-2 mt-2.5 flex-wrap items-center">
          <RiskBadge level="tinggi" />
          <Button size="sm" onClick={onViewNarasi}>
            <FileText size={13} /> Lihat Dokumen Narasi
          </Button>
        </div>
      )}
    </div>
  )
}
