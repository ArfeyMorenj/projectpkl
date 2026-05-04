// Bank Management Types
// Based on POST /api/banks response from Postman collection

export interface Bank {
  id: number
  code: string
  name: string
  account_number: string | null
  account_name: string | null
  type: 'M' | 'H' // M = Main, H = Header
  acc_code: string
  cdf_code: string
  is_active: boolean
  acc_code_name: string
  cdf_code_name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Request body for creating/updating bank
export interface CreateBankRequest {
  code: string
  name: string
  account_number?: string
  account_name?: string
  type: 'M' | 'H'
  acc_code: string
  cdf_code: string
}

export interface UpdateBankRequest extends CreateBankRequest {}

// Response types
export interface BankResponse {
  success: boolean
  data: Bank
  message?: string
}

export interface BanksListResponse {
  success: boolean
  data: Bank[]
  message?: string
}

export interface BanksSearchResponse {
  success: boolean
  data: Bank[]
  message?: string
}

export interface BankDeleteResponse {
  success: boolean
  message: string
}

// Error response
export interface BankErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}
