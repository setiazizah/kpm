import React from 'react'
import {
  LayoutDashboard, Database, MessageSquare, FileText,
  Radio, ClipboardList, Clock, User, Activity,
  PieChart, Tag, Wifi
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Page } from '../types'

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
  badge?: { text: string; variant: 'red' | 'blue' | 'green' | 'gold' }
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Monitor',
    items: [
      { id: 'dashboard',   label: 'Overview',         icon: <LayoutDashboard size={14} />, badge: { text: '3', variant: 'red' } },
      { id: 'monitoring',  label: 'Monitoring Isu',   icon: <Activity size={14} />,        badge: { text: '11', variant: 'gold' } },
      { id: 'sentimen',    label: 'Analisis Sentimen',icon: <PieChart size={14} /> },
    ]
  },
  {
    label: 'Analisis Isu',
    items: [
      { id: 'chat',   label: 'Tanya Isu',     icon: <MessageSquare size={14} /> },
      { id: 'narasi', label: 'Viewer Narasi', icon: <FileText size={14} /> },
      { id: 'konten', label: 'Browser Konten',icon: <Database size={14} />,  badge: { text: '1.2k', variant: 'blue' } },
    ]
  },
  {
    label: 'Output',
    items: [
      { id: 'stratkom', label: 'Strategi Komunikasi', icon: <Radio size={14} /> },
      { id: 'brief',    label: 'Executive Brief',     icon: <ClipboardList size={14} /> },
      { id: 'riwayat',  label: 'Riwayat Dokumen',     icon: <Clock size={14} />, badge: { text: '24', variant: 'green' } },
    ]
  },
  {
    label: 'Tools',
    items: [
      { id: 'labeling',  label: 'Labeling UI',    icon: <Tag size={14} />, badge: { text: '12', variant: 'gold' } },
      { id: 'crawling',  label: 'Crawling Status',icon: <Wifi size={14} /> },
    ]
  }
]

const badgeColor = {
  red:  'bg-danger text-white',
  blue: 'bg-primary text-white',
  green:'bg-success text-white',
  gold: 'bg-warning text-[#1B2559]',
}

export default function Sidebar() {
  const { page, navigate } = useApp()

  return (
    <aside className="w-[240px] flex-shrink-0 bg-white border-r border-border flex flex-col h-full z-10 shadow-[2px_0_12px_rgba(27,37,89,0.04)]">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="text-[10px] font-semibold tracking-[2px] uppercase text-text-muted mb-1">KPM × AITF</div>
        <div className="font-extrabold text-[16px] text-text-main leading-tight">Intelligence<br/>Dashboard</div>
        <div className="text-[11px] text-text-muted mt-0.5">Komdigi · v1.0</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.label} className="mb-2">
            <div className="px-5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-text-muted/60">
              {sec.label}
            </div>
            {sec.items.map(item => {
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-[9px] text-[13px] font-semibold transition-colors duration-150 cursor-pointer text-left border-l-[3px] focus-visible:outline-none focus-visible:bg-primary/[0.06] focus-visible:text-primary ${
                    active
                      ? 'border-l-primary bg-primary/[0.06] text-primary'
                      : 'border-l-transparent text-text-muted hover:bg-surface hover:text-text-main'
                  }`}
                >
                  <span className={`w-[16px] text-center flex-shrink-0 ${active ? 'text-primary' : 'text-text-muted'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor[item.badge.variant]}`}>
                      {item.badge.text}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-[11px] text-text-muted">Live · 2 mnt lalu</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-bold text-text-main truncate">Sari Rahmawati</div>
            <div className="text-[11px] text-text-muted">Humas · Kementerian</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
