// Stop License Types

export interface StopLicense {
  id: number
  number: string
  date: string
  stop_date: string
  work_order_id: number
  client_id?: number
  product_id?: number
  client_spv_id?: number
  client_spv_code?: string
  notes?: string | null
  is_stopped: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
  work_order?: {
    id?: number
    number?: string
    client_id?: number
    product_id?: number
  }
  client?: {
    id?: number
    code?: string
    name?: string
  }
  product?: {
    id?: number
    code?: string
    name?: string
  }
  client_spv?: {
    id: number
    code: string
    name: string
    position: string
    status: string
    is_active: boolean
  }
}

export interface CreateStopLicenseRequest {
  number: string
  date: string
  stop_date: string
  work_order_id: number
  client_spv_code: string
  notes?: string
  is_stopped: boolean
}

export interface UpdateStopLicenseRequest extends Partial<CreateStopLicenseRequest> {}

export interface StopLicenseResponse extends StopLicense {}

export interface StopLicensesListResponse {
  success: boolean
  message?: string
  data: StopLicense[]
  pageInfo?: {
    currentPage: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface StopLicenseDetailResponse {
  success: boolean
  message?: string
  data: StopLicense
}

export interface StopLicenseSearchResponse {
  success: boolean
  message?: string
  data: StopLicense[]
}

export interface StopLicenseMutationResponse {
  success: boolean
  message?: string
  data: StopLicense
}
