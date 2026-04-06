import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardPage from './pages/DashboardPage'
import MonitoringPage from './pages/MonitoringPage'
import SentimenPage from './pages/SentimenPage'
import BrowserKontenPage from './pages/BrowserKontenPage'
import ChatPage from './pages/ChatPage'
import NarasiPage from './pages/NarasiPage'
import StratkomPage from './pages/StratkomPage'
import BriefPage from './pages/BriefPage'
import RiwayatPage from './pages/RiwayatPage'
import LabelingPage from './pages/LabelingPage'
import CrawlingPage from './pages/CrawlingPage'

function PageContent() {
  const { page, chatKey } = useApp()
  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    monitoring: <MonitoringPage />,
    sentimen: <SentimenPage />,
    konten: <BrowserKontenPage />,
    chat: <ChatPage key={chatKey} />,
    narasi: <NarasiPage />,
    stratkom: <StratkomPage />,
    brief: <BriefPage />,
    riwayat: <RiwayatPage />,
    labeling: <LabelingPage />,
    crawling: <CrawlingPage />,
  }
  return <>{pages[page] ?? <DashboardPage />}</>
}

export default function App() {
  return (
    <AppProvider>
      <div className="flex h-full bg-background overflow-hidden font-sans">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 overflow-hidden">
            <PageContent />
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
