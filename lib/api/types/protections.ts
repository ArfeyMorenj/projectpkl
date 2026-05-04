// Protection Management Types
// Based on GET/POST/PUT/DELETE /api/protections response from Postman collection

export interface Protection {
  id: number
  period: string
  is_protected: boolean
  protected_at: string
  protected_by: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateProtectionRequest {
  period: string
  is_protected: boolean
  protected_at: string
  protected_by: number
}

export interface UpdateProtectionRequest extends Partial<CreateProtectionRequest> {}

export interface ProtectionResponse {
  success: boolean
  data: Protection
  message?: string
}

export interface ProtectionsListResponse {
  success: boolean
  data: Protection[]
  message?: string
}

export interface ProtectionDeleteResponse {
  success: boolean
  message: string
  deleted?: boolean
}
