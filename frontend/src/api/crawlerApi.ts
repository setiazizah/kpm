/**
 * Crawler API Client — team1-crawler (FastAPI)
 * Base URL dikontrol via VITE_CRAWLER_API_URL:
 *   - Dev  : http://localhost:8000
 *   - Prod : set VITE_CRAWLER_API_URL=https://crawler.domain.com
 */

import type {
  BatchListResponse,
  BatchStatusResponse,
  CrawlTriggerResponse,
  KeywordListResponse,
} from '../types/crawler'

const DEBUG   = import.meta.env.VITE_DEBUG === 'true'
const BASE_URL = (import.meta.env.VITE_CRAWLER_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

async function get<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`
  try {
    if (DEBUG) console.log(`[CRAWLER API] GET ${url}`)
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) throw new Error(`API ${url} gagal (${res.status})`)
    const data = await res.json() as T
    if (DEBUG) console.log(`[CRAWLER API] Response dari ${url}:`, data)
    return data
  } catch (err) {
    console.error(`[CRAWLER API ERROR] ${url}:`, err)
    throw err
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`
  try {
    if (DEBUG) console.log(`[CRAWLER API] POST ${url}`, body)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API ${url} gagal (${res.status})`)
    const data = await res.json() as T
    if (DEBUG) console.log(`[CRAWLER API] Response dari ${url}:`, data)
    return data
  } catch (err) {
    console.error(`[CRAWLER API ERROR] ${url}:`, err)
    throw err
  }
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function getCrawlerHealth() {
  try {
    return await get<{ status: string; service: string }>('/api/v1/health')
  } catch {
    return null
  }
}

// ── Crawlers / Trigger ────────────────────────────────────────────────────────

export async function triggerCrawl(platform?: string, dry_run = false) {
  return post<CrawlTriggerResponse>('/api/v1/crawlers/trigger', {
    platform: platform ?? null,
    dry_run,
  })
}

export async function getBatchStatus(batch_id: string) {
  try {
    return await get<BatchStatusResponse>(`/api/v1/crawlers/status/${batch_id}`)
  } catch {
    return null
  }
}

// ── Batches ───────────────────────────────────────────────────────────────────

export async function getBatches(limit = 20) {
  try {
    const res = await get<BatchListResponse>(`/api/v1/batches?limit=${limit}`)
    return res.data ?? []
  } catch {
    return []
  }
}

// ── Keywords ──────────────────────────────────────────────────────────────────

export async function getKeywords(active_only = true) {
  try {
    const res = await get<KeywordListResponse>(`/api/v1/keywords?active_only=${active_only}`)
    return res.keywords ?? []
  } catch {
    return []
  }
}
