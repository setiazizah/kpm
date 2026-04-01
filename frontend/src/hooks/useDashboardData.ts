/**
 * Custom hook untuk manage dashboard data
 */
import { useEffect, useState } from 'react'
import { getDashboardMetrics, getTrendData, getSentimentData, getTopIssues } from '../api/dataApi'
import type { DashboardMetrics, TrendData, SentimentData, Issue } from '../types/index'

export interface DashboardDataState {
  metrics: DashboardMetrics | null
  trends: TrendData[]
  sentiment: SentimentData | null
  issues: Issue[]
  loading: boolean
  error: string | null
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardDataState>({
    metrics: null,
    trends: [],
    sentiment: null,
    issues: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        
        const [metricsData, trendData, sentimentData, issuesData] = await Promise.all([
          getDashboardMetrics(),
          getTrendData(),
          getSentimentData(),
          getTopIssues(10),
        ])
        
        setState({
          metrics: metricsData,
          trends: trendData,
          sentiment: sentimentData,
          issues: issuesData,
          loading: false,
          error: null,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data'
        setState(prev => ({ ...prev, loading: false, error: message }))
        console.error('[useDashboardData] Error:', err)
      }
    }

    loadData()
  }, [])

  return state
}
