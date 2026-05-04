// Bank API Functions
// Handles all HTTP requests for bank operations

import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  Bank,
  CreateBankRequest,
  UpdateBankRequest,
  BankResponse,
  BanksListResponse,
  BanksSearchResponse,
  BankDeleteResponse,
} from './types/banks'

/**
 * Get all banks
 * GET /api/banks
 */
export async function getBanks(): Promise<Bank[]> {
  const response = await apiClient.get<BanksListResponse>(ENDPOINTS.BANKS.LIST)
  return response.data || []
}

/**
 * Get single bank by ID
 * GET /api/banks/:id
 */
export async function getBankById(id: string | number): Promise<Bank> {
  const response = await apiClient.get<BankResponse>(ENDPOINTS.BANKS.GET(id))
  return response.data
}

/**
 * Search banks by query
 * GET /api/banks/search?q=keyword
 * Minimum 2 characters required
 */
export async function searchBanks(query: string): Promise<Bank[]> {
  if (!query || query.length < 2) {
    return []
  }
  const response = await apiClient.get<BanksSearchResponse>(
    `${ENDPOINTS.BANKS.SEARCH}?q=${encodeURIComponent(query)}`
  )
  return response.data || []
}

/**
 * Create new bank
 * POST /api/banks
 * Requires: super_admin or finance_admin role
 */
export async function createBank(data: CreateBankRequest): Promise<Bank> {
  const response = await apiClient.post<BankResponse>(ENDPOINTS.BANKS.CREATE, data)
  return response.data
}

/**
 * Update existing bank
 * PUT /api/banks/:id
 * Requires: super_admin or finance_admin role
 */
export async function updateBank(
  id: string | number,
  data: UpdateBankRequest
): Promise<Bank> {
  const response = await apiClient.put<BankResponse>(ENDPOINTS.BANKS.UPDATE(id), data)
  return response.data
}

/**
 * Delete bank
 * DELETE /api/banks/:id
 * Requires: super_admin or finance_admin role
 * Returns: confirmation message
 */
export async function deleteBank(id: string | number): Promise<void> {
  await apiClient.delete<BankDeleteResponse>(ENDPOINTS.BANKS.DELETE(id))
}
