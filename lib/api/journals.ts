import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type { Journal, JournalPage, JournalsListResponse } from './types/journals'

export interface JournalFilters {
  page?: number
  per_page?: number
}

export async function getJournals(filters?: JournalFilters): Promise<JournalPage> {
  try {
    let url = ENDPOINTS.JOURNALS.LIST
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.per_page) params.append('per_page', String(filters.per_page))

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<JournalsListResponse>(url)
    return response.data
  } catch (error) {
    console.error('Error fetching journals:', error)
    throw error
  }
}
