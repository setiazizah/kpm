import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  ChevronRight
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import Card, { CardHeader, CardTitle, CardBody } from '../components/ui/Card'
import RiskBadge from '../components/ui/RiskBadge'
import SentimentBar from '../components/ui/SentimentBar'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const chartData = [
  { date: '27/12', volume: 520, negatif: 280 },
  { date: '28/12', volume: 640, negatif: 350 },
  { date: '29/12', volume: 780, negatif: 420 },
  { date: '30/12', volume: 1100, negatif: 680 },
  { date: '31/12', volume: 920, negatif: 590 },
  { date: '01/01', volume: 1450, negatif: 860 },
  { date: '02/01', volume: 1780, negatif: 1050 }
]

const issues = [
  { rank: 1, label: '#BBMNaik', risk: 'tinggi' as const, trend: 'up' as const },
  { rank: 2, label: '#SubsidiListrik', risk: 'sedang' as const, trend: 'up' as const },
  { rank: 3, label: '#MahalSembako', risk: 'sedang' as const },
  { rank: 4, label: '#InfrastrukturDesa', risk: 'rendah' as const, trend: 'down' as const },
  { rank: 5, label: '#BantuanLangsung', risk: 'rendah' as const }
]

const stats = [
  {
    label: 'Total Konten',
    value: '48.293',
    delta: '+1.247 hari ini',
    deltaPositive: true,
    icon: <BarChart2 size={18} />,
    bg: 'bg-card-blue',
    iconBg: 'bg-primary',
    iconColor: 'text-white',
    labelColor: 'text-blue-700',
    valueColor: 'text-card-blue-dark',
    deltaColor: 'text-blue-600',
    borderColor: 'border-l-primary'
  },
  {
    label: 'Sentimen Positif',
    value: '28%',
    delta: '-4% vs minggu lalu',
    deltaPositive: false,
    icon: <TrendingUp size={18} />,
    bg: 'bg-card-green',
    iconBg: 'bg-success',
    iconColor: 'text-white',
    labelColor: 'text-emerald-700',
    valueColor: 'text-card-green-dark',
    deltaColor: 'text-danger',
    borderColor: 'border-l-success'
  },
  {
    label: 'Sentimen Negatif',
    value: '52%',
    delta: '+11% vs minggu lalu',
    deltaPositive: false,
    icon: <TrendingDown size={18} />,
    bg: 'bg-card-amber',
    iconBg: 'bg-warning',
    iconColor: 'text-white',
    labelColor: 'text-amber-700',
    valueColor: 'text-card-amber-dark',
    deltaColor: 'text-warning',
    borderColor: 'border-l-warning'
  },
  {
    label: 'EWS Alert Aktif',
    value: '3',
    delta: '+2 baru hari ini',
    deltaPositive: false,
    icon: <AlertTriangle size={18} />,
    bg: 'bg-card-red',
    iconBg: 'bg-danger',
    iconColor: 'text-white',
    labelColor: 'text-red-700',
    valueColor: 'text-card-red-dark',
    deltaColor: 'text-danger',
    borderColor: 'border-l-danger'
  }
]

export default function DashboardPage() {
  const { navigate } = useApp()
  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* EWS Banner */}
      <div className="flex items-center gap-3 bg-danger-dim border border-danger/30 rounded-xl px-4 py-3.5 mb-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-danger flex items-center justify-center">
          <AlertTriangle size={16} className="text-white" />
        </div>
        <p className="text-sm text-red-900 leading-snug">
          <strong className="text-danger font-bold">EWS Alert:</strong>{' '}
          Volume sentimen negatif{' '}
          <strong className="text-red-800">#BBMNaik</strong>{' '}
          melampaui threshold 70% — 3.241 konten dalam 6 jam terakhir.{' '}
          Level:{' '}
          <span className="font-bold text-danger bg-red-100 px-1.5 py-0.5 rounded text-[11px] uppercase tracking-wide">TINGGI</span>
        </p>
        <Button variant="danger" size="sm" className="ml-auto flex-shrink-0" onClick={() => navigate('chat')}>
          Analisis Sekarang <ChevronRight size={13} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div
            key={s.label}
            className={`${s.bg} border-l-4 ${s.borderColor} border border-border/60 rounded-xl p-5 shadow-card flex flex-col gap-3`}
          >
            {/* Top row: label + icon */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${s.labelColor}`}>
                {s.label}
              </span>
              <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center ${s.iconColor} shadow-sm flex-shrink-0`}>
                {s.icon}
              </div>
            </div>
            {/* Value */}
            <div className={`text-[32px] font-bold leading-none ${s.valueColor}`}>
              {s.value}
            </div>
            {/* Delta */}
            <div className={`text-[11.5px] font-medium flex items-center gap-1 ${s.deltaColor}`}>
              {s.deltaPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Issues */}
      <div className="grid grid-cols-[1fr_340px] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>
              <BarChart2 size={14} className="inline mr-1.5 text-primary" />
              Trend Volume Isu — 7 Hari
            </CardTitle>
            <select className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-muted outline-none">
              <option>Semua Platform</option>
              <option>Twitter</option>
              <option>Instagram</option>
            </select>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#196ECD" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#196ECD" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2EAF0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7A8F', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7A8F' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E2EAF0', borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="volume" name="Total Volume" stroke="#196ECD" strokeWidth={2.5} fill="url(#gradVol)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="negatif" name="Negatif" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gradNeg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Top Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Isu</CardTitle>
            </CardHeader>
            <CardBody className="px-4 py-2">
              {issues.map(item => (
                <div key={item.rank} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-6 h-6 bg-surface rounded-md flex items-center justify-center text-[10px] font-mono text-text-muted flex-shrink-0">
                    {item.rank}
                  </div>
                  <span className="flex-1 text-[13px]">{item.label}</span>
                  <RiskBadge level={item.risk} />
                  {item.trend === 'up' && <TrendingUp size={13} className="text-danger" />}
                  {item.trend === 'down' && <TrendingDown size={13} className="text-success" />}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Sentimen */}
          <Card>
            <CardHeader><CardTitle>Breakdown Sentimen</CardTitle></CardHeader>
            <CardBody>
              <SentimentBar pos={28} neu={20} neg={52} showLegend />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
