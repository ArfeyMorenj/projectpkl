import { apiClient, normalizeApiError } from './client'
import {
  DebitCreditNote,
  DebitCreditNoteDetail,
  CreateDebitCreditNoteRequest,
  UpdateDebitCreditNoteRequest,
  DebitCreditNotesListResponse,
  DebitCreditNoteDetailResponse,
  DebitCreditNoteMutationResponse,
  DebitCreditNoteSummaryResponse,
} from './types/debit-credit-notes'

export async function getDebitCreditNotes(filters?: {
  page?: number
  per_page?: number
  date_from?: string
  date_to?: string
  number?: string
  client_name?: string
}): Promise<DebitCreditNotesListResponse['data']> {
  try {
    let url = '/debit-credit-notes'
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.number) params.append('number', filters.number)
    if (filters?.client_name) params.append('client_name', filters.client_name)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<DebitCreditNotesListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error fetching debit/credit notes:', error)
    throw error
  }
}

export async function getDebitCreditNoteById(id: number): Promise<DebitCreditNoteDetail> {
  try {
    const response = await apiClient.get<DebitCreditNoteDetailResponse>(
      `/debit-credit-notes/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Error fetching debit/credit note ${id}:`, error)
    throw error
  }
}

export async function searchDebitCreditNotes(filters?: {
  q?: string
  date_from?: string
  date_to?: string
  number?: string
  client_name?: string
}): Promise<DebitCreditNotesListResponse['data']> {
  try {
    let url = '/debit-credit-notes/search'
    const params = new URLSearchParams()

    if (filters?.q) params.append('q', filters.q)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.number) params.append('number', filters.number)
    if (filters?.client_name) params.append('client_name', filters.client_name)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<DebitCreditNotesListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error searching debit/credit notes:', error)
    throw error
  }
}

export async function createDebitCreditNote(
  data: CreateDebitCreditNoteRequest
): Promise<DebitCreditNoteDetail> {
  try {
    const response = await apiClient.post<DebitCreditNoteMutationResponse>(
      '/debit-credit-notes',
      data
    )
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error('Error creating debit/credit note:', normalizedError.message, error)
    throw normalizedError
  }
}

export async function updateDebitCreditNote(
  id: number,
  data: UpdateDebitCreditNoteRequest
): Promise<DebitCreditNoteDetail> {
  try {
    const response = await apiClient.put<DebitCreditNoteMutationResponse>(
      `/debit-credit-notes/${id}`,
      data
    )
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(`Error updating debit/credit note ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

export async function deleteDebitCreditNote(id: number): Promise<void> {
  try {
    await apiClient.delete(`/debit-credit-notes/${id}`)
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(`Error deleting debit/credit note ${id}:`, normalizedError.message, error)
    throw normalizedError
  }
}

export async function getDebitCreditNoteSummary(
  id: number
): Promise<DebitCreditNoteSummaryResponse['data']> {
  try {
    const response = await apiClient.get<DebitCreditNoteSummaryResponse>(
      `/debit-credit-notes/${id}/summary-journal`
    )
    return response.data
  } catch (error) {
    const normalizedError = normalizeApiError(error)
    console.error(
      `Error fetching debit/credit note summary for ${id}:`,
      normalizedError.message,
      error
    )
    throw normalizedError
  }
}
