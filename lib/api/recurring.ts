import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { GenerateRecurringInvoicesRequest, GenerateRecurringInvoicesResponse } from './types/recurring'

export async function generateRecurringInvoices(
  data?: GenerateRecurringInvoicesRequest
): Promise<GenerateRecurringInvoicesResponse> {
  try {
    const response = await apiClient.post<GenerateRecurringInvoicesResponse>(
      ENDPOINTS.RECURRING.GENERATE_INVOICES,
      data ?? {}
    )
    return response
  } catch (error) {
    console.error('Error generating recurring invoices:', error)
    throw error
  }
}
