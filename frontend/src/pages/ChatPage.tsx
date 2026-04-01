import { useState, useRef, useEffect } from 'react'
import { Zap, AlertCircle } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import { useApp } from '../context/AppContext'
import { getSelectedIsu, setSelectedIsu, ISU_DETAIL_MAP } from '../store/isuStore'
import type { IsuDetail } from '../types/isu'
import type { WorkflowChannel, WorkflowTone } from '../types/workflow'
import { buildIsuAnalysis, getIsuChatReply, type ApiResult, type ChatMsg } from '../utils/chatHelpers'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatInputPanel from '../components/chat/ChatInputPanel'
import IsuDetailResult from '../components/chat/IsuDetailResult'
import ApiResultPanel from '../components/chat/ApiResultPanel'
import ChatCompanion from '../components/chat/ChatCompanion'

export default function ChatPage() {
  const { navigate, runAnalyze, session, resetSession } = useApp()

  const [isuDetail, setIsuDetail]     = useState<IsuDetail | null>(null)
  const [isuAnalysis, setIsuAnalysis] = useState<ReturnType<typeof buildIsuAnalysis> | null>(null)
  const [isuLoading, setIsuLoading]   = useState(false)

  const [input, setInput]       = useState('')
  const [channel, setChannel]   = useState<WorkflowChannel>('press')
  const [tone, setTone]         = useState<WorkflowTone>('formal')
  const [apiResult, setApiResult] = useState<ApiResult | null>(null)
  const [history, setHistory]   = useState<{ query: string; isu: string }[]>([])

  const [messages, setMessages]     = useState<ChatMsg[]>([])
  const [chatInput, setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [narasiLoading, setNarasiLoading] = useState(false)

  const sessionRef = useRef(session)
  useEffect(() => { sessionRef.current = session }, [session])

  const isApiLoading = session.step === 'analyzing'
  const hasResult    = isuDetail !== null || apiResult !== null

  // Cek isu dari store saat mount
  useEffect(() => {
    const isu = getSelectedIsu()
    if (!isu) return
    setSelectedIsu(null)
    setIsuDetail(isu)
    setInput(isu.nama)
    setIsuLoading(true)
    setTimeout(() => {
      setIsuAnalysis(buildIsuAnalysis(isu))
      setIsuLoading(false)
      setMessages([{ role: 'bot', text: `Analisis isu **"${isu.nama}"** selesai. Tanyakan apa saja — distribusi platform, sentimen, aktor penyebar, atau minta saya generate narasi counter.` }])
    }, 1500)
  }, [])

  const handleGenerate = async () => {
    const q = input.trim()
    if (!q || isApiLoading) return

    const matchedIsu = ISU_DETAIL_MAP[q] ?? Object.values(ISU_DETAIL_MAP).find(
      d => q.toLowerCase().includes(d.nama.toLowerCase())
    )

    if (matchedIsu) {
      setIsuDetail(matchedIsu)
      setApiResult(null)
      setIsuLoading(true)
      setTimeout(() => {
        setIsuAnalysis(buildIsuAnalysis(matchedIsu))
        setIsuLoading(false)
        setMessages([{ role: 'bot', text: `Analisis isu **"${matchedIsu.nama}"** selesai. Silakan tanyakan detail lebih lanjut.` }])
      }, 1500)
      return
    }

    setIsuDetail(null); setIsuAnalysis(null); setApiResult(null); setMessages([])

    const narasi = await runAnalyze(q, channel, tone)
    if (!narasi) return

    const data: ApiResult = { isu: narasi.isu, narasi: narasi.narasi, key_points: narasi.key_points, docsCount: sessionRef.current.retrievedDocs.length, query: q }
    setApiResult(data)
    setHistory(prev => [{ query: q, isu: narasi.isu }, ...prev.slice(0, 9)])
    setMessages([{ role: 'bot', text: `Analisis selesai: **"${narasi.isu}"**. Saya siap menjawab pertanyaan lanjutan atau membantu generate narasi.` }])
  }

  const handleReset = () => {
    setIsuDetail(null); setIsuAnalysis(null); setApiResult(null)
    setMessages([]); setInput(''); resetSession()
  }

  const handleGoToNarasi = async () => {
    if (session.narasi) { navigate('narasi'); return }
    const q = (isuDetail?.nama ?? apiResult?.isu ?? input).trim()
    if (!q) return
    setNarasiLoading(true)
    await runAnalyze(q, channel, tone)
    setNarasiLoading(false)
    navigate('narasi')
  }

  const sendChat = async () => {
    const q = chatInput.trim()
    if (!q || chatLoading) return
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setChatLoading(true)
    await new Promise(r => setTimeout(r, 800))

    let reply = ''
    if (isuDetail) {
      reply = getIsuChatReply(q, isuDetail)
    } else if (apiResult) {
      const lq = q.toLowerCase()
      if (lq.includes('narasi') || lq.includes('generate'))
        reply = `Ringkasan narasi:\n\n"${apiResult.narasi}"\n\nIngin saya generate versi formal untuk press release?`
      else if (lq.includes('poin') || lq.includes('kunci'))
        reply = `Poin utama:\n${apiResult.key_points.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}`
      else
        reply = `Berdasarkan query "${apiResult.query}": ${apiResult.docsCount} dokumen relevan ditemukan. Isu utama: **${apiResult.isu}**. Ada yang ingin digali lebih dalam?`
    } else {
      reply = 'Silakan generate analisis terlebih dahulu dengan memasukkan isu di kolom input.'
    }

    setMessages(prev => [...prev, { role: 'bot', text: reply }])
    setChatLoading(false)
  }

  const isLoading = isApiLoading || isuLoading

  return (
    <div className="flex h-full overflow-hidden">
      <ChatSidebar
        channel={channel} tone={tone}
        sessionId={session.sessionId}
        history={history}
        onChannelChange={setChannel}
        onToneChange={setTone}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatInputPanel
          input={input} isLoading={isLoading} hasResult={hasResult}
          onInputChange={setInput} onGenerate={handleGenerate} onReset={handleReset}
        />

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-text-muted">
              <div className="flex items-center gap-3 px-5 py-3 bg-accent/60 border border-primary/20 rounded-xl text-[13px] text-primary font-medium">
                <Spinner /> Mengambil konteks & menganalisis narasi…
              </div>
              <p className="text-[10.5px] font-mono text-text-muted">Retrieval · Clustering · Sentiment Scoring</p>
            </div>
          )}

          {session.step === 'error' && session.errorMessage && (
            <div className="flex gap-2 items-center text-[12.5px] text-danger bg-danger-dim border border-red-200 rounded-xl px-5 py-4">
              <AlertCircle size={14} /> {session.errorMessage}
            </div>
          )}

          {!isLoading && !hasResult && session.step !== 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center">
                <Zap size={22} className="text-text-muted" />
              </div>
              <p className="text-[13px]">Masukkan nama isu atau pertanyaan, lalu klik <strong className="text-primary">Analisis</strong></p>
              <p className="text-[11px] font-mono">Atau pilih isu dari halaman <span className="text-primary cursor-pointer hover:underline" onClick={() => navigate('sentimen')}>Analisis Sentimen</span></p>
            </div>
          )}

          {!isuLoading && isuDetail && isuAnalysis && (
            <IsuDetailResult
              isuDetail={isuDetail} isuAnalysis={isuAnalysis}
              narasiLoading={narasiLoading}
              onNavigate={navigate} onGoToNarasi={handleGoToNarasi}
            />
          )}

          {!isApiLoading && apiResult && (
            <ApiResultPanel
              apiResult={apiResult} channel={channel} tone={tone}
              onNavigate={navigate}
            />
          )}
        </div>
      </div>

      <ChatCompanion
        messages={messages} chatInput={chatInput}
        chatLoading={chatLoading} hasResult={hasResult}
        onChatInputChange={setChatInput} onSend={sendChat}
      />
    </div>
  )
}
