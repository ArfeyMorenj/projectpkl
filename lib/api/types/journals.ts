export interface Journal {
  id: number
  number?: string
  no_journal?: string
  date?: string
  journal_date?: string
  description?: string
  notes?: string
  source?: string
  reference_type?: string
  status?: string
  total_debit?: number
  total_credit?: number
  created_at?: string
  updated_at?: string
}

export interface JournalsListResponse {
  success: boolean
  data: {
    current_page: number
    data: Journal[]
    first_page_url?: string
    last_page_url?: string
    next_page_url?: string | null
    prev_page_url?: string | null
    per_page: number
    total: number
    last_page: number
  }
  message?: string
}

export type JournalPage = JournalsListResponse['data']
