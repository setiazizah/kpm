export const TREND_DATA = [
  { date: '27/2', twitter: 4100, media: 2800, tiktok: 1200 },
  { date: '28/2', twitter: 5200, media: 3100, tiktok: 1800 },
  { date: '1/3',  twitter: 4800, media: 2900, tiktok: 2100 },
  { date: '2/3',  twitter: 6300, media: 3600, tiktok: 2400 },
  { date: '3/3',  twitter: 7100, media: 4100, tiktok: 2800 },
  { date: '4/3',  twitter: 9200, media: 5400, tiktok: 3600 },
]

export const TOP_ISU = [
  { rank: '01', nama: 'PP TUNAS',              vol: 8241, pct: 100, sent: 'positif', trend: '+24%',  trending: 'up', platform: ['Twitter/X', 'IG']    },
  { rank: '02', nama: 'Banjir Jabodetabek',    vol: 6412, pct: 78,  sent: 'negatif', trend: '+67%',  trending: 'up', platform: ['Twitter/X', 'Media'] },
  { rank: '03', nama: 'Internet Gratis Desa',  vol: 4520, pct: 55,  sent: 'positif', trend: '+12%',  trending: 'up', platform: ['TikTok', 'Media']    },
  { rank: '04', nama: 'Hoaks Vaksin',          vol: 3124, pct: 38,  sent: 'negatif', trend: '+340%', trending: 'up', platform: ['TikTok', 'WA']       },
  { rank: '05', nama: 'Literasi Digital Anak', vol: 2520, pct: 31,  sent: 'positif', trend: '+8%',   trending: 'up', platform: ['IG', 'Media']        },
]

export const SENT_PCT = { pos: 58.3, neu: 14.9, neg: 26.8 }

export type MetricCardData = {
  lbl: string
  val: string
  delta: string
  up: boolean
  icon: 'message-circle' | 'smile' | 'alert-octagon' | 'eye'
  iconBg: string
  iconColor: string
}

export const METRIC_CARDS: MetricCardData[] = [
  { lbl: 'Total Percakapan', val: '28.4K', delta: '+14.2% dari kemarin',  up: true,  icon: 'message-circle', iconBg: 'bg-[#E9F3FF]', iconColor: 'text-[#3965FF]' },
  { lbl: 'Sentimen Positif', val: '58.3%', delta: '-2.1% dari kemarin',   up: false, icon: 'smile',          iconBg: 'bg-[#D5F5EE]', iconColor: 'text-[#05CD99]' },
  { lbl: 'Isu Aktif',        val: '11',    delta: '+3 isu baru hari ini',  up: false, icon: 'alert-octagon',  iconBg: 'bg-[#FFF8D9]', iconColor: 'text-[#FFCE20]' },
  { lbl: 'Keyword Dipantau', val: '47',    delta: '+5 baru hari ini',      up: true,  icon: 'eye',            iconBg: 'bg-[#FDECEA]', iconColor: 'text-[#EE5D50]' },
]

import type { Page } from '../types'

export const EARLY_WARNINGS: { color: string; dot: string; title: string; sub: string; btnLbl: string; btnCls: string; navKey: Page }[] = [
  { color: 'border-l-danger  bg-danger-dim',  dot: 'bg-danger',  title: 'Hoaks Vaksin — Lonjakan 340% dalam 2 jam',       sub: 'Vol: 4.821 · TikTok + WhatsApp · Menyebar cepat',  btnLbl: 'Buat Analisis', btnCls: 'bg-danger text-white',                               navKey: 'chat' },
  { color: 'border-l-warning bg-warning-dim', dot: 'bg-warning', title: 'Banjir Jabodetabek — Sentimen negatif meningkat', sub: 'Vol: 6.412 · Semua platform · Trending 4 jam',      btnLbl: 'Pantau',        btnCls: 'border border-warning text-warning bg-transparent', navKey: 'chat' },
  { color: 'border-l-success bg-success-dim', dot: 'bg-success', title: 'PP TUNAS — Momentum positif tinggi',              sub: 'Vol: 8.241 · Sentimen +71% · Peluang amplifikasi',  btnLbl: 'Amplifikasi',   btnCls: 'border border-success text-success bg-transparent', navKey: 'chat' },
]
