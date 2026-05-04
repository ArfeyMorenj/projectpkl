// Invoice Management Types
// Based on Postman collection - Multiple invoice variants

// Invoice Item (Line item for invoice)
export interface InvoiceItem {
  id?: number
  invoice_id?: number
  item_id: number
  item_code: string
  item_name: string
  description?: string
  unit: string
  quantity: number
  unit_price: number
  discount_percent?: number
  discount_amount?: number
  subtotal: number
  tax_percent?: number
  tax_amount?: number
  total: number
}

// Main Invoice
export interface Invoice {
  id: number
  number?: string
  no_invoice?: string
  invoice_number: string
  date?: string
  invoice_date: string
  due_date: string
  client_id: number
  invoice_type_id?: number
  bank_id?: number
  work_order_id?: number
  period?: string
  description?: string
  invoice_category?: string
  invoice_mode?: string
  include_ppn?: boolean
  auto_journal?: boolean
  is_paid?: boolean
  client_code: string
  client_name: string
  status: 'draft' | 'posted' | 'paid' | 'partial' | 'cancelled'
  items_count: number
  subtotal: number
  discount_amount?: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  outstanding_amount: number
  notes?: string
  terms_days: number
  tax_series_id?: number
  period_id?: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

// Invoice Detail (with items)
export interface InvoiceDetail extends Invoice {
  items: InvoiceItem[]
  created_by?: string
  updated_by?: string
  posted_date?: string
  posted_by?: string
  tax_series_name?: string
}

// Create Invoice Request
export interface CreateInvoiceRequest {
  number?: string
  invoice_number?: string // Auto-generated if not provided
  invoice_type_id?: number
  bank_id?: number
  work_order_id?: number
  period?: string
  date?: string
  invoice_date: string
  due_date: string
  client_id: number
  description?: string
  invoice_category?: string
  invoice_mode?: string
  include_ppn?: boolean
  auto_journal?: boolean
  is_paid?: boolean
  items: Array<{
    item_id: number
    quantity: number
    unit_price: number
    discount_percent?: number
  }>
  notes?: string
  terms_days?: number
  tax_series_id?: number
}

// Update Invoice Request
export interface UpdateInvoiceRequest {
  number?: string
  invoice_number?: string
  invoice_type_id?: number
  bank_id?: number
  work_order_id?: number
  period?: string
  date?: string
  invoice_date?: string
  due_date?: string
  client_id?: number
  description?: string
  invoice_category?: string
  invoice_mode?: string
  include_ppn?: boolean
  auto_journal?: boolean
  is_paid?: boolean
  items?: Array<{
    id?: number
    item_id: number
    quantity: number
    unit_price: number
    discount_percent?: number
  }>
  notes?: string
  terms_days?: number
}

// Response Types
export interface InvoiceResponse {
  success: boolean
  data: InvoiceDetail
  message?: string
}

export interface InvoicesListResponse {
  success: boolean
  data: Invoice[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    total_amount: number
    total_paid: number
    total_outstanding: number
  }
}

export interface InvoicesSearchResponse {
  success: boolean
  data: Invoice[]
  message?: string
}

export interface InvoiceDeleteResponse {
  success: boolean
  message: string
}

// Actions
export interface PostInvoiceRequest {
  invoice_id: number
  period_id?: number
}

export interface PostInvoiceResponse {
  success: boolean
  data: {
    invoice_id: number
    status: string
    posted_date: string
    journal_id?: number
  }
  message?: string
}

// Number Generation
export interface GenerateInvoiceNumberRequest {
  prefix?: string
  period_id?: number
}

export interface GenerateInvoiceNumberResponse {
  success: boolean
  data: {
    next_number: string
  }
}

export interface InvoiceSummary {
  total_invoices: number
  total_amount: number
  total_paid: number
  total_outstanding: number
  by_status: {
    draft: number
    posted: number
    paid: number
    partial: number
    cancelled: number
  }
}

export interface InvoiceSummaryResponse {
  success: boolean
  data: InvoiceSummary
  message?: string
}
