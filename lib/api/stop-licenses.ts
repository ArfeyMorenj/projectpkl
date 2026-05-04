import { apiClient } from './client'
import {
  StopLicense,
  CreateStopLicenseRequest,
  UpdateStopLicenseRequest,
  StopLicensesListResponse,
  StopLicenseDetailResponse,
  StopLicenseSearchResponse,
  StopLicenseMutationResponse,
} from './types/stop-licenses'

export async function getStopLicenses(filters?: {
  page?: number
  per_page?: number
}): Promise<StopLicense[]> {
  try {
    let url = '/stop-licenses'
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<StopLicensesListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error fetching stop licenses:', error)
    throw error
  }
}

export async function getStopLicenseById(id: number): Promise<StopLicense> {
  try {
    const response = await apiClient.get<StopLicenseDetailResponse>(`/stop-licenses/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching stop license ${id}:`, error)
    throw error
  }
}

export async function searchStopLicenses(query: string): Promise<StopLicense[]> {
  try {
    if (!query || query.length < 2) {
      return []
    }

    let url = '/stop-licenses/search'
    const params = new URLSearchParams()
    params.append('q', query)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<StopLicenseSearchResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error searching stop licenses:', error)
    throw error
  }
}

export async function createStopLicense(
  data: CreateStopLicenseRequest
): Promise<StopLicense> {
  try {
    const response = await apiClient.post<StopLicenseMutationResponse>(
      '/stop-licenses',
      data
    )
    return response.data
  } catch (error) {
    console.error('Error creating stop license:', error)
    throw error
  }
}

export async function updateStopLicense(
  id: number,
  data: UpdateStopLicenseRequest
): Promise<StopLicense> {
  try {
    const response = await apiClient.put<StopLicenseMutationResponse>(
      `/stop-licenses/${id}`,
      data
    )
    return response.data
  } catch (error) {
    console.error(`Error updating stop license ${id}:`, error)
    throw error
  }
}

export async function deleteStopLicense(id: number): Promise<void> {
  try {
    await apiClient.delete(`/stop-licenses/${id}`)
  } catch (error) {
    console.error(`Error deleting stop license ${id}:`, error)
    throw error
  }
}
