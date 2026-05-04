import { apiClient } from './client'
import {
  Installation,
  CreateInstallationRequest,
  UpdateInstallationRequest,
  InstallationsListResponse,
  InstallationDetailResponse,
  InstallationMutationResponse,
} from './types/installations'

export async function getInstallations(filters?: {
  page?: number
  per_page?: number
}): Promise<Installation[]> {
  try {
    let url = '/installations'
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<InstallationsListResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error fetching installations:', error)
    throw error
  }
}

export async function getInstallationById(id: number): Promise<Installation> {
  try {
    const response = await apiClient.get<InstallationDetailResponse>(`/installations/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching installation ${id}:`, error)
    throw error
  }
}

export async function createInstallation(
  data: CreateInstallationRequest
): Promise<Installation> {
  try {
    const response = await apiClient.post<InstallationMutationResponse>(
      '/installations',
      data
    )
    return response.data
  } catch (error) {
    console.error('Error creating installation:', error)
    throw error
  }
}

export async function updateInstallation(
  id: number,
  data: UpdateInstallationRequest
): Promise<Installation> {
  try {
    const response = await apiClient.put<InstallationMutationResponse>(
      `/installations/${id}`,
      data
    )
    return response.data
  } catch (error) {
    console.error(`Error updating installation ${id}:`, error)
    throw error
  }
}

export async function deleteInstallation(id: number): Promise<void> {
  try {
    await apiClient.delete(`/installations/${id}`)
  } catch (error) {
    console.error(`Error deleting installation ${id}:`, error)
    throw error
  }
}
