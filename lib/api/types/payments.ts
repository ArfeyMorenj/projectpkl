// Payment Types & Interfaces

export interface PaymentItem {
  id?: number
  payment_id?: number
  invoice_id: number
  invoice_number?: string
  amount: number | string
  description?: string
}

export interface Payment {
  id: number
  number: string
  date: string
  invoice_id: number
  client_id: number
  invoice_number?: string
  client_name?: string
  description?: string | null
  amount: number | string
  is_posted: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
  invoice?: {
    id: number
    number: string
    client_id?: number
  }
  client?: {
    id: number
    code: string
    name: string
  }
}

export interface PaymentDetail extends Payment {
  items?: PaymentItem[]
  created_by?: string
  posted_date?: string
  posted_by?: string
}

export interface CreatePaymentRequest {
  number: string
  date: string
  invoice_id: number
  client_id: number
  description?: string
  amount: number
}

export interface UpdatePaymentRequest extends Partial<CreatePaymentRequest> {}

export interface PaymentResponse {
  id: number
  number: string
  date: string
  invoice_id: number
  client_id: number
  client_name?: string
  invoice_number?: string
  description?: string
  amount: number | string
  is_posted: boolean
  created_at: string
}

export interface PaymentsListResponse {
  success: boolean
  data: Payment[]
  message?: string
}

export interface PaymentsSearchResponse {
  success: boolean
  data: PaymentResponse[]
  message?: string
}

export interface PaymentDetailResponse {
  success: boolean
  data: PaymentDetail
  message?: string
}

export interface PaymentSummary {
  total_payments: number
  posted_count: number
  draft_count: number
  total_amount: number
  average_amount: number
}

export interface PaymentSummaryResponse {
  success: boolean
  data: PaymentSummary
  message?: string
}
