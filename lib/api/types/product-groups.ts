// Product Group Management Types

export interface ProductGroup {
  id: number
  code: string
  name: string
  acc_omzet: string | number | null
  cdf_piutang: string | number | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  acc_omzet_name?: string | null
  cdf_piutang_name?: string | null
}

export interface CreateProductGroupRequest {
  code: string
  name: string
  acc_omzet: string
  cdf_piutang: string
  is_active?: boolean
}

export interface UpdateProductGroupRequest extends CreateProductGroupRequest {}

export interface ProductGroupResponse {
  success: boolean
  data: ProductGroup
  message?: string
}

export interface ProductGroupsListResponse {
  success: boolean
  data: ProductGroup[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface ProductGroupsSearchResponse {
  success: boolean
  data: ProductGroup[]
  message?: string
}

export interface ProductGroupDeleteResponse {
  success: boolean
  message: string
}
