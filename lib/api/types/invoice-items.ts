import type { Invoice } from './invoices'
import type { MasterItemProduct } from './master-item-products'

export interface InvoiceItemRecord {
  id: number
  invoice_id: number
  master_item_product_id: number | null
  item_code?: string
  item_name?: string
  description?: string | null
  unit?: string
  qty: number
  price: number | string
  months?: number | null
  bruto?: number | string | null
  discount_percent?: number | null
  discount_amount?: number | null
  subtotal?: number | null
  tax_percent?: number | null
  tax_amount?: number | null
  total?: number | null
  invoice_number?: string | null
  invoice_date?: string | null
  client_id?: number | null
  client_name?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  invoice?: Invoice
  master_item_product?: MasterItemProduct
}

export interface CreateInvoiceItemRequest {
  invoice_id: number
  master_item_product_id?: number | null
  qty: number
  price: number | string
  months?: number
  description?: string
  unit?: string
  bruto?: number | string
  item_code?: string
  item_name?: string
}

export interface UpdateInvoiceItemRequest {
  invoice_id?: number
  master_item_product_id?: number | null
  qty?: number
  price?: number | string
  months?: number
  description?: string
  unit?: string
  bruto?: number | string
  item_code?: string
  item_name?: string
}

export interface InvoiceItemResponse {
  success: boolean
  data: InvoiceItemRecord
  message?: string
}

export interface InvoiceItemsListResponse {
  success: boolean
  data: InvoiceItemRecord[]
  message?: string
}

export interface InvoiceItemDeleteResponse {
  success: boolean
  message: string
}
