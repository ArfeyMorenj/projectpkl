// Item Management Types
// Based on GET/POST /api/items response from Postman collection

export interface Item {
  id: number
  code: string
  name: string
  acc_omzet: string
  acc_piutang: string
  cdf_omzet: string
  cdf_piutang: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  acc_omzet_name?: string | null
  acc_piutang_name?: string | null
  cdf_omzet_name?: string | null
  cdf_piutang_name?: string | null
}

export interface CreateItemRequest {
  code: string
  name: string
  acc_omzet: string
  acc_piutang: string
  cdf_omzet: string
  cdf_piutang: string
  is_active?: boolean
}

export interface UpdateItemRequest extends CreateItemRequest {}

// Response types
export interface ItemResponse {
  success: boolean
  data: Item
  message?: string
}

export interface ItemsListResponse {
  success: boolean
  data: Item[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface ItemsSearchResponse {
  success: boolean
  data: Item[]
  message?: string
}

export interface ItemDeleteResponse {
  success: boolean
  message: string
}
