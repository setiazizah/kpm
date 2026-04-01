import { useState } from 'react'
import { BarChart2, X, ChevronRight, Zap, Bot, BookmarkPlus } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { ISU_DETAIL_MAP, setSelectedIsu, type IsuDetail } from '../store/isuStore'

const trendData = [
  { date: '27/2', positif: 61, negatif: 24, netral: 15 },
  { date: '28/2', positif: 59, negatif: 27, netral: 14 },
  { date: '1/3',  positif: 55, negatif: 30, netral: 15 },
  { date: '2/3',  positif: 57, negatif: 28, netral: 15 },
  { date: '3/3',  positif: 60, negatif: 25, netral: 15 },
  { date: '4/3',  positif: 58, negatif: 27, netral: 15 },
]

const platformData = [
  { platform: 'Twitter/X',    positif: 62, netral: 16, negatif: 22 },
  { platform: 'TikTok',       positif: 48, netral: 19, negatif: 33 },
  { platform: 'Media Online', positif: 71, netral: 12, negatif: 17 },
  { platform: 'Instagram',    positif: 66, netral: 18, negatif: 16 },
]

const isuSentimen = [
  { isu: 'PP TUNAS',             pos: 71, neu: 18, neg: 11 },
  { isu: 'Internet Gratis Desa', pos: 61, neu: 20, neg: 19 },
  { isu: 'Literasi Digital',     pos: 55, neu: 25, neg: 20 },
  { isu: 'Banjir Jabodetabek',   pos: 10, neu: 22, neg: 68 },
  { isu: 'Hoaks Vaksin',         pos:  8, neu:  4, neg: 88 },
  { isu: 'Judi Online Pelajar',  pos:  5, neu:  4, neg: 91 },
]

// ── Modal Detail Isu ─────────────────────────────────────────────
function IsuDetailModal({ detail, onClose, onAnalisis, onChatbot }: {
  detail: IsuDetail
  onClose: () => void
  onAnalisis: () => void
  onChatbot: () => void
}) {
  const senColor =
    detail.sentimen.type === 'negatif' ? 'text-red-400' :
    detail.sentimen.type === 'positif' ? 'text-emerald-400' : 'text-amber-400'

  const subtopikColors = [
    'border-red-500/60 text-red-300',
    'border-orange-500/60 text-orange-300',
    'border-yellow-500/60 text-yellow-300',
    'border-sky-500/60 text-sky-300',
    'border-purple-500/60 text-purple-300',
    'border-emerald-500/60 text-emerald-300',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[710px] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90%]"
        style={{ background: '#2563eb' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[2px] text-white/40 mb-1">{detail.source}</div>
              <h2 className="text-[22px] font-extrabold text-white leading-tight">{detail.nama}</h2>
              <p className="text-[12px] text-white/50 mt-0.5">
                {detail.model} · {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { lbl: 'Volume',    val: detail.volume.toLocaleString('id'), sub: 'Total Percakapan', cls: 'text-yellow-300' },
              { lbl: 'Sentimen',  val: detail.sentimen.label,              sub: 'Sentimen Dominan', cls: senColor },
              { lbl: 'Trend 24j', val: detail.trend.label,                 sub: `Tren ${detail.trend.period}`, cls: 'text-emerald-300' },
            ].map(s => (
              <div key={s.lbl} className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 text-center backdrop-blur-sm">
                <div className={`text-[28px] font-extrabold leading-none ${s.cls}`}>{s.val}</div>
                <div className="text-[11px] text-white/50 font-medium mt-1.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Sub-topik */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">Sub-Topik</div>
            <div className="flex flex-wrap gap-2">
              {detail.subtopik.map((t, i) => (
                <span
                  key={t}
                  className={`px-3 py-1 rounded-full border text-[11.5px] font-medium ${subtopikColors[i % subtopikColors.length]}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Narasi Dominan */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">Narasi Dominan</div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[13px] text-white/85 leading-relaxed">{detail.narasi}</p>
            </div>
          </div>

          {/* Distribusi Platform */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">Distribusi Platform</div>
            <div className="space-y-3">
              {detail.platforms.map(p => (
                <div key={p.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12.5px] font-medium text-white/80">{p.name}</span>
                    <span className="text-[12px] font-semibold text-white/60">
                      {p.count.toLocaleString('id')} <span className="text-white/40">({p.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rekomendasi */}
          <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-300/70 mb-1.5">Rekomendasi</div>
            <p className="text-[13px] text-yellow-100/85 leading-relaxed">{detail.rekomendasi}</p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-2 flex-wrap bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/20 text-white/70 text-[12.5px] font-semibold hover:bg-white/10 transition-all cursor-pointer"
          >
            Tutup
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-[12.5px] font-semibold hover:bg-white/10 transition-all cursor-pointer"
          >
            <BookmarkPlus size={13} /> Tambah ke Brief
          </button>
          <div className="flex-1" />
          <button
            onClick={onChatbot}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-sky-400/40 text-sky-300 text-[12.5px] font-semibold hover:bg-sky-500/10 transition-all cursor-pointer"
          >
            <Bot size={13} /> Tanya Chatbot
          </button>
          <button
            onClick={onAnalisis}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-primary text-[12.5px] font-bold hover:bg-white/90 transition-all cursor-pointer shadow-lg"
          >
            <Zap size={13} /> Buat Analisis AI
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SentimenPage() {
  const { navigate } = useApp()
  const [modalIsu, setModalIsu] = useState<IsuDetail | null>(null)

  const openDetail = (isuNama: string) => {
    const detail = ISU_DETAIL_MAP[isuNama]
    if (detail) setModalIsu(detail)
  }

  const handleBuatAnalisis = () => {
    if (!modalIsu) return
    setSelectedIsu(modalIsu)
    setModalIsu(null)
    navigate('chat')
  }

  return (
    <>
      <div className="p-6 overflow-y-auto h-full space-y-4">

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3.5">
          {[
            { lbl: 'Positif', val: '58.3%', delta: '↑ 3.1% dari kemarin', color: 'border-t-success', valCls: 'text-success', deltaPos: true },
            { lbl: 'Netral',  val: '14.9%', delta: '= stabil',             color: 'border-t-warning', valCls: 'text-warning', deltaPos: true },
            { lbl: 'Negatif', val: '26.8%', delta: '↑ 2.1% kemarin',      color: 'border-t-danger',  valCls: 'text-danger',  deltaPos: false },
          ].map(m => (
            <div key={m.lbl} className={`bg-white border border-border border-t-[3px] ${m.color} rounded-2xl p-5 shadow-card`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">{m.lbl}</div>
              <div className={`text-[32px] font-extrabold leading-none mb-1.5 ${m.valCls}`}>{m.val}</div>
              <div className={`text-[11.5px] font-semibold ${m.deltaPos ? 'text-success' : 'text-danger'}`}>{m.delta}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-3.5">

          {/* Tren 7 hari */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
            <div className="text-[13px] font-bold text-text-main mb-0.5 flex items-center gap-1.5">
              <BarChart2 size={14} className="text-primary"/> Tren Sentimen 7 Hari
            </div>
            <div className="text-[11.5px] text-text-muted mb-4">Pergerakan per hari</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {[['gPos','#059669'],['gNeu','#D97706'],['gNeg','#DC2626']].map(([id,c]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.18}/>
                      <stop offset="100%" stopColor={c} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2EAF0" vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7A8F', fontFamily: 'monospace' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#6B7A8F' }} axisLine={false} tickLine={false} unit="%"/>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2EAF0', borderRadius: 8, fontSize: 11 }}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Area type="monotone" dataKey="positif" name="Positif" stroke="#059669" strokeWidth={2} fill="url(#gPos)" dot={false}/>
                <Area type="monotone" dataKey="negatif" name="Negatif" stroke="#DC2626" strokeWidth={2} fill="url(#gNeg)" dot={false}/>
                <Area type="monotone" dataKey="netral"  name="Netral"  stroke="#D97706" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gNeu)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Per Platform */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
            <div className="text-[13px] font-bold text-text-main mb-0.5">Sentimen per Platform</div>
            <div className="text-[11.5px] text-text-muted mb-4">Perbandingan semua platform</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={platformData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2EAF0" vertical={false}/>
                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: '#6B7A8F', fontFamily: 'monospace' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#6B7A8F' }} axisLine={false} tickLine={false} unit="%"/>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2EAF0', borderRadius: 8, fontSize: 11 }}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="positif" name="Positif" stackId="a" fill="#059669" radius={[0,0,0,0]}/>
                <Bar dataKey="netral"  name="Netral"  stackId="a" fill="#D97706"/>
                <Bar dataKey="negatif" name="Negatif" stackId="a" fill="#DC2626" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentimen per Isu */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
          <div className="mb-4">
            <div className="text-[13px] font-bold text-text-main">Breakdown Sentimen per Isu</div>
            <div className="text-[11.5px] text-text-muted mt-0.5">Klik Detail untuk lihat analisis lengkap</div>
          </div>
          <div className="space-y-3">
            {isuSentimen.map(r => (
              <div key={r.isu}>
                <div className="flex justify-between mb-1.5 items-center">
                  <span className="text-[12.5px] font-medium text-text-main">{r.isu}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 text-[10.5px] font-mono">
                      <span className="text-success">+{r.pos}%</span>
                      <span className="text-warning">{r.neu}%</span>
                      <span className="text-danger">-{r.neg}%</span>
                    </div>
                    <button
                      onClick={() => openDetail(r.isu)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[10.5px] font-mono text-text-muted hover:border-primary hover:text-primary hover:bg-accent/40 transition-all cursor-pointer"
                    >
                      Detail <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex h-[6px] rounded-full overflow-hidden gap-[1px]">
                  <div className="bg-success"                style={{ width: `${r.pos}%` }}/>
                  <div className="bg-warning"                style={{ width: `${r.neu}%` }}/>
                  <div className="bg-danger rounded-r-full"  style={{ width: `${r.neg}%` }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 pt-3 border-t border-border">
            {[{ lbl: 'Positif', c: 'bg-success' }, { lbl: 'Netral', c: 'bg-warning' }, { lbl: 'Negatif', c: 'bg-danger' }].map(l => (
              <div key={l.lbl} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <div className={`w-2 h-2 rounded-sm ${l.c}`}/> {l.lbl}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalIsu && (
        <IsuDetailModal
          detail={modalIsu}
          onClose={() => setModalIsu(null)}
          onAnalisis={handleBuatAnalisis}
          onChatbot={handleBuatAnalisis}
        />
      )}
    </>
  )
}
