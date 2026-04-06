import { useEffect, useState } from 'react'
import { getMonitoringIssues } from '../api/dataApi'

export interface MonitoringIssue {
  id: string
  title: string
  description: string
  status: 'high-alert' | 'monitoring'
  sentiment_trend: 'positive' | 'negative' | 'neutral'
  volume_trend: number
  sources: Record<string, number>
  key_sentiment: { positive: number; negative: number; neutral: number }
  created_at: string
  last_update: string
}

export function useMonitoringData() {
  const [issues, setIssues] = useState<MonitoringIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await getMonitoringIssues()
        setIssues(data)
        setError(null)
      } catch (err) {
        setError(String(err))
        console.error('Error loading monitoring issues:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { issues, loading, error }
}
