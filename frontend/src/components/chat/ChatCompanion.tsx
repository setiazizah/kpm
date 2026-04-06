import { useRef, useEffect } from 'react'
import { Bot, User, MessageSquare, Send, RefreshCw, Zap } from 'lucide-react'
import { CHAT_QUICK_PROMPTS } from '../../data/chat'
import type { ChatMsg } from '../../utils/chatHelpers'

interface Props {
  messages: ChatMsg[]
  chatInput: string
  chatLoading: boolean
  hasResult: boolean
  onChatInputChange: (v: string) => void
  onSend: () => void
}

export default function ChatCompanion({ messages, chatInput, chatLoading, hasResult, onChatInputChange, onSend }: Props) {
  const chatInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleQuickPrompt = (p: string) => {
    onChatInputChange(p)
    chatInputRef.current?.focus()
  }

  return (
    <div className="w-[320px] flex flex-col border-l border-border bg-surface flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[12.5px] font-semibold text-text-main">Chatbot Pendamping</div>
            <div className="text-[10px] font-mono text-text-muted">Tanya lebih dalam tentang isu ini</div>
          </div>
          <div className={`ml-auto w-2 h-2 rounded-full ${hasResult ? 'bg-success animate-pulse' : 'bg-border'}`} />
        </div>
      </div>

      {/* Quick prompts */}
      {hasResult && (
        <div className="px-3 pt-2.5 pb-2 flex flex-wrap gap-1.5 border-b border-border bg-white">
          {CHAT_QUICK_PROMPTS.map(p => (
            <button key={p}
              onClick={() => handleQuickPrompt(p)}
              className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-surface text-text-muted hover:border-primary hover:text-primary transition-all cursor-pointer"
            >{p}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              <MessageSquare size={18} className="text-text-muted" />
            </div>
            <p className="text-[11.5px] text-center leading-relaxed">
              {hasResult ? 'Tanyakan detail isu di sini' : 'Generate analisis dulu, lalu tanya apa saja'}
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${m.role === 'bot' ? 'bg-primary' : 'bg-border'}`}>
              {m.role === 'bot' ? <Bot size={12} className="text-white" /> : <User size={12} className="text-text-muted" />}
            </div>
            <div className={`max-w-[220px] rounded-xl px-3 py-2.5 text-[12.5px] leading-relaxed whitespace-pre-line ${
              m.role === 'bot' ? 'bg-white border border-border text-text-main' : 'bg-primary text-white'
            }`}>
              {m.text.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-white border border-border rounded-xl px-3 py-2.5 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-border bg-white">
        <div className="flex gap-2">
          <input
            ref={chatInputRef}
            value={chatInput}
            onChange={e => onChatInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSend() } }}
            disabled={chatLoading}
            placeholder={hasResult ? 'Tanya tentang isu ini…' : 'Generate analisis dulu…'}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-muted disabled:opacity-50"
          />
          <button
            onClick={onSend}
            disabled={chatLoading || !chatInput.trim()}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary-hover transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
          >
            {chatLoading
              ? <RefreshCw size={13} className="text-white animate-spin" />
              : <Send size={13} className="text-white" />}
          </button>
        </div>
        <div className="text-[9.5px] font-mono text-text-muted mt-1.5 flex items-center gap-1">
          <Zap size={9} className="text-primary" />
          Chatbot dapat generate narasi & rekomendasi
        </div>
      </div>
    </div>
  )
}
