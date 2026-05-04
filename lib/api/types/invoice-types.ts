// Invoice Type Management Types

export interface InvoiceType {
  id: number
  code: string
  name: string
  is_license: boolean
  auto_create_number: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateInvoiceTypeRequest {
  code: string
  name: string
  is_license: boolean
  auto_create_number: boolean
  is_active?: boolean
}

export interface UpdateInvoiceTypeRequest extends CreateInvoiceTypeRequest {}

export interface InvoiceTypeResponse {
  success: boolean
  data: InvoiceType
  message?: string
}

export interface InvoiceTypesListResponse {
  success: boolean
  data: InvoiceType[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface InvoiceTypesSearchResponse {
  success: boolean
  data: InvoiceType[]
  message?: string
}

export interface InvoiceTypeDeleteResponse {
  success: boolean
  message: string
}
