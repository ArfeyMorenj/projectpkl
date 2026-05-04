// Client Management Types
// Based on GET /api/clients response from Postman collection

export interface Client {
  id: number
  code: string
  status: string // 'NON GROUP' | 'GROUP' | etc
  name: string
  address: string | null
  city: string | null
  phone: string | null
  fax: string | null
  npwp: string | null
  npkp: string | null
  tax_name: string | null
  tax_address: string | null
  credit_term_days: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateClientRequest {
  code: string
  status: string
  name: string
  address?: string
  city?: string
  phone?: string
  fax?: string
  npwp?: string
  npkp?: string
  tax_name?: string
  tax_address?: string
  credit_term_days?: number
  is_active?: boolean
}

export interface UpdateClientRequest extends CreateClientRequest {}

// Response types
export interface ClientResponse {
  success: boolean
  data: Client
  message?: string
}

export interface ClientsListResponse {
  success: boolean
  data: Client[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface ClientsSearchResponse {
  success: boolean
  data: Client[]
  message?: string
}

export interface ClientDeleteResponse {
  success: boolean
  message: string
}
