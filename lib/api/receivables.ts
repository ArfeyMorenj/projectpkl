// Receivables Management API Functions
import { apiClient } from './client'
import {
  Receivable,
  ReceivableDetail,
  ReceivablesListResponse,
  ReceivablesSearchResponse,
} from './types/receivables'
import { ENDPOINTS } from './endpoints'

/**
 * Get all receivables
 */
export async function getReceivables(filters?: {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
}): Promise<Receivable[]> {
  try {
    let url = ENDPOINTS.RECEIVABLES.LIST
    const params = new URLSearchParams()

    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_id) params.append('client_id', filters.client_id.toString())
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<ReceivablesListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error fetching receivables:', error)
    throw error
  }
}

/**
 * Get receivable detail by ID
 */
export async function getReceivableById(id: number): Promise<ReceivableDetail> {
  try {
    const response = await apiClient.get<{ success: boolean; data: ReceivableDetail }>(
      `${ENDPOINTS.RECEIVABLES.LIST}/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Error fetching receivable ${id}:`, error)
    throw error
  }
}

/**
 * Search receivables by keyword (client name, invoice number)
 */
export async function searchReceivables(query: string): Promise<Receivable[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await apiClient.get<ReceivablesSearchResponse>(
      `${ENDPOINTS.RECEIVABLES.LIST}/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error searching receivables:', error)
    throw error
  }
}

/**
 * Get receivables summary (totals, aging)
 */
export async function getReceivablesSummary(period?: string): Promise<{
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
  }> {
  try {
    const query = period ? `?period=${encodeURIComponent(period)}` : ''
    const response = await apiClient.get<unknown>(`${ENDPOINTS.REPORTS.RECEIVABLE_SUMMARY}${query}`)
    const payload = response as {
      data?: unknown
      summary?: unknown
      report?: unknown
      totals?: unknown
    }

    const summarySource =
      (payload && typeof payload === 'object' && (payload.summary ?? payload.data ?? payload.totals ?? payload.report)) || {}

    const summary = summarySource && typeof summarySource === 'object' ? (summarySource as Record<string, unknown>) : {}

    return {
      total_amount: Number(summary.total_amount ?? summary.saldo_akhir ?? summary.total_piutang ?? 0),
      total_paid: Number(summary.total_paid ?? summary.pembayaran ?? summary.total_bayar ?? 0),
      total_outstanding: Number(summary.total_outstanding ?? summary.sisa_piutang ?? summary.saldo_akhir ?? 0),
      count_outstanding: Number(summary.count_outstanding ?? summary.outstanding_count ?? 0),
      count_partial: Number(summary.count_partial ?? summary.partial_count ?? 0),
      count_paid: Number(summary.count_paid ?? summary.paid_count ?? 0),
      days_30: Number(summary.days_30 ?? summary['0_30'] ?? summary['0-30'] ?? 0),
      days_60: Number(summary.days_60 ?? summary['31_60'] ?? summary['31-60'] ?? 0),
      days_90: Number(summary.days_90 ?? summary['61_90'] ?? summary['61-90'] ?? 0),
      days_over_90: Number(summary.days_over_90 ?? summary['90_plus'] ?? summary['90+'] ?? 0),
    }
  } catch (error) {
    console.error('Error fetching receivables summary:', error)
    throw error
  }
}

/**
 * Get receivables by client
 */
export async function getReceivablesByClient(clientId: number): Promise<Receivable[]> {
  try {
    const response = await apiClient.get<ReceivablesListResponse>(
      `${ENDPOINTS.RECEIVABLES.LIST}?client_id=${clientId}`
    )
    return response.data || []
  } catch (error) {
    console.error(`Error fetching receivables for client ${clientId}:`, error)
    throw error
  }
}

/**
 * Get outstanding receivables (aging report)
 */
export async function getOutstandingReceivables(): Promise<Receivable[]> {
  try {
    const response = await apiClient.get<ReceivablesListResponse>(
      `${ENDPOINTS.RECEIVABLES.LIST}?status=outstanding`
    )
    return response.data || []
  } catch (error) {
    console.error('Error fetching outstanding receivables:', error)
    throw error
  }
}
