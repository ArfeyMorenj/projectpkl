'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { clearDemoSession } from '@/lib/api/demo-store'
import type { User, MeResponse, LoginResponse } from '@/lib/api/types/auth'

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const authTokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'
  const authUserKey = process.env.NEXT_PUBLIC_AUTH_USER_KEY || 'auth_user'
  const currentModuleKey = 'fitart_current_module'

  const readCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null

    const raw = window.localStorage.getItem(authUserKey)
    if (!raw) return null

    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  }

  const clearAuthSession = useCallback(() => {
    apiClient.clearToken()
    clearDemoSession()

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(authUserKey)
      window.localStorage.removeItem(currentModuleKey)
      window.sessionStorage.removeItem('isAuthenticated')
      window.sessionStorage.removeItem('user')
    }
  }, [authUserKey])

  const describeAuthError = (error: unknown) => {
    if (error && typeof error === 'object') {
      const apiError = error as { message?: unknown; status?: unknown; errors?: unknown; code?: unknown }
      const message = typeof apiError.message === 'string' ? apiError.message : 'Unknown auth error'
      return {
        message,
        status: apiError.status,
        code: apiError.code,
        errors: apiError.errors,
      }
    }

    return {
      message: error instanceof Error ? error.message : String(error),
    }
  }

  // Check auth status on mount only once
  useEffect(() => {
    if (authChecked) return

    const checkAuth = async () => {
      setAuthChecked(true)
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem(authTokenKey) : null
        const cachedUser = readCachedUser()

        if (!token) {
          clearAuthSession()
          setUser(null)
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        apiClient.setToken(token)

        if (cachedUser) {
          setUser(cachedUser)
          setIsAuthenticated(true)
          setLoading(false)
        }

        const response = await apiClient.get<MeResponse>(
          ENDPOINTS.AUTH.ME,
          undefined,
          { timeoutMs: 5000, suppressTimeoutError: true }
        )
        setUser(response.data)
        setIsAuthenticated(true)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(authUserKey, JSON.stringify(response.data))
        }
      } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError'
        if (!isAbort) {
          console.error('Auth check error:', error)
        }
        clearAuthSession()
        setUser(null)
        setIsAuthenticated(false)
        if (pathname !== '/auth/login') {
          router.replace('/auth/login')
        }
      } finally {
        setLoading(false)
      }
    }

    void checkAuth()
  }, [authChecked, authTokenKey, authUserKey, clearAuthSession, pathname, router])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      try {
        setLoading(true)
        clearDemoSession()

        const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
          email,
          password,
        })

        apiClient.setToken(response.token)
        setUser(response.user)
        setIsAuthenticated(true)

        // Cache user info
        localStorage.setItem(
          authUserKey,
          JSON.stringify(response.user)
        )

        return response
      } catch (error) {
        console.error('Login failed:', describeAuthError(error))
        throw error
      } finally {
        setLoading(false)
      }
    },
    [authUserKey]
  )

  const logout = useCallback(async () => {
      try {
        setLoading(true)
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT)
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        clearAuthSession()
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
      }
  }, [clearAuthSession])

  const hasRole = useCallback(
    (role: string) => {
      return user?.roles?.includes(role) || false
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: string) => {
      return user?.permissions?.includes(permission) || false
    },
    [user]
  )

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
