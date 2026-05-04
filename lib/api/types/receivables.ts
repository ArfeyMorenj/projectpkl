// Receivables Management Types
// Based on GET /api/receivables response from Postman collection

export interface Receivable {
  id: number
  client_id: number
  client_name: string
  invoice_number: string
  amount: number
  paid_amount: number
  outstanding_amount: number
  invoice_date: string
  due_date: string
  status: 'outstanding' | 'partial' | 'paid'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ReceivableDetail extends Receivable {
  client_code: string
  terms_days: number
  days_overdue: number
  payment_history?: Array<{
    id: number
    amount: number
    payment_date: string
    reference: string
  }>
}

export interface ReceivablesListResponse {
  success: boolean
  data: Receivable[]
  message?: string
  meta?: {
    total: number
    total_amount: number
    total_paid: number
    total_outstanding: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface ReceivablesSearchResponse {
  success: boolean
  data: Receivable[]
  message?: string
}

export interface ReceivableSummaryResponse {
  success: boolean
  data: {
    total_amount: number
    total_paid: number
    total_outstanding: number
    count_outstanding: number
    count_partial: number
    count_paid: number
    days_30: number
    days_60: number
    days_90: number
    days_over_90: number
  }
  message?: string
}

export interface ReceivableSummary {
  total_amount: number
  total_paid: number
  total_outstanding: number
  count_outstanding: number
  count_partial: number
  count_paid: number
  days_30: number
  days_60: number
  days_90: number
  days_over_90: number
}
