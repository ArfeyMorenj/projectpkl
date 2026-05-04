// API Client with interceptors and error handling
import { toast } from 'sonner'
import { clearDemoSession } from './demo-store'

export interface ApiError {
  message: string
  status: number
  code?: string
  errors?: Record<string, string[]>
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  success?: boolean
  errors?: Record<string, string[]>
}

export interface ApiRequestOptions {
  timeoutMs?: number
  suppressTimeoutError?: boolean
}

export function normalizeApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as Record<string, unknown>
    const messageParts: string[] = []

    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      messageParts.push(candidate.message.trim())
    }

    if (typeof candidate.detail === 'string' && candidate.detail.trim()) {
      messageParts.push(candidate.detail.trim())
    }

    if (typeof candidate.error === 'string' && candidate.error.trim()) {
      messageParts.push(candidate.error.trim())
    }

    const fieldErrors = candidate.errors as ApiError['errors'] | undefined
    if (fieldErrors && typeof fieldErrors === 'object') {
      const details = Object.entries(fieldErrors)
        .flatMap(([field, messages]) => {
          if (Array.isArray(messages)) {
            return messages
              .filter((message) => typeof message === 'string' && message.trim())
              .map((message) => `${field}: ${message}`)
          }
          return []
        })
        .filter(Boolean)

      if (details.length > 0) {
        messageParts.push(details.join('; '))
      }
    }

    return new Error(messageParts.length > 0 ? messageParts.join(' | ') : 'Request failed')
  }

  if (typeof error === 'string' && error.trim()) {
    return new Error(error.trim())
  }

  return new Error('An unexpected error occurred.')
}

class ApiClient {
  private baseURL: string
  private basePath: string
  private token: string | null = null
  private requestTimeout: number = 30000 // 30 seconds

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    this.basePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api'
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token')
      if (stored) {
        this.token = stored
      }
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token', token)
    }
  }

  getToken(): string | null {
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token')
    }
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  private buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${this.baseURL}${this.basePath}/${cleanEndpoint}`
  }

  private createAbortController(timeoutMs = this.requestTimeout): { controller: AbortController; timeout: NodeJS.Timeout } {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      try {
        controller.abort(new DOMException('Request timeout', 'AbortError'))
      } catch {
        controller.abort()
      }
    }, timeoutMs)
    return { controller, timeout }
  }

  private formatApiErrorMessage(data: any, status: number): string {
    const baseMessage =
      typeof data?.message === 'string' && data.message.trim()
        ? data.message.trim()
        : `HTTP Error: ${status}`

    const fieldErrors = data?.errors
    if (!fieldErrors || typeof fieldErrors !== 'object') {
      return baseMessage
    }

    const details = Object.entries(fieldErrors)
      .flatMap(([field, messages]) => {
        if (Array.isArray(messages)) {
          return messages
            .filter((message) => typeof message === 'string' && message.trim())
            .map((message) => `${field}: ${message}`)
        }
        if (typeof messages === 'string' && messages.trim()) {
          return [`${field}: ${messages}`]
        }
        return []
      })
      .filter(Boolean)

    if (details.length === 0) {
      return baseMessage
    }

    return `${baseMessage} (${details.join('; ')})`
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    
    // Handle non-JSON responses
    if (!contentType?.includes('application/json')) {
      if (response.ok) {
        return null as T
      }
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = {
        message: this.formatApiErrorMessage(data, response.status),
        status: response.status,
        code: data.code,
        errors: data.errors,
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.clearToken()
        clearDemoSession()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }

      throw error
    }

    return data
  }

  async get<T>(
    endpoint: string,
    customHeaders?: Record<string, string>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    const { controller, timeout } = this.createAbortController(requestOptions?.timeoutMs)
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'GET',
        headers: this.getHeaders(customHeaders),
        signal: controller.signal,
      })

      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeout)
      if (!(requestOptions?.suppressTimeoutError && error instanceof Error && error.name === 'AbortError')) {
        this.handleError(error)
      }
      throw error
    }
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    customHeaders?: Record<string, string>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    const { controller, timeout } = this.createAbortController(requestOptions?.timeoutMs)
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers: this.getHeaders(customHeaders),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeout)
      if (!(requestOptions?.suppressTimeoutError && error instanceof Error && error.name === 'AbortError')) {
        this.handleError(error)
      }
      throw error
    }
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    customHeaders?: Record<string, string>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    const { controller, timeout } = this.createAbortController(requestOptions?.timeoutMs)
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'PUT',
        headers: this.getHeaders(customHeaders),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeout)
      if (!(requestOptions?.suppressTimeoutError && error instanceof Error && error.name === 'AbortError')) {
        this.handleError(error)
      }
      throw error
    }
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    customHeaders?: Record<string, string>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    const { controller, timeout } = this.createAbortController(requestOptions?.timeoutMs)
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'PATCH',
        headers: this.getHeaders(customHeaders),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeout)
      if (!(requestOptions?.suppressTimeoutError && error instanceof Error && error.name === 'AbortError')) {
        this.handleError(error)
      }
      throw error
    }
  }

  async delete<T>(
    endpoint: string,
    customHeaders?: Record<string, string>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    const { controller, timeout } = this.createAbortController(requestOptions?.timeoutMs)
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'DELETE',
        headers: this.getHeaders(customHeaders),
        signal: controller.signal,
      })

      clearTimeout(timeout)
      // DELETE often returns 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeout)
      if (!(requestOptions?.suppressTimeoutError && error instanceof Error && error.name === 'AbortError')) {
        this.handleError(error)
      }
      throw error
    }
  }

  private handleError(error: unknown) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const apiErr = error as ApiError
      console.error('API Error:', apiErr.message)
      toast.error(apiErr.message || 'An error occurred. Please try again.')
      return
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Request timeout - Backend is taking too long to respond')
        toast.error('Request timeout. Backend server may be slow or not responding.')
        return
      }
      console.error('Error:', error.message)
      toast.error(error.message || 'An error occurred. Please try again.')
    } else {
      console.error('Unknown error:', error)
      toast.error('An unexpected error occurred.')
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
