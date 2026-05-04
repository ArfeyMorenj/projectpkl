import type { Invoice } from "./invoices"

export interface PostingPaymentListItem {
  posting_id: number
  number: string
  posting_date: string
  description?: string
  client_name?: string
  total_invoice: number | string
  debet: number | string
  kredit: number | string
  total_bayar: number | string
}

export interface PostingPaymentHeader {
  id: number
  bank_code: string
  bank_name: string
  acc_code: string
  cdf_code: string
  date: string
  number: string
  description?: string
  client_code: string
  client_name: string
  total_invoice: number | string
  debet: number | string
  kredit: number | string
  total_bayar: number | string
  cetak_kwitansi: boolean
  jurnal_otomatis: boolean
  tt_dan_stempel: boolean
  is_posted: boolean
}

export interface PostingPaymentInvoiceDetail {
  id?: number
  no_invoice: string
  tgl_invoice: string
  klien: string
  nilai: number | string
  ppn: number | string
  total: number | string
}

export interface PostingPaymentCostDetail {
  id?: number
  posting_payment_id?: number
  description: string
  amount: number | string
  created_at?: string
  updated_at?: string
}

export interface PostingPaymentJournalLine {
  no_bukti: string
  tanggal: string
  acc: string
  keterangan: string
  debet: number | string
  kredit: number | string
}

export interface PostingPaymentDetailData {
  header: PostingPaymentHeader
  detail_invoice: PostingPaymentInvoiceDetail[]
  detail_biaya: PostingPaymentCostDetail[]
  jurnal: PostingPaymentJournalLine[]
}

export interface PostingPaymentsListResponse {
  success: boolean
  filter?: Record<string, unknown> | unknown[]
  total?: number
  data: PostingPaymentListItem[]
  message?: string
}

export interface PostingPaymentDetailResponse {
  success: boolean
  form?: {
    title?: string
    tabs?: string[]
    sub_tabs?: string[]
  }
  data: PostingPaymentDetailData
  message?: string
}

export interface PostingPaymentSummaryJournalResponse {
  success: boolean
  posting_number?: string
  total_debit?: number | string
  total_credit?: number | string
  data: PostingPaymentJournalLine[]
  message?: string
}

export interface PostingPaymentCostsResponse {
  success: boolean
  data: PostingPaymentCostDetail[]
  total_cost?: number | string
  message?: string
}

export interface PostingPaymentCostTotals {
  total_invoice: number | string
  debet: number | string
  kredit: number | string
  total_paid: number | string
}

export interface PostingPaymentCostSaveResponse {
  success: boolean
  message?: string
  data: PostingPaymentCostDetail
  totals?: PostingPaymentCostTotals
}

export interface PostingPaymentCostDeleteResponse {
  success: boolean
  message?: string
  totals?: PostingPaymentCostTotals
}

export interface CreatePostingPaymentInvoiceItem {
  invoice_id: number
  amount: number
  ppn: number
}

export interface CreatePostingPaymentCostItem {
  description: string
  amount: number
}

export interface CreatePostingPaymentRequest {
  number: string
  date: string
  bank_id: number
  client_id: number
  description?: string
  print_receipt?: boolean
  auto_journal?: boolean
  without_stamp?: boolean
  invoices: CreatePostingPaymentInvoiceItem[]
  costs: CreatePostingPaymentCostItem[]
}

export interface PostPostingOmzetRequest {
  invoice_id: number
}

export interface PostPostingOmzetJournalLine {
  document_number: string
  date: string
  sequence: string
  acc_code: string
  description: string
  debit: number | string
  credit: number | string
  document_type: string
  reference_id: number
  updated_at?: string
  created_at?: string
  id?: number
}

export interface PostPostingOmzetResponse {
  success: boolean
  message?: string
  invoice: Invoice
  journals: PostPostingOmzetJournalLine[]
}
