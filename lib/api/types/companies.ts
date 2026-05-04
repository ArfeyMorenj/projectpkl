// Company Management Types

export interface Company {
  id: number
  code: string
  name: string
  address: string
  address_invoice: string | null
  city: string
  city_invoice: string | null
  phone: string
  fax: string | null
  email: string
  website: string | null
  npwp: string
  npkp: string | null
  tax_name: string | null
  tax_position: string | null
  invoice_name: string | null
  invoice_position: string | null
  invoice_name_2: string | null
  invoice_position_2: string | null
  invoice_tolerance_days: string | number | null
  upgrade_days: string | number | null
  letterhead_top: string | null
  letterhead_bottom: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateCompanyRequest {
  code: string
  name: string
  address: string
  address_invoice?: string
  city: string
  city_invoice?: string
  phone: string
  fax?: string
  email: string
  website?: string
  npwp: string
  npkp?: string
  tax_name?: string
  tax_position?: string
  invoice_name?: string
  invoice_position?: string
  invoice_name_2?: string
  invoice_position_2?: string
  invoice_tolerance_days?: string | number
  upgrade_days?: string | number
  letterhead_top?: string
  letterhead_bottom?: string
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {}

export interface CompanyResponse {
  success: boolean
  data: Company
  message?: string
}

export interface CompaniesListResponse {
  success: boolean
  data: Company[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface CompaniesSearchResponse {
  success: boolean
  data: Company[]
  message?: string
}

export interface CompanyDeleteResponse {
  success: boolean
  message: string
}
