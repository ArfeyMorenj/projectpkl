import { apiClient } from './client'
import type {
  Payment,
  PaymentDetail,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentResponse,
  PaymentsListResponse,
  PaymentsSearchResponse,
  PaymentDetailResponse,
  PaymentSummary,
  PaymentSummaryResponse,
} from './types/payments'

/**
 * Fetch all payments with pagination and filters
 */
export async function getPayments(filters?: {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
  page?: number
  per_page?: number
}): Promise<Payment[]> {
  try {
    let url = '/payments'
    const params = new URLSearchParams()

    params.append('page', (filters?.page || 1).toString())
    params.append('per_page', (filters?.per_page || 10).toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_id) params.append('client_id', filters.client_id.toString())
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<PaymentsListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    throw error
  }
}

/**
 * Fetch single payment by ID
 */
export async function getPaymentById(id: number): Promise<PaymentDetail> {
  try {
    const response = await apiClient.get<PaymentDetailResponse>(`/payments/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch payment ${id}:`, error)
    throw error
  }
}

/**
 * Search payments by query
 */
export async function searchPayments(query: string): Promise<PaymentResponse[]> {
  if (!query || query.length < 2) return []

  try {
    let url = '/payments/search'
    const params = new URLSearchParams()
    params.append('q', query)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<PaymentsSearchResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Failed to search payments:', error)
    throw error
  }
}

/**
 * Create new payment
 */
export async function createPayment(data: CreatePaymentRequest): Promise<PaymentDetail> {
  try {
    const response = await apiClient.post<PaymentDetailResponse>('/payments', data)
    return response.data
  } catch (error) {
    console.error('Failed to create payment:', error)
    throw error
  }
}

/**
 * Update existing payment
 */
export async function updatePayment(
  id: number,
  data: UpdatePaymentRequest
): Promise<PaymentDetail> {
  try {
    const response = await apiClient.put<PaymentDetailResponse>(`/payments/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Failed to update payment ${id}:`, error)
    throw error
  }
}

/**
 * Delete payment (draft only)
 */
export async function deletePayment(id: number): Promise<void> {
  try {
    await apiClient.delete(`/payments/${id}`)
  } catch (error) {
    console.error(`Failed to delete payment ${id}:`, error)
    throw error
  }
}

/**
 * Post payment to journal
 */
export async function postPayment(
  id: number,
  periodId?: number
): Promise<PaymentDetail> {
  try {
    const response = await apiClient.post<PaymentDetailResponse>(`/payments/${id}/post`, {
      period_id: periodId,
    })
    return response.data
  } catch (error) {
    // Handle period lock error (423)
    if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 423) {
      throw new Error('Periode terkunci - tidak dapat posting pembayaran')
    }
    console.error(`Failed to post payment ${id}:`, error)
    throw error
  }
}

/**
 * Reverse posted payment
 */
export async function reversePayment(id: number, reason?: string): Promise<PaymentDetail> {
  try {
    const response = await apiClient.post<PaymentDetailResponse>(`/payments/${id}/reverse`, {
      reason: reason,
    })
    return response.data
  } catch (error) {
    console.error(`Failed to reverse payment ${id}:`, error)
    throw error
  }
}

/**
 * Get payment summary
 */
export async function getPaymentSummary(
  fromDate?: string,
  toDate?: string
): Promise<PaymentSummary> {
  try {
    let url = '/payments/summary'
    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    if (toDate) params.append('to_date', toDate)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<PaymentSummaryResponse>(url)
    return response.data || {
      total_payments: 0,
      posted_count: 0,
      draft_count: 0,
      total_amount: 0,
      average_amount: 0,
    }
  } catch (error) {
    console.error('Failed to fetch payment summary:', error)
    return {
      total_payments: 0,
      posted_count: 0,
      draft_count: 0,
      total_amount: 0,
      average_amount: 0,
    }
  }
}
