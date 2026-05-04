// Product Management API Functions
import { apiClient } from './client'
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductsListResponse,
  ProductsSearchResponse,
  ProductDeleteResponse,
} from './types/products'
import { ENDPOINTS } from './endpoints'

/**
 * Get all products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await apiClient.get<ProductsListResponse>(ENDPOINTS.PRODUCTS.LIST)
    return response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

/**
 * Get product detail by ID
 */
export async function getProductById(id: number): Promise<Product> {
  try {
    const response = await apiClient.get<ProductResponse>(`${ENDPOINTS.PRODUCTS.LIST}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}

/**
 * Search products by keyword
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await apiClient.get<ProductsSearchResponse>(
      `${ENDPOINTS.PRODUCTS.LIST}/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error searching products:', error)
    throw error
  }
}

/**
 * Create new product
 */
export async function createProduct(data: CreateProductRequest): Promise<Product> {
  try {
    const response = await apiClient.post<ProductResponse>(ENDPOINTS.PRODUCTS.LIST, data)
    return response.data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * Update existing product
 */
export async function updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
  try {
    const response = await apiClient.put<ProductResponse>(`${ENDPOINTS.PRODUCTS.LIST}/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: number): Promise<ProductDeleteResponse> {
  try {
    const response = await apiClient.delete<ProductDeleteResponse>(`${ENDPOINTS.PRODUCTS.LIST}/${id}`)
    return response
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}
