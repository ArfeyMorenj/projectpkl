// Installation Types

export interface Installation {
  id: number
  work_order_id: number
  client_id: number
  install_date: string
  implementor_1?: string | null
  implementor_2?: string | null
  implementor_3?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  work_order?: {
    id: number
    number: string
    date?: string
    client_id?: number
    product_id?: number
  }
  client?: {
    id: number
    code: string
    name: string
  }
}

export interface CreateInstallationRequest {
  work_order_id: number
  client_id: number
  install_date: string
  implementor_1?: string
  implementor_2?: string
  implementor_3?: string
  notes?: string
}

export interface UpdateInstallationRequest extends Partial<CreateInstallationRequest> {}

export interface InstallationResponse extends Installation {}

export interface InstallationsListResponse {
  success: boolean
  message?: string
  data: Installation[]
  pageInfo?: {
    currentPage: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface InstallationDetailResponse {
  success: boolean
  message?: string
  data: Installation
}

export interface InstallationMutationResponse {
  success: boolean
  message?: string
  data: Installation
}
