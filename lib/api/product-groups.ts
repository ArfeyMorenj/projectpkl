// Product Group Management API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  CreateProductGroupRequest,
  ProductGroup,
  ProductGroupDeleteResponse,
  ProductGroupResponse,
  ProductGroupsListResponse,
  ProductGroupsSearchResponse,
  UpdateProductGroupRequest,
} from './types/product-groups'

export async function getProductGroups(): Promise<ProductGroup[]> {
  const response = await apiClient.get<ProductGroupsListResponse>(ENDPOINTS.PRODUCT_GROUPS.LIST)
  return response.data || []
}

export async function getProductGroupById(id: number): Promise<ProductGroup> {
  const response = await apiClient.get<ProductGroupResponse>(ENDPOINTS.PRODUCT_GROUPS.GET(id))
  return response.data
}

export async function searchProductGroups(query: string): Promise<ProductGroup[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await apiClient.get<ProductGroupsSearchResponse>(
    `${ENDPOINTS.PRODUCT_GROUPS.SEARCH}?q=${encodeURIComponent(query)}`
  )
  return response.data || []
}

export async function createProductGroup(data: CreateProductGroupRequest): Promise<ProductGroup> {
  const response = await apiClient.post<ProductGroupResponse>(ENDPOINTS.PRODUCT_GROUPS.CREATE, data)
  return response.data
}

export async function updateProductGroup(
  id: number,
  data: UpdateProductGroupRequest
): Promise<ProductGroup> {
  const response = await apiClient.put<ProductGroupResponse>(ENDPOINTS.PRODUCT_GROUPS.UPDATE(id), data)
  return response.data
}

export async function deleteProductGroup(id: number): Promise<ProductGroupDeleteResponse> {
  return apiClient.delete<ProductGroupDeleteResponse>(ENDPOINTS.PRODUCT_GROUPS.DELETE(id))
}
