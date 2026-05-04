// Protection API Functions

import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  Protection,
  CreateProtectionRequest,
  UpdateProtectionRequest,
  ProtectionResponse,
  ProtectionsListResponse,
  ProtectionDeleteResponse,
} from './types/protections'

/**
 * Get all protections
 * GET /api/protections
 */
export async function getProtections(): Promise<Protection[]> {
  const response = await apiClient.get<ProtectionsListResponse>(ENDPOINTS.PROTECTIONS.LIST)
  return response.data || []
}

/**
 * Get single protection by ID
 * GET /api/protections/:id
 */
export async function getProtectionById(id: string | number): Promise<Protection> {
  const response = await apiClient.get<ProtectionResponse>(ENDPOINTS.PROTECTIONS.GET(id))
  return response.data
}

/**
 * Create protection
 * POST /api/protections
 */
export async function createProtection(data: CreateProtectionRequest): Promise<Protection> {
  const response = await apiClient.post<ProtectionResponse>(ENDPOINTS.PROTECTIONS.CREATE, data)
  return response.data
}

/**
 * Update protection
 * PUT /api/protections/:id
 */
export async function updateProtection(
  id: string | number,
  data: UpdateProtectionRequest
): Promise<Protection> {
  const response = await apiClient.put<ProtectionResponse>(ENDPOINTS.PROTECTIONS.UPDATE(id), data)
  return response.data
}

/**
 * Delete protection
 * DELETE /api/protections/:id
 */
export async function deleteProtection(id: string | number): Promise<void> {
  await apiClient.delete<ProtectionDeleteResponse>(ENDPOINTS.PROTECTIONS.DELETE(id))
}
