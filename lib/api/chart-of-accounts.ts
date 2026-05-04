// Chart of Accounts API Functions
import { apiClient } from './client'
import type { ArrayResponse, ChartOfAccount, DataResponse } from './types/master-data'
import { ENDPOINTS } from './endpoints'

export async function getChartOfAccounts(): Promise<ChartOfAccount[]> {
  const response = await apiClient.get<ArrayResponse<ChartOfAccount>>(ENDPOINTS.LOOKUPS.COA)
  return response.data || []
}

export async function getChartOfAccountById(id: string | number): Promise<ChartOfAccount> {
  const response = await apiClient.get<DataResponse<ChartOfAccount>>(ENDPOINTS.LOOKUPS.COA + `/${id}`)
  return response.data
}

export async function searchChartOfAccounts(query: string): Promise<ChartOfAccount[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const response = await apiClient.get<ArrayResponse<ChartOfAccount>>(
    `${ENDPOINTS.LOOKUPS.CHART_OF_ACCOUNTS}?q=${encodeURIComponent(query.trim())}`
  )
  return response.data || []
}
