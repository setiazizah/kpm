import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, RefreshCw, Zap, MessageCircle, Sparkles, AlertCircle } from 'lucide-react'
import { newSessionId } from '../api/workflow'

interface ChatMsg {
  role: 'user' | 'bot'
  text: string
  time: string
}

interface ChatHistory {
  role: string
  content: string
}

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const QUICK_PROMPTS = [
  'Apa itu KPM × AITF?',
  'Bagaimana cara pakai platform ini?',
  'Apa fungsi Monitoring Isu?',
  'Jelaskan fitur Analisis Sentimen',
  'Cara generate narasi counter?',
  'Apa itu Executive Brief?',
]

function nowTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

async function askAI(
  message: string,
  sessionId: string,
  chatHistory: ChatHistory[],
): Promise<string> {
  if (!BASE_URL) {
    // Fallback offline — tidak ada backend
    return 'Backend belum tersedia. Pastikan server berjalan dan VITE_API_URL sudah diset.'
  }
  const res = await fetch(`${BASE_URL}/v1/workflow/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, chat_history: chatHistory }),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText)
    throw new Error(`API error (${res.status}): ${txt}`)
  }
  const data = await res.json()
  if (data.status === 'error') throw new Error(data.reply ?? 'Terjadi kesalahan.')
  return data.reply as string
}

export default function ChatbotPage() {
  const [sessionId] = useState(() => newSessionId())
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'bot',
      text: 'Halo! Saya **Asisten KPM × AITF** berbasis AI. Saya siap menjawab pertanyaan tentang platform ini, isu komunikasi publik, atau fitur-fitur yang tersedia.\n\nSilakan ajukan pertanyaan Anda!',
      time: nowTime(),
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef   = useRef<HTMLDivElement>(null)

  // Riwayat untuk konteks AI (format OpenRouter)
  const historyRef = useRef<ChatHistory[]>([])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return

    setInput('')
    setError(null)
    const userMsg: ChatMsg = { role: 'user', text: q, time: nowTime() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Tambah ke riwayat sebelum kirim
    historyRef.current = [...historyRef.current, { role: 'user', content: q }]

    try {
      const reply = await askAI(q, sessionId, historyRef.current.slice(-8))
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: nowTime() }])
      // Tambah balasan bot ke riwayat
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }]
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Maaf, terjadi kesalahan: ${msg}`,
        time: nowTime(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <MessageCircle size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-[14px] font-bold text-text-main">Chatbot AI</h1>
          <p className="text-[11px] text-text-muted">Asisten cerdas KPM × AITF — powered by OpenRouter</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-medium text-success">AI Online</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                  m.role === 'bot' ? 'bg-primary' : 'bg-border'
                }`}>
                  {m.role === 'bot'
                    ? <Bot size={14} className="text-white" />
                    : <User size={14} className="text-text-muted" />}
                </div>
                <div className={`flex flex-col gap-1 max-w-[580px] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line ${
                    m.role === 'bot'
                      ? 'bg-white border border-border text-text-main rounded-tl-sm'
                      : 'bg-primary text-white rounded-tr-sm'
                  }`}>
                    {m.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                  <span className="text-[10px] text-text-muted px-1">{m.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-[12px] text-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={13} className="flex-shrink-0" />
                Pastikan backend berjalan dan <code className="font-mono bg-red-100 px-1 rounded">OPENROUTER_API_KEY</code> sudah diset di <code className="font-mono bg-red-100 px-1 rounded">.env</code>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-border bg-white px-6 py-4">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
                disabled={loading}
                placeholder="Tanya apa saja tentang platform, isu publik, atau KPM × AITF…"
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted disabled:opacity-50"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-hover transition-all disabled:opacity-40 cursor-pointer flex-shrink-0 shadow-sm"
              >
                {loading
                  ? <RefreshCw size={15} className="text-white animate-spin" />
                  : <Send size={15} className="text-white" />}
              </button>
            </div>
            <div className="text-[10px] font-mono text-text-muted mt-2 flex items-center gap-1.5">
              <Zap size={9} className="text-primary" />
              Dijawab oleh AI · model {(import.meta.env.VITE_API_URL ? 'via backend' : 'offline mode')}
            </div>
          </div>
        </div>

        {/* Sidebar Quick Prompts */}
        <div className="w-[260px] flex-shrink-0 border-l border-border bg-surface flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border bg-white">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-primary" />
              <span className="text-[12px] font-semibold text-text-main">Pertanyaan Cepat</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={loading}
                className="w-full text-left px-3 py-2.5 text-[12px] text-text-muted bg-white border border-border rounded-lg hover:border-primary hover:text-primary hover:bg-primary/[0.03] transition-all cursor-pointer disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="px-4 py-4 border-t border-border bg-white">
            <div className="text-[11px] text-text-muted leading-relaxed">
              <strong className="text-text-main">Tips:</strong> Chatbot ini menggunakan AI generatif dan mengingat konteks percakapan. Untuk analisis isu mendalam & generate narasi/stratkom, gunakan{' '}
              <strong className="text-primary">Tanya Isu</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
