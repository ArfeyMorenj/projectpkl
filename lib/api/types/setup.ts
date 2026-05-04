// Setup Module Types

export interface CompanySettings {
  id?: number
  logo: string | null
  company_name: string
  address: string
  city: string
  phone: string
  npwp: string | null
  period_start: string
  acc_ppn_kes: string
  acc_ppn_mas: string
  acc_discount: string
  bank1: string
  bank1_sn: string
  bank1_ac: string
  bank2: string
  bank2_sn: string
  bank2_ac: string
  created_at?: string
  updated_at?: string
  acc_ppn_kes_name?: string
  acc_ppn_mas_name?: string
  acc_discount_name?: string
}

export interface TaxSeries {
  id: number | string
  filled_date: string
  period: string
  tax_code: string
  start_number: string
  end_number: string
  current_number: string
  ppn_percentage: number
  dpp_percentage: number
}

export interface CreateTaxSeriesRequest {
  filled_date: string
  period: string
  tax_code: string
  start_number: string
  end_number: string
  ppn_percentage: number
  dpp_percentage: number
}

export interface UpdateTaxSeriesRequest extends CreateTaxSeriesRequest {}

export interface CompanySettingsResponse {
  success: boolean
  data: CompanySettings
  message?: string
}

export interface TaxSeriesListResponse {
  success: boolean
  data: TaxSeries[]
  message?: string
}

export interface TaxSeriesResponse {
  success: boolean
  data: TaxSeries
  message?: string
}

export interface TaxSeriesDeleteResponse {
  success: boolean
  message: string
}
