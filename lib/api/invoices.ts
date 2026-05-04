// Invoice Management API Functions
import { apiClient, normalizeApiError } from './client'
import {
  Invoice,
  InvoiceDetail,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceResponse,
  InvoicesListResponse,
  InvoicesSearchResponse,
  InvoiceDeleteResponse,
  PostInvoiceRequest,
  PostInvoiceResponse,
  GenerateInvoiceNumberRequest,
  GenerateInvoiceNumberResponse,
} from './types/invoices'
import { ENDPOINTS } from './endpoints'

/**
 * Get all invoices with optional filters
 */
export async function getInvoices(filters?: {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
}): Promise<Invoice[]> {
  try {
    let url = ENDPOINTS.INVOICES.LIST
    const params = new URLSearchParams()

    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_id) params.append('client_id', filters.client_id.toString())
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<InvoicesListResponse>(url)
    return response.data || []
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error('Error fetching invoices:', normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Get invoice detail by ID
 */
export async function getInvoiceById(id: number): Promise<InvoiceDetail> {
  try {
    const response = await apiClient.get<InvoiceResponse>(`${ENDPOINTS.INVOICES.LIST}/${id}`)
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(`Error fetching invoice ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Search invoices by number, client, or amount
 */
export async function searchInvoices(query: string): Promise<Invoice[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await apiClient.get<InvoicesSearchResponse>(
      `${ENDPOINTS.INVOICES.LIST}/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error('Error searching invoices:', normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Create new invoice
 */
export async function createInvoice(data: CreateInvoiceRequest): Promise<InvoiceDetail> {
  try {
    const response = await apiClient.post<InvoiceResponse>(ENDPOINTS.INVOICES.LIST, data)
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error('Error creating invoice:', normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Update existing invoice
 */
export async function updateInvoice(id: number, data: UpdateInvoiceRequest): Promise<InvoiceDetail> {
  try {
    const response = await apiClient.put<InvoiceResponse>(`${ENDPOINTS.INVOICES.LIST}/${id}`, data)
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(`Error updating invoice ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Delete invoice (only for draft status)
 */
export async function deleteInvoice(id: number): Promise<InvoiceDeleteResponse> {
  try {
    const response = await apiClient.delete<InvoiceDeleteResponse>(`${ENDPOINTS.INVOICES.LIST}/${id}`)
    return response
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(`Error deleting invoice ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Post invoice to journal (finalize)
 */
export async function postInvoice(
  id: number,
  periodId?: number
): Promise<PostInvoiceResponse['data']> {
  try {
    const payload = { invoice_id: id, period_id: periodId }
    const response = await apiClient.post<PostInvoiceResponse>(
      `${ENDPOINTS.INVOICES.LIST}/${id}/post`,
      payload
    )
    return response.data
  } catch (error) {
    // 423 Locked = Period is locked, user cannot post
    if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 423) {
      throw new Error('Periode terkunci - tidak dapat posting invoice')
    }
    const normalizedError = normalizeApiError(error)
    console.error(`Error posting invoice ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Generate next invoice number
 */
export async function generateInvoiceNumber(prefix?: string): Promise<string> {
  try {
    const response = await apiClient.post<GenerateInvoiceNumberResponse>(
      `${ENDPOINTS.INVOICES.LIST}/generate-number`,
      { prefix }
    )
    return response.data.next_number
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error('Error generating invoice number:', normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Cancel invoice
 */
export async function cancelInvoice(id: number, reason?: string): Promise<InvoiceDetail> {
  try {
    const response = await apiClient.post<InvoiceResponse>(
      `${ENDPOINTS.INVOICES.LIST}/${id}/cancel`,
      { reason }
    )
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(`Error cancelling invoice ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

/**
 * Get invoice summary for period
 */
export async function getInvoiceSummary(fromDate: string, toDate: string): Promise<{
  total_invoices: number
  total_amount: number
  total_paid: number
  total_outstanding: number
  by_status: Record<string, number>
}> {
  try {
    const response = await apiClient.get<{
      success: boolean
      data: {
        total_invoices: number
        total_amount: number
        total_paid: number
        total_outstanding: number
        by_status: Record<string, number>
      }
    }>(`${ENDPOINTS.INVOICES.LIST}/summary?from_date=${fromDate}&to_date=${toDate}`)
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error('Error fetching invoice summary:', normalizedError.message, error)
    throw normalizedError
  }
}
