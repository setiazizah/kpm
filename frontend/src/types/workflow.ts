// ============================================================
// Tipe data yang mencerminkan skema backend orchestration API
// ============================================================

export type WorkflowChannel = 'press' | 'social' | 'internal'
export type WorkflowTone    = 'formal' | 'semi-formal' | 'informal'
export type WorkflowStatus  = 'success' | 'partial' | 'error'
export type ExportFormat    = 'docx' | 'pdf'

export interface StepMeta {
  status:        string
  latency_ms:    number | null
  fallback_used: boolean
}

// ----- Data models -----

export interface RetrievedDoc {
  doc_id:  string
  content: string
  source:  string
  score:   number | null
}

export interface RegulasiRef {
  nomor:   string   // e.g. "UU No. 22 Tahun 2001"
  judul:   string   // e.g. "Minyak dan Gas Bumi"
  lembaga: string   // e.g. "DPR RI"
  tahun:   number
}

export interface NarasiData {
  isu:        string
  narasi:     string
  key_points: string[]
}

export interface StratkomData {
  strategi:    string
  pesan_utama: string
  rekomendasi: string[]
}

// ----- Requests -----

export interface AnalyzeRequest {
  session_id:      string
  user_id:         string
  query:           string
  channel:         WorkflowChannel
  tone:            WorkflowTone
  chat_history:    { role: string; content: string }[]
  target_audience?: string
  export_format?:  ExportFormat
}

export interface GenerateStratkomRequest {
  session_id:    string
  export_format?: ExportFormat
}

export interface ReviseRequest {
  session_id:    string
  export_format: ExportFormat
  user_edits?:   string
}

export interface ExportContentRequest {
  session_id:   string
  content_type: 'narasi' | 'stratkom' | 'draft'
  format:       ExportFormat
}

// ----- Responses -----

export interface AnalyzeResponse {
  status:         WorkflowStatus
  session_id:     string
  narasi:         NarasiData | null
  retrieved_docs: RetrievedDoc[]
  regulasi:       RegulasiRef[]
  export_url:     string | null
  step_meta:      Record<string, StepMeta>
  message:        string | null
}

export interface GenerateStratkomResponse {
  status:     WorkflowStatus
  session_id: string
  stratkom:   StratkomData | null
  export_url: string | null
  step_meta:  Record<string, StepMeta>
  message:    string | null
}

export interface ReviseResponse {
  status:        WorkflowStatus
  session_id:    string
  revised_draft: string | null
  export_url:    string | null
  step_meta:     Record<string, StepMeta>
  message:       string | null
}

export interface ExportContentResponse {
  status:       WorkflowStatus
  session_id:   string
  content_type: string
  format:       ExportFormat
  export_url:   string | null
  message:      string | null
}

// ----- Frontend session state -----

export type WorkflowStep = 'idle' | 'analyzing' | 'analyzed' | 'stratkom_loading' | 'stratkom_done' | 'revising' | 'done' | 'error'

export interface WorkflowSession {
  sessionId:     string
  userId:        string
  query:         string
  channel:       WorkflowChannel
  tone:          WorkflowTone
  step:          WorkflowStep
  narasi:        NarasiData | null
  retrievedDocs: RetrievedDoc[]
  regulasi:      RegulasiRef[]
  stratkom:      StratkomData | null
  revisedDraft:  string | null
  exportUrl:     string | null
  stepMeta:      Record<string, StepMeta>
  errorMessage:  string | null
}
