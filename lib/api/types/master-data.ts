// Master Data Response Types

export interface PageResponse<T> {
  data: T[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface DataResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface ArrayResponse<T> {
  data: T[]
  message?: string
  success?: boolean
}

// Model Types
export interface Client {
  id: number
  code: string
  name: string
  address: string
  city?: string
  phone?: string
  fax?: string
  email?: string
  npwp?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  code: string
  name: string
  group_code: string
  author_code: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ProductGroup {
  id: number
  code: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Item {
  id: number
  code: string
  name: string
  unit: string
  price: number
  acc_revenue: string
  acc_receivable: string
  cof_receivable: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface MasterItemProduct {
  id: number
  code: string
  name: string
  master_item_id: number
  product_id: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  code: string
  name: string
  position: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Bank {
  id: number
  code: string
  name: string
  type: 'M' | 'H'
  account_number: string
  acc: string
  cof: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Company {
  id: number
  code: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  npwp: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface InvoiceType {
  id: number
  code: string
  name: string
  is_license: boolean
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ChartOfAccount {
  id: number
  code: string
  name: string
  type: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// Create/Update Request Types
export interface CreateClientRequest {
  code: string
  name: string
  address: string
  city?: string
  phone?: string
  fax?: string
  email?: string
  npwp?: string
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export interface CreateProductRequest {
  code: string
  name: string
  group_code: string
  author_code: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateItemRequest {
  code: string
  name: string
  unit: string
  price: number
  acc_revenue: string
  acc_receivable: string
  cof_receivable: string
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

export interface CreateTeamMemberRequest {
  code: string
  name: string
  position: string
}

export interface UpdateTeamMemberRequest extends Partial<CreateTeamMemberRequest> {}

export interface CreateBankRequest {
  code: string
  name: string
  type: 'M' | 'H'
  account_number: string
  acc: string
  cof: string
}

export interface UpdateBankRequest extends Partial<CreateBankRequest> {}
