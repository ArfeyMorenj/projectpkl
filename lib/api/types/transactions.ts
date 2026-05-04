// Transaction Response Types

export interface Invoice {
  id: number
  no_invoice: string
  invoice_type_id: number
  invoice_type?: { name: string; code: string }
  client_id: number
  client?: { name: string; code: string }
  invoice_date: string
  due_date: string
  description: string
  status: 'draft' | 'posted' | 'paid' | 'cancelled'
  total_amount: number
  paid_amount: number
  outstanding: number
  dpp: number
  ppn: number
  items?: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  item_id: number
  item?: { name: string; code: string }
  quantity: number
  unit_price: number
  amount: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  no_payment: string
  invoice_id: number
  client_id: number
  bank_id: number
  payment_date: string
  amount: number
  description: string
  status: 'pending' | 'posted' | 'verified'
  created_at: string
  updated_at: string
}

export interface WorkOrder {
  id: number
  no_work_order: string
  client_id: number
  client?: { name: string; code: string }
  product_id: number
  product?: { name: string; code: string }
  order_date: string
  start_date: string
  end_date: string
  status: 'draft' | 'ongoing' | 'completed' | 'cancelled'
  team_members: TeamAssignment[]
  created_at: string
  updated_at: string
}

export interface TeamAssignment {
  id: number
  work_order_id: number
  team_member_id: number
  team_member?: { name: string; code: string }
  role: string
  created_at: string
  updated_at: string
}

export interface StopLicense {
  id: number
  no_stop_license: string
  client_id: number
  client?: { name: string; code: string }
  product_id: number
  product?: { name: string; code: string }
  license_id: number
  stop_date: string
  reason: string
  status: 'active' | 'stopped'
  created_at: string
  updated_at: string
}

export interface License {
  id: number
  no_license: string
  client_id: number
  product_id: number
  start_date: string
  end_date: string
  amount: number
  status: 'active' | 'expired' | 'stopped'
  created_at: string
  updated_at: string
}

export interface Installation {
  id: number
  no_installation: string
  client_id: number
  product_id: number
  installation_date: string
  description: string
  status: 'draft' | 'completed'
  created_at: string
  updated_at: string
}

export interface DebitCreditNote {
  id: number
  no_note: string
  invoice_id: number
  client_id: number
  type: 'debit' | 'credit'
  amount: number
  reason: string
  status: 'draft' | 'posted'
  created_at: string
  updated_at: string
}

export interface Receivable {
  id: number
  invoice_id: number
  client_id: number
  current_amount: number
  paid_amount: number
  outstanding_amount: number
  status: 'paid' | 'partial' | 'pending'
  aging_days: number
  created_at: string
  updated_at: string
}

export interface PostingPayment {
  id: number
  no_posting: string
  bank_id: number
  posting_date: string
  total_amount: number
  status: 'pending' | 'posted' | 'verified'
  items: PostingPaymentItem[]
  created_at: string
  updated_at: string
}

export interface PostingPaymentItem {
  id: number
  posting_payment_id: number
  payment_id: number
  amount: number
  created_at: string
  updated_at: string
}

// Create/Update Request Types
export interface CreateInvoiceRequest {
  invoice_type_id: number
  client_id: number
  invoice_date: string
  due_date: string
  description: string
  dpp: number
  ppn: number
  items: {
    item_id: number
    quantity: number
    unit_price: number
  }[]
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface CreatePaymentRequest {
  invoice_id: number
  bank_id: number
  payment_date: string
  amount: number
  description: string
}

export interface UpdatePaymentRequest extends Partial<CreatePaymentRequest> {}

export interface CreateWorkOrderRequest {
  client_id: number
  product_id: number
  order_date: string
  start_date: string
  end_date: string
  team_members: {
    team_member_id: number
    role: string
  }[]
}

export interface UpdateWorkOrderRequest extends Partial<CreateWorkOrderRequest> {}

export interface CreateStopLicenseRequest {
  client_id: number
  product_id: number
  license_id: number
  stop_date: string
  reason: string
}

export interface UpdateStopLicenseRequest extends Partial<CreateStopLicenseRequest> {}
