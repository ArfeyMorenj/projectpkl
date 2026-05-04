// Client Management API Functions
import { apiClient } from './client'
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientResponse,
  ClientsListResponse,
  ClientsSearchResponse,
  ClientDeleteResponse,
} from './types/clients'
import { ENDPOINTS } from './endpoints'

/**
 * Get all clients
 */
export async function getClients(): Promise<Client[]> {
  try {
    const response = await apiClient.get<ClientsListResponse>(ENDPOINTS.CLIENTS.LIST)
    return response.data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

/**
 * Get client detail by ID
 */
export async function getClientById(id: number): Promise<Client> {
  try {
    const response = await apiClient.get<ClientResponse>(`${ENDPOINTS.CLIENTS.LIST}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error)
    throw error
  }
}

/**
 * Search clients by keyword (name or code)
 */
export async function searchClients(query: string): Promise<Client[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await apiClient.get<ClientsSearchResponse>(
      `${ENDPOINTS.CLIENTS.LIST}/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error searching clients:', error)
    throw error
  }
}

/**
 * Create new client
 */
export async function createClient(data: CreateClientRequest): Promise<Client> {
  try {
    const response = await apiClient.post<ClientResponse>(ENDPOINTS.CLIENTS.LIST, data)
    return response.data
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

/**
 * Update existing client
 */
export async function updateClient(id: number, data: UpdateClientRequest): Promise<Client> {
  try {
    const response = await apiClient.put<ClientResponse>(`${ENDPOINTS.CLIENTS.LIST}/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating client ${id}:`, error)
    throw error
  }
}

/**
 * Delete client
 */
export async function deleteClient(id: number): Promise<ClientDeleteResponse> {
  try {
    const response = await apiClient.delete<ClientDeleteResponse>(`${ENDPOINTS.CLIENTS.LIST}/${id}`)
    return response
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error)
    throw error
  }
}
