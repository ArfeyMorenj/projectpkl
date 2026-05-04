import { apiClient } from './client'
import {
  License,
  CreateLicenseRequest,
  UpdateLicenseRequest,
  LicensesListResponse,
  LicenseDetailResponse,
  LicenseMutationResponse,
} from './types/licenses'

export async function getLicenses(filters?: {
  page?: number
  per_page?: number
}): Promise<License[]> {
  try {
    let url = '/licenses'
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<LicensesListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error fetching licenses:', error)
    throw error
  }
}

export async function getLicenseById(id: number): Promise<License> {
  try {
    const response = await apiClient.get<LicenseDetailResponse>(`/licenses/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching license ${id}:`, error)
    throw error
  }
}

export async function createLicense(data: CreateLicenseRequest): Promise<License> {
  try {
    const response = await apiClient.post<LicenseMutationResponse>('/licenses', data)
    return response.data
  } catch (error) {
    console.error('Error creating license:', error)
    throw error
  }
}

export async function updateLicense(
  id: number,
  data: UpdateLicenseRequest
): Promise<License> {
  try {
    const response = await apiClient.put<LicenseMutationResponse>(
      `/licenses/${id}`,
      data
    )
    return response.data
  } catch (error) {
    console.error(`Error updating license ${id}:`, error)
    throw error
  }
}

export async function deleteLicense(id: number): Promise<void> {
  try {
    await apiClient.delete(`/licenses/${id}`)
  } catch (error) {
    console.error(`Error deleting license ${id}:`, error)
    throw error
  }
}
