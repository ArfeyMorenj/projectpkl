// Item Management API Functions
import { apiClient } from './client'
import {
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  ItemResponse,
  ItemsListResponse,
  ItemsSearchResponse,
  ItemDeleteResponse,
} from './types/items'
import { ENDPOINTS } from './endpoints'

/**
 * Get all items
 */
export async function getItems(): Promise<Item[]> {
  try {
    const response = await apiClient.get<ItemsListResponse>(ENDPOINTS.ITEMS.LIST)
    return response.data || []
  } catch (error) {
    console.error('Error fetching items:', error)
    throw error
  }
}

/**
 * Get item detail by ID
 */
export async function getItemById(id: number): Promise<Item> {
  try {
    const response = await apiClient.get<ItemResponse>(`${ENDPOINTS.ITEMS.LIST}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error)
    throw error
  }
}

/**
 * Search items by keyword
 */
export async function searchItems(query: string): Promise<Item[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await apiClient.get<ItemsSearchResponse>(
      `${ENDPOINTS.ITEMS.LIST}/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error searching items:', error)
    throw error
  }
}

/**
 * Create new item
 */
export async function createItem(data: CreateItemRequest): Promise<Item> {
  try {
    const response = await apiClient.post<ItemResponse>(ENDPOINTS.ITEMS.LIST, data)
    return response.data
  } catch (error) {
    console.error('Error creating item:', error)
    throw error
  }
}

/**
 * Update existing item
 */
export async function updateItem(id: number, data: UpdateItemRequest): Promise<Item> {
  try {
    const response = await apiClient.put<ItemResponse>(`${ENDPOINTS.ITEMS.LIST}/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating item ${id}:`, error)
    throw error
  }
}

/**
 * Delete item
 */
export async function deleteItem(id: number): Promise<ItemDeleteResponse> {
  try {
    const response = await apiClient.delete<ItemDeleteResponse>(`${ENDPOINTS.ITEMS.LIST}/${id}`)
    return response
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error)
    throw error
  }
}
