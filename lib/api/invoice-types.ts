// Invoice Type Management API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  CreateInvoiceTypeRequest,
  InvoiceType,
  InvoiceTypeDeleteResponse,
  InvoiceTypeResponse,
  InvoiceTypesListResponse,
  InvoiceTypesSearchResponse,
  UpdateInvoiceTypeRequest,
} from './types/invoice-types'

export async function getInvoiceTypes(): Promise<InvoiceType[]> {
  const response = await apiClient.get<InvoiceTypesListResponse>(ENDPOINTS.INVOICE_TYPES.LIST)
  return response.data || []
}

export async function getInvoiceTypeById(id: number): Promise<InvoiceType> {
  const response = await apiClient.get<InvoiceTypeResponse>(ENDPOINTS.INVOICE_TYPES.GET(id))
  return response.data
}

export async function searchInvoiceTypes(query: string): Promise<InvoiceType[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await apiClient.get<InvoiceTypesSearchResponse>(
    `${ENDPOINTS.INVOICE_TYPES.SEARCH}?q=${encodeURIComponent(query)}`
  )
  return response.data || []
}

export async function createInvoiceType(data: CreateInvoiceTypeRequest): Promise<InvoiceType> {
  const response = await apiClient.post<InvoiceTypeResponse>(ENDPOINTS.INVOICE_TYPES.CREATE, data)
  return response.data
}

export async function updateInvoiceType(
  id: number,
  data: UpdateInvoiceTypeRequest
): Promise<InvoiceType> {
  const response = await apiClient.put<InvoiceTypeResponse>(ENDPOINTS.INVOICE_TYPES.UPDATE(id), data)
  return response.data
}

export async function deleteInvoiceType(id: number): Promise<InvoiceTypeDeleteResponse> {
  return apiClient.delete<InvoiceTypeDeleteResponse>(ENDPOINTS.INVOICE_TYPES.DELETE(id))
}

export async function toggleInvoiceTypeStatus(id: number): Promise<InvoiceType> {
  const response = await apiClient.post<InvoiceTypeResponse>(ENDPOINTS.INVOICE_TYPES.TOGGLE_STATUS(id))
  return response.data
}
