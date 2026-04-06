/**
 * Workflow API client — menghubungkan frontend ke backend orchestration.
 * Jika backend tidak tersedia (VITE_API_URL tidak diset atau koneksi gagal),
 * otomatis fallback ke dummy data sehingga frontend tetap berfungsi penuh.
 */
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  GenerateStratkomRequest,
  GenerateStratkomResponse,
  ReviseRequest,
  ReviseResponse,
  ExportContentRequest,
  ExportContentResponse,
} from '../types/workflow'
import {
  dummyAnalyze,
  dummyGenerateStratkom,
  dummyRevise,
  dummyExportContent,
} from './dummyData'
import { getToken } from '../auth/auth'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
const USE_DUMMY = !BASE_URL

async function post<T>(path: string, body: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body:   JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${path} gagal (${res.status}): ${text}`)
  }
  return res.json() as Promise<T>
}

// ----------------------------------------------------------------

export async function analyzeIssue(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  if (USE_DUMMY) return dummyAnalyze(req.query, req.session_id)
  return post<AnalyzeResponse>('/v1/workflow/analyze', req)
}

export async function generateStratkom(
  req: GenerateStratkomRequest,
  queryHint = '',
): Promise<GenerateStratkomResponse> {
  if (USE_DUMMY) return dummyGenerateStratkom(req.session_id, queryHint)
  return post<GenerateStratkomResponse>('/v1/workflow/generate-stratkom', req)
}

export async function revise(req: ReviseRequest, queryHint = ''): Promise<ReviseResponse> {
  if (USE_DUMMY) return dummyRevise(req.session_id, queryHint, req.user_edits)
  return post<ReviseResponse>('/v1/workflow/revise', req)
}

export async function exportContent(req: ExportContentRequest): Promise<ExportContentResponse> {
  if (USE_DUMMY) return dummyExportContent(req.session_id, req.content_type, req.format)
  return post<ExportContentResponse>('/v1/workflow/export', req)
}

/** Generate session ID unik */
export function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
