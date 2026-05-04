// Master Item Product Types

export interface MasterItemProduct {
  id: number
  code: string
  name: string
  unit: string
  price: string | number
  acc_omzet: string
  acc_omzet_name?: string | null
  acc_omzet_np?: string | null
  acc_omzet_np_name?: string | null
  acc_piutang: string
  acc_piutang_name?: string | null
  cdf_omzet?: string | null
  cdf_omzet_name?: string | null
  cdf_piutang: string
  cdf_piutang_name?: string | null
  is_active: boolean | number | string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateMasterItemProductRequest {
  code: string
  name: string
  unit: string
  price: number | string
  acc_omzet: string
  acc_omzet_np?: string
  acc_piutang: string
  cdf_piutang: string
  is_active?: boolean | number | string
}

export interface UpdateMasterItemProductRequest extends CreateMasterItemProductRequest {}

export interface MasterItemProductResponse {
  success: boolean
  data: MasterItemProduct
  message?: string
}

export interface MasterItemProductsListResponse {
  success: boolean
  data: MasterItemProduct[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface MasterItemProductsSearchResponse {
  success: boolean
  data: MasterItemProduct[]
  message?: string
}

export interface MasterItemProductDeleteResponse {
  success: boolean
  message: string
}
