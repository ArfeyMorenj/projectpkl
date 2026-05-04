// License Types

export interface License {
  id: number
  license_number: string
  client_id: number
  work_order_id: number
  license_date: string
  due_date: string
  subtotal: number | string
  discount: number | string
  tax: number | string
  total: number | string
  status: string
  notes?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  client?: {
    id?: number
    code?: string
    name?: string
  }
  work_order?: {
    id?: number
    number?: string
    date?: string
  }
}

export interface CreateLicenseRequest {
  license_number: string
  client_id: number
  work_order_id: number
  license_date: string
  due_date: string
  subtotal: number
  discount: number
  tax: number
  total: number
  status: string
  notes?: string
}

export interface UpdateLicenseRequest extends Partial<CreateLicenseRequest> {}

export interface LicenseResponse extends License {}

export interface LicensesListResponse {
  success?: boolean
  data: License[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  pageInfo?: {
    currentPage: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface LicenseDetailResponse {
  success?: boolean
  data: License
}

export interface LicenseMutationResponse {
  success: boolean
  message?: string
  data: License
}
