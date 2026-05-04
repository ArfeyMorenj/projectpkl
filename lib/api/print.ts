import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

export type PrintBatchFilters = {
  date_from?: string
  date_to?: string
}

type PrintBatchInvoice = {
  checked?: boolean
  invoice_id: number
  number: string
  date: string
  client_name: string
  invoice_type: string
  amount: number
  description?: string
  is_paid?: boolean
  pdf_url?: string
}

export type PrintBatchResponse = {
  success: boolean
  filter?: PrintBatchFilters
  total?: number
  data: PrintBatchInvoice[]
  message?: string
}

export type PrintBatchQueueResponse = {
  success: boolean
  message?: string
  data: {
    count: number
    invoices: Array<{
      invoice_id: number
      number: string
      client_name: string
      pdf_url?: string
    }>
  }
}

function buildUrl(endpoint: string) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseURL}${basePath}/${cleanEndpoint}`
}

function buildAuthHeaders(customHeaders?: Record<string, string>) {
  const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'
  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...customHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function getInvoiceBatchPrint(filters?: PrintBatchFilters): Promise<PrintBatchResponse> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  const query = params.toString()
  const url = query ? `${ENDPOINTS.PRINT.BATCH_INVOICES}?${query}` : ENDPOINTS.PRINT.BATCH_INVOICES
  const response = await apiClient.get<PrintBatchResponse>(url)
  return response
}

export async function queueBatchInvoices(filters?: PrintBatchFilters): Promise<PrintBatchQueueResponse> {
  const response = await apiClient.post<PrintBatchQueueResponse>(ENDPOINTS.PRINT.QUEUE_BATCH_INVOICES, filters ?? {})
  return response
}

export async function downloadInvoicePdf(id: string | number): Promise<Blob> {
  const response = await fetch(buildUrl(ENDPOINTS.PRINT.INVOICE_PDF(id)), {
    method: 'GET',
    headers: buildAuthHeaders({ Accept: 'application/pdf' }),
  })

  if (!response.ok) {
    throw new Error(`Failed to download invoice PDF (${response.status})`)
  }

  return response.blob()
}

export async function downloadReceiptPdf(id: string | number): Promise<Blob> {
  const response = await fetch(buildUrl(ENDPOINTS.PRINT.RECEIPT_PDF(id)), {
    method: 'GET',
    headers: buildAuthHeaders({ Accept: 'application/pdf' }),
  })

  if (!response.ok) {
    throw new Error(`Failed to download receipt PDF (${response.status})`)
  }

  return response.blob()
}
