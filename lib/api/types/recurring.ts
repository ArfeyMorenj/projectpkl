export interface GenerateRecurringInvoicesRequest {
  period?: string
}

export interface GenerateRecurringInvoicesResponse {
  success: boolean
  period: string
  created_count: number
  skipped_count: number
  created: Array<{
    id: number
    number: string
    client_id: number
    bank_id: number
    work_order_id: number
    period: string
    date: string
    due_date: string | null
    description: string
    bruto: string
    discount: string
    dpp: string
    ppn: string
    ppn_percentage: string
    dp: string
    other: string
    total: string
    include_ppn: boolean
    is_paid: boolean
    is_posted: boolean
    client?: {
      id: number
      code: string
      name: string
    }
    invoice_type?: {
      id: number
      code: string
      name: string
      is_license: boolean
    }
    work_order?: {
      id: number
      number: string
      client_id: number
      product_id: number
      item_id: number
      status: string
      amount: string
      description?: string | null
      item_count?: number
      per_unit?: string | null
      notes?: string | null
    }
    items?: Array<{
      id: number
      invoice_id: number
      master_item_product_id?: number | null
      item_code: string
      item_name: string
      description: string
      qty: number
      unit: string
      price: string
      bruto: string
      months: number
    }>
  }>
  skipped: unknown[]
}
