// Invoice Items API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  CreateInvoiceItemRequest,
  InvoiceItemDeleteResponse,
  InvoiceItemRecord,
  InvoiceItemResponse,
  InvoiceItemsListResponse,
  UpdateInvoiceItemRequest,
} from './types/invoice-items'

export async function getInvoiceItems(): Promise<InvoiceItemRecord[]> {
  try {
    const response = await apiClient.get<InvoiceItemsListResponse>(ENDPOINTS.INVOICE_ITEMS.LIST)
    return response.data || []
  } catch (error) {
    console.error('Error fetching invoice items:', error)
    throw error
  }
}

export async function createInvoiceItem(data: CreateInvoiceItemRequest): Promise<InvoiceItemRecord> {
  try {
    const response = await apiClient.post<InvoiceItemResponse>(ENDPOINTS.INVOICE_ITEMS.CREATE, data)
    return response.data
  } catch (error) {
    console.error('Error creating invoice item:', error)
    throw error
  }
}

export async function updateInvoiceItem(
  id: number,
  data: UpdateInvoiceItemRequest
): Promise<InvoiceItemRecord> {
  try {
    const response = await apiClient.put<InvoiceItemResponse>(ENDPOINTS.INVOICE_ITEMS.UPDATE(id), data)
    return response.data
  } catch (error) {
    console.error(`Error updating invoice item ${id}:`, error)
    throw error
  }
}

export async function deleteInvoiceItem(id: number): Promise<InvoiceItemDeleteResponse> {
  try {
    const response = await apiClient.delete<InvoiceItemDeleteResponse>(ENDPOINTS.INVOICE_ITEMS.DELETE(id))
    return response
  } catch (error) {
    console.error(`Error deleting invoice item ${id}:`, error)
    throw error
  }
}
