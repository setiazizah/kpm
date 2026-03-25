import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Page } from '../types'
import type { WorkflowSession, WorkflowChannel, WorkflowTone } from '../types/workflow'
import {
  analyzeIssue,
  generateStratkom,
  revise,
  exportContent,
  newSessionId,
} from '../api/workflow'

// ----------------------------------------------------------------
// Context types
// ----------------------------------------------------------------

interface AppContextType {
  page:     Page
  navigate: (p: Page) => void

  session:  WorkflowSession

  runAnalyze:          (query: string, channel: WorkflowChannel, tone: WorkflowTone) => Promise<WorkflowSession['narasi']>
  runGenerateStratkom: () => Promise<void>
  runRevise:           (userEdits?: string, exportFormat?: 'docx' | 'pdf') => Promise<void>
  runExport:           (contentType: 'narasi' | 'stratkom' | 'draft', fmt: 'docx' | 'pdf') => Promise<string | null>
  resetSession:        () => void
}

// ----------------------------------------------------------------
// Default empty session
// ----------------------------------------------------------------

function emptySession(): WorkflowSession {
  return {
    sessionId:     newSessionId(),
    userId:        'u-001',
    query:         '',
    channel:       'press',
    tone:          'formal',
    step:          'idle',
    narasi:        null,
    retrievedDocs: [],
    regulasi:      [],
    stratkom:      null,
    revisedDraft:  null,
    exportUrl:     null,
    stepMeta:      {},
    errorMessage:  null,
  }
}

// ----------------------------------------------------------------
// Context + Provider
// ----------------------------------------------------------------

const AppContext = createContext<AppContextType>({
  page:                'dashboard',
  navigate:            () => {},
  session:             emptySession(),
  runAnalyze:          async () => null,
  runGenerateStratkom: async () => {},
  runRevise:           async () => {},
  runExport:           async () => null,
  resetSession:        () => {},
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [session, setSession] = useState<WorkflowSession>(emptySession)

  const patch = useCallback((updates: Partial<WorkflowSession>) => {
    setSession(prev => ({ ...prev, ...updates }))
  }, [])

  // ── 1. Tanya Isu ──────────────────────────────────────────────
  const runAnalyze = useCallback(async (
    query:   string,
    channel: WorkflowChannel,
    tone:    WorkflowTone,
  ): Promise<WorkflowSession['narasi']> => {
    const sid = newSessionId()
    setSession(prev => ({
      ...prev,
      step: 'analyzing', query, channel, tone, sessionId: sid,
      narasi: null, retrievedDocs: [], stratkom: null,
      revisedDraft: null, exportUrl: null, errorMessage: null,
    }))

    try {
      const res = await analyzeIssue({
        session_id:   sid,
        user_id:      'u-001',
        query,
        channel,
        tone,
        chat_history: [],
      })

      if (res.status === 'error') {
        patch({ step: 'error', errorMessage: res.message ?? 'Analisis gagal.' })
        return null
      }

      patch({
        step:          'analyzed',
        narasi:        res.narasi,
        retrievedDocs: res.retrieved_docs ?? [],
        regulasi:      res.regulasi ?? [],
        stepMeta:      res.step_meta,
        exportUrl:     res.export_url,
        errorMessage:  null,
      })
      return res.narasi
    } catch (err) {
      patch({ step: 'error', errorMessage: String(err) })
      return null
    }
  }, [patch])

  // ── 2. Generate StratKom ──────────────────────────────────────
  const runGenerateStratkom = useCallback(async () => {
    patch({ step: 'stratkom_loading', errorMessage: null })

    try {
      const snap = await new Promise<WorkflowSession>(resolve =>
        setSession(prev => { resolve(prev); return prev })
      )
      const res = await generateStratkom(
        { session_id: snap.sessionId },
        snap.query,
      )

      if (res.status === 'error') {
        patch({ step: 'analyzed', errorMessage: res.message ?? 'StratKom gagal.' })
        return
      }

      patch({
        step:         'stratkom_done',
        stratkom:     res.stratkom,
        stepMeta:     { ...snap.stepMeta, ...res.step_meta },
        exportUrl:    res.export_url ?? snap.exportUrl,
        errorMessage: null,
      })
    } catch (err) {
      patch({ step: 'analyzed', errorMessage: String(err) })
    }
  }, [patch])

  // ── 3. Revisi + Export ────────────────────────────────────────
  const runRevise = useCallback(async (
    userEdits?:   string,
    exportFormat: 'docx' | 'pdf' = 'docx',
  ) => {
    patch({ step: 'revising', errorMessage: null })

    try {
      const snap = await new Promise<WorkflowSession>(resolve =>
        setSession(prev => { resolve(prev); return prev })
      )
      const res = await revise(
        { session_id: snap.sessionId, export_format: exportFormat, user_edits: userEdits },
        snap.query,
      )

      if (res.status === 'error') {
        patch({ step: 'stratkom_done', errorMessage: res.message ?? 'Revisi gagal.' })
        return
      }

      patch({
        step:         'done',
        revisedDraft: res.revised_draft,
        exportUrl:    res.export_url,
        stepMeta:     { ...snap.stepMeta, ...res.step_meta },
        errorMessage: null,
      })
    } catch (err) {
      patch({ step: 'stratkom_done', errorMessage: String(err) })
    }
  }, [patch])

  // ── 4. Export standalone ──────────────────────────────────────
  const runExport = useCallback(async (
    contentType: 'narasi' | 'stratkom' | 'draft',
    fmt:         'docx' | 'pdf',
  ): Promise<string | null> => {
    const snap = await new Promise<WorkflowSession>(resolve =>
      setSession(prev => { resolve(prev); return prev })
    )
    try {
      const res = await exportContent({
        session_id:   snap.sessionId,
        content_type: contentType,
        format:       fmt,
      })
      return res.export_url
    } catch {
      return null
    }
  }, [])

  const resetSession = useCallback(() => setSession(emptySession()), [])

  return (
    <AppContext.Provider value={{
      page,
      navigate:            setPage,
      session,
      runAnalyze,
      runGenerateStratkom,
      runRevise,
      runExport,
      resetSession,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
