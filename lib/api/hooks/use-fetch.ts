// Custom hooks for data fetching with loading and error states
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient, ApiError } from '@/lib/api/client'

export interface UseFetchState<T> {
  data: T | null
  loading: boolean
  error: (Error & ApiError) | null
}

export interface UseFetchOptions<T> {
  skip?: boolean
  refetchInterval?: number
  raw?: boolean
  select?: (response: unknown) => T
}

// Cache for pending requests to avoid duplicate API calls
const pendingRequests = new Map<string, Promise<unknown>>()

function normalizeApiError(error: unknown): Error & ApiError {
  const normalized = new Error(
    error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
      ? String((error as { message: string }).message)
      : error instanceof Error
        ? error.message
        : String(error)
  ) as Error & ApiError

  if (error && typeof error === 'object') {
    const maybeApiError = error as Partial<ApiError>
    if (typeof maybeApiError.message === 'string') {
      normalized.status = typeof maybeApiError.status === 'number' ? maybeApiError.status : 0
      normalized.code = maybeApiError.code
      normalized.errors = maybeApiError.errors
      return normalized
    }
  }

  normalized.status = 0
  return normalized
}

function normalizeFetchData<T>(response: unknown, options?: UseFetchOptions<T>): T {
  if (options?.select) {
    return options.select(response)
  }

  if (options?.raw) {
    return response as T
  }

  if (
    response &&
    typeof response === 'object' &&
    !Array.isArray(response) &&
    'data' in response
  ) {
    return (response as { data: T }).data
  }

  return response as T
}

export function useFetch<T>(
  url: string | null | undefined,
  options?: UseFetchOptions<T>
) {
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: Boolean(url && !options?.skip),
    error: null,
  })

  const refetch = useCallback(async () => {
    if (!url) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const requestPromise =
        pendingRequests.get(url) ??
        apiClient.get<unknown>(url).finally(() => {
          pendingRequests.delete(url)
        })

      if (!pendingRequests.has(url)) {
        pendingRequests.set(url, requestPromise)
      }

      const response = await requestPromise
      const data = normalizeFetchData<T>(response, optionsRef.current)

      setState({ data, loading: false, error: null })
    } catch (err) {
      pendingRequests.delete(url)
      setState({
        data: null,
        loading: false,
        error: normalizeApiError(err),
      })
    }
  }, [url])

  useEffect(() => {
    const currentOptions = optionsRef.current
    if (currentOptions?.skip || !url) return

    void refetch()

    if (currentOptions?.refetchInterval) {
      const interval = setInterval(() => {
        void refetch()
      }, currentOptions.refetchInterval)

      return () => clearInterval(interval)
    }
  }, [url, refetch])

  return { ...state, refetch }
}

export interface UseMutationState<TData> {
  data: TData | null
  loading: boolean
  error: (Error & ApiError) | null
  success: boolean
}

export type MutationFn<TData, TVariables = void> = (
  variables: TVariables
) => Promise<TData>

export interface UseMutationOptions<TData, TVariables = void> {
  mutationFn: MutationFn<TData, TVariables>
  onSuccess?: (data: TData, variables: TVariables | undefined) => void | Promise<void>
  onError?: (error: Error & ApiError, variables: TVariables | undefined) => void | Promise<void>
  onSettled?: (
    data: TData | null,
    error: (Error & ApiError) | null,
    variables: TVariables | undefined
  ) => void | Promise<void>
}

export function useMutation<TData, TVariables = void>(
  mutation: MutationFn<TData, TVariables> | UseMutationOptions<TData, TVariables>
) {
  const config: UseMutationOptions<TData, TVariables> =
    typeof mutation === 'function' ? { mutationFn: mutation } : mutation

  const [state, setState] = useState<UseMutationState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  })

  const mutate = useCallback(
    async (
      arg?: TVariables | MutationFn<TData, TVariables>
    ): Promise<TData> => {
      const executor =
        typeof arg === 'function' ? arg : config.mutationFn
      const variables =
        typeof arg === 'function' ? undefined : (arg as TVariables | undefined)

      if (!executor) {
        throw new Error('Mutation function is required')
      }

      setState({ data: null, loading: true, error: null, success: false })

      try {
      const overrideFn =
          typeof arg === 'function'
            ? (arg as () => Promise<TData>)
            : null
      const mutationFn = config.mutationFn as MutationFn<TData, TVariables>
        const result = overrideFn
          ? await overrideFn()
          : await mutationFn(variables as TVariables)

        setState({ data: result, loading: false, error: null, success: true })
        await config.onSuccess?.(result, variables)
        await config.onSettled?.(result, null, variables)
        return result
      } catch (err) {
        const apiError = normalizeApiError(err)

        setState({
          data: null,
          loading: false,
          error: apiError,
          success: false,
        })

        await config.onError?.(apiError, variables)
        await config.onSettled?.(null, apiError, variables)
        throw apiError
      }
    },
    [config]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, success: false })
  }, [])

  return { ...state, mutate, reset }
}
