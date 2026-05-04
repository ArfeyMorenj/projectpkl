// Product Management Types
// Based on GET /api/products response from Postman collection

export interface Product {
  id: number
  code: string
  name: string
  specification: string | null
  description: string | null
  author_code: string | null
  author_name?: string | null
  compiler: string | null
  year: string | number | null
  product_group_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  product_group?: {
    id: number
    code: string
    name: string
  } | null
  author?: {
    code: string
    name: string
  } | null
}

export interface CreateProductRequest {
  code: string
  name: string
  specification?: string
  description?: string
  author_code?: string
  compiler?: string
  year?: string | number
  product_group_id?: number | null
  is_active?: boolean
}

export interface UpdateProductRequest extends CreateProductRequest {}

// Response types
export interface ProductResponse {
  success: boolean
  data: Product
  message?: string
}

export interface ProductsListResponse {
  success: boolean
  data: Product[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface ProductsSearchResponse {
  success: boolean
  data: Product[]
  message?: string
}

export interface ProductDeleteResponse {
  success: boolean
  message: string
}
