import { useEffect, useState } from 'react'
import { getSentimentAnalysis } from '../api/dataApi'

export interface SentimentAnalysisData {
  overall: {
    positive: number
    negative: number
    neutral: number
    total_posts: number
  }
  by_hour?: Array<{
    hour: number
    positive: number
    negative: number
    neutral: number
  }>
  by_source: Record<string, { positive: number; negative: number; neutral: number }>
  trending_topics: Array<{
    topic: string
    sentiment: 'positive' | 'negative'
    volume: number
    trend: string
  }>
}

export function useSentimentAnalysis() {
  const [data, setData] = useState<SentimentAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const analysisData = await getSentimentAnalysis()
        setData(analysisData)
        setError(null)
      } catch (err) {
        setError(String(err))
        console.error('Error loading sentiment analysis:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { data, loading, error }
}
