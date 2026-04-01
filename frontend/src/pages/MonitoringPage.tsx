import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ALL_ISU } from '../data/monitoring'
import MonitoringFilterBar from '../components/monitoring/MonitoringFilterBar'
import MonitoringStatsCards from '../components/monitoring/MonitoringStatsCards'
import SubtopikTags from '../components/monitoring/SubtopikTags'
import IssueTable from '../components/monitoring/IssueTable'

export default function MonitoringPage() {
  const { navigate } = useApp()
  const [search, setSearch]       = useState('')
  const [katFilter, setKat]       = useState('')
  const [sentFilter, setSent]     = useState('')
  const [activeTag, setTag]       = useState('')

  const reset = () => { setSearch(''); setKat(''); setSent(''); setTag('') }

  const filtered = ALL_ISU.filter(r => {
    const q = search.toLowerCase()
    return (
      (!q || r.nama.toLowerCase().includes(q) || r.subtopik.some(s => s.includes(q))) &&
      (!katFilter || r.kat === katFilter) &&
      (!sentFilter || r.sent === sentFilter.toLowerCase()) &&
      (!activeTag || r.subtopik.includes(activeTag))
    )
  })

  return (
    <div className="p-6 overflow-y-auto h-full space-y-4">
      <MonitoringFilterBar
        search={search} katFilter={katFilter} sentFilter={sentFilter} activeTag={activeTag}
        onSearch={setSearch} onKat={setKat} onSent={setSent} onReset={reset}
      />
      <MonitoringStatsCards />
      <SubtopikTags activeTag={activeTag} onTagClick={setTag} />
      <IssueTable filtered={filtered} onReset={reset} onNavigate={navigate} />
    </div>
  )
}
