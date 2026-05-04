// Master Item Product API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  CreateMasterItemProductRequest,
  MasterItemProduct,
  MasterItemProductDeleteResponse,
  MasterItemProductResponse,
  MasterItemProductsListResponse,
  MasterItemProductsSearchResponse,
  UpdateMasterItemProductRequest,
} from './types/master-item-products'

export async function getMasterItemProducts(): Promise<MasterItemProduct[]> {
  const response = await apiClient.get<MasterItemProductsListResponse>(
    ENDPOINTS.MASTER_ITEM_PRODUCTS.LIST
  )
  return response.data || []
}

export async function getMasterItemProductById(id: string | number): Promise<MasterItemProduct> {
  const response = await apiClient.get<MasterItemProductResponse>(
    ENDPOINTS.MASTER_ITEM_PRODUCTS.GET(id)
  )
  return response.data
}

export async function searchMasterItemProducts(query: string): Promise<MasterItemProduct[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await apiClient.get<MasterItemProductsSearchResponse>(
    `${ENDPOINTS.MASTER_ITEM_PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`
  )
  return response.data || []
}

export async function createMasterItemProduct(
  data: CreateMasterItemProductRequest
): Promise<MasterItemProduct> {
  const response = await apiClient.post<MasterItemProductResponse>(
    ENDPOINTS.MASTER_ITEM_PRODUCTS.CREATE,
    data
  )
  return response.data
}

export async function updateMasterItemProduct(
  id: string | number,
  data: UpdateMasterItemProductRequest
): Promise<MasterItemProduct> {
  const response = await apiClient.put<MasterItemProductResponse>(
    ENDPOINTS.MASTER_ITEM_PRODUCTS.UPDATE(id),
    data
  )
  return response.data
}

export async function deleteMasterItemProduct(
  id: string | number
): Promise<MasterItemProductDeleteResponse> {
  return apiClient.delete<MasterItemProductDeleteResponse>(ENDPOINTS.MASTER_ITEM_PRODUCTS.DELETE(id))
}

export async function toggleMasterItemProductStatus(
  id: string | number
): Promise<MasterItemProduct> {
  const response = await apiClient.post<MasterItemProductResponse>(
    ENDPOINTS.MASTER_ITEM_PRODUCTS.TOGGLE_STATUS(id),
    { id: Number(id) }
  )
  return response.data
}
