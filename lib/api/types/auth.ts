// Auth Response Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  message: string
}

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LogoutResponse {
  message: string
  success: boolean
}

export interface MeResponse {
  data: User
  message: string
  success: boolean
}
