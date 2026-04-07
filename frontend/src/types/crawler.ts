// ── Batch ─────────────────────────────────────────────────────────────────────

export interface BatchRecord {
  batch_id:         string
  status:           string
  raw_data_count:   number
  comment_count:    number
  success_rate_pct: number
  start_time:       string | null
  end_time:         string | null
}

export interface BatchListResponse {
  status: string
  data:   BatchRecord[]
  meta:   { count: number }
}

export interface BatchStatusResponse {
  batch_id:         string
  status:           string
  raw_data_count:   number
  comment_count:    number
  records_error:    number
  success_rate_pct: number
  start_time:       string
  end_time:         string | null
}

// ── Crawl Trigger ─────────────────────────────────────────────────────────────

export interface CrawlTriggerResponse {
  batch_id:      string
  platform:      string | null
  message:       string
  keyword_count: number
}

// ── Keyword ───────────────────────────────────────────────────────────────────

export interface KeywordItem {
  keyword_id:        string
  keyword_text:      string
  taxonomy_category: string
  crawl_priority:    string
  trend_score:       number | null
  is_active:         boolean
}

export interface KeywordListResponse {
  keywords:     KeywordItem[]
  total:        number
  active_count: number
}
