/**
 * Generic data-fetching hooks untuk menggantikan data statis.
 * Mengikuti pola React best-practice dengan ignore flag untuk
 * mencegah race condition, sesuai dokumentasi React 18.
 */
import { useState, useEffect } from 'react'
import { getToken } from '../auth/auth'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useGet<T>(path: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!path || !BASE_URL) return

    let ignore = false
    setLoading(true)
    setError(null)

    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`${BASE_URL}${path}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<T>
      })
      .then(json => {
        if (!ignore) {
          setData(json)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!ignore) {
          setError(String(err))
          setLoading(false)
        }
      })

    return () => { ignore = true }
  }, [path, tick])

  const refetch = () => setTick(t => t + 1)

  return { data, loading, error, refetch }
}

// ── Specific hooks ──────────────────────────────────────────────

export function useDashboardStats() {
  return useGet<unknown>('/v1/stats/overview')
}

export function useIsuList() {
  return useGet<unknown[]>('/v1/isu/list')
}

export function useIsuDetail(nama: string | null) {
  const path = nama ? `/v1/isu/${encodeURIComponent(nama)}` : null
  return useGet<unknown>(path)
}

export function useKontenSearch(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const path = qs ? `/v1/konten/search?${qs}` : '/v1/konten/search'
  return useGet<unknown[]>(path)
}

export function useCrawlerStatus() {
  return useGet<{ crawlers: unknown[]; pipeline: unknown[] }>('/v1/crawler/status')
}

export function useLabelingQueue() {
  return useGet<unknown[]>('/v1/labeling/queue')
}

export function useRiwayat() {
  return useGet<unknown[]>('/v1/history')
}
