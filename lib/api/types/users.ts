// User Management Types

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  roles?: string[]
  status?: 'active' | 'inactive'
}

export interface UpdateUserRequest {
  name: string
  email: string
  password?: string
  roles?: string[]
  status?: 'active' | 'inactive'
}

export interface AssignRoleRequest {
  role: string
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}

export interface UsersListResponse {
  success: boolean
  data: User[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface UserDeleteResponse {
  success: boolean
  message: string
}
