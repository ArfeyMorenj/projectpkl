// Setup API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  CompanySettings,
  CompanySettingsResponse,
  CreateTaxSeriesRequest,
  TaxSeries,
  TaxSeriesDeleteResponse,
  TaxSeriesListResponse,
  TaxSeriesResponse,
  UpdateTaxSeriesRequest,
} from './types/setup'

export async function getCompanySettings(): Promise<CompanySettings> {
  const response = await apiClient.get<CompanySettingsResponse>(ENDPOINTS.SETUP.COMPANY_SETTINGS)
  return response.data
}

export async function updateCompanySettings(data: CompanySettings): Promise<CompanySettings> {
  const response = await apiClient.post<CompanySettingsResponse>(ENDPOINTS.SETUP.COMPANY_SETTINGS, data)
  return response.data
}

export async function getTaxSeries(): Promise<TaxSeries[]> {
  const response = await apiClient.get<TaxSeriesListResponse>(ENDPOINTS.SETUP.TAX_SERIES)
  return response.data || []
}

export async function createTaxSeries(data: CreateTaxSeriesRequest): Promise<TaxSeries> {
  const response = await apiClient.post<TaxSeriesResponse>(ENDPOINTS.SETUP.TAX_SERIES, data)
  return response.data
}

export async function updateTaxSeries(id: number | string, data: UpdateTaxSeriesRequest): Promise<TaxSeries> {
  const response = await apiClient.put<TaxSeriesResponse>(ENDPOINTS.SETUP.TAX_SERIES_NEXT(id), data)
  return response.data
}

export async function nextTaxSeriesNumber(id: number | string): Promise<TaxSeries> {
  const response = await apiClient.post<TaxSeriesResponse>(ENDPOINTS.SETUP.TAX_SERIES_NEXT(id))
  return response.data
}

export async function deleteTaxSeries(id: number | string): Promise<TaxSeriesDeleteResponse> {
  return apiClient.delete<TaxSeriesDeleteResponse>(`${ENDPOINTS.SETUP.TAX_SERIES}/${id}`)
}

