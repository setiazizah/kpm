import React from 'react'
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  FileText,
  Radio,
  ClipboardList,
  Clock,
  Hexagon,
  User
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Page } from '../types'

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
  badge?: { text: string; variant: 'red' | 'blue' | 'green' }
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Monitoring',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={15} />,
        badge: { text: '3', variant: 'red' }
      },
      {
        id: 'konten',
        label: 'Browser Konten',
        icon: <Database size={15} />,
        badge: { text: '1.2k', variant: 'blue' }
      }
    ]
  },
  {
    label: 'Analisis Isu',
    items: [
      { id: 'chat', label: 'Tanya Isu', icon: <MessageSquare size={15} /> },
      { id: 'narasi', label: 'Viewer Narasi', icon: <FileText size={15} /> }
    ]
  },
  {
    label: 'Output',
    items: [
      { id: 'stratkom', label: 'Strategi Komunikasi', icon: <Radio size={15} /> },
      { id: 'brief', label: 'Executive Brief', icon: <ClipboardList size={15} /> },
      {
        id: 'riwayat',
        label: 'Riwayat Dokumen',
        icon: <Clock size={15} />,
        badge: { text: '24', variant: 'green' }
      }
    ]
  }
]

const badgeColor = {
  red: 'bg-danger text-white',
  blue: 'bg-primary text-white',
  green: 'bg-success text-white'
}

export default function Sidebar() {
  const { page, navigate } = useApp()

  return (
    <aside className="w-[260px] flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen z-10">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Hexagon size={16} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-[17px] text-text-main leading-none">KomPub AI</div>
            <div className="text-[10px] font-mono text-text-muted mt-0.5 tracking-wide">v1.0 · RAG + MVP</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.label} className="mb-6">
            <div className="text-[10px] font-mono font-medium uppercase tracking-[1.5px] text-text-muted px-2 mb-1.5">
              {sec.label}
            </div>
            {sec.items.map(item => {
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium mb-0.5 transition-all cursor-pointer text-left ${
                    active
                      ? 'bg-accent text-primary border border-primary/30 font-semibold'
                      : 'text-text-main hover:bg-accent/60 hover:text-primary border border-transparent'
                  }`}
                >
                  <span className={active ? 'text-primary' : 'text-text-muted'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-full ${badgeColor[item.badge.variant]}`}>
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
      <div className="px-5 py-4 border-t border-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-text-main truncate">Sari Rahmawati</div>
          <div className="text-[10px] font-mono text-text-muted">Humas · Kementerian</div>
        </div>
      </div>
    </aside>
  )
}
