import { useState, useEffect, useMemo, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import * as paymentsAPI from '@/lib/api/payments'
import { useFetch } from './use-fetch'
import type {
  Payment,
  PaymentDetail,
  PaymentResponse,
  PaymentSummary,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '@/lib/api/types/payments'

interface UseFetchOptions<T> {
  skip?: boolean
  refetchInterval?: number
}

interface UseMutationOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface PaymentFilters {
  status?: string
  from_date?: string
  to_date?: string
  page?: number
  per_page?: number
}

/**
 * Fetch payments with pagination and filters
 */
export function usePayments(filters: PaymentFilters = {}, options: UseFetchOptions<Payment[]> = {}) {
  const page = filters.page ?? 1
  const perPage = filters.per_page ?? 10
  const status = filters.status ?? ''
  const fromDate = filters.from_date ?? ''
  const toDate = filters.to_date ?? ''

  const url = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (status) params.set('status', status)
    if (fromDate) params.set('from_date', fromDate)
    if (toDate) params.set('to_date', toDate)
    return `/payments?${params.toString()}`
  }, [page, perPage, status, fromDate, toDate])

  const query = useFetch<{ data: Payment[] }>(url, {
    skip: options?.skip,
    refetchInterval: options?.refetchInterval,
    raw: true,
  })

  const data = query.data?.data ?? []

  return {
    data,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch single payment by ID
 */
export function usePaymentDetail(id?: number) {
  const [data, setData] = useState<PaymentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await paymentsAPI.getPaymentById(id)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  return { data, loading, error }
}

/**
 * Search payments by query with debouncing
 */
export function usePaymentsSearch(searchTerm: string) {
  const [results, setResults] = useState<PaymentResponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await paymentsAPI.searchPayments(searchTerm)
        setResults(data)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return { results, loading }
}

/**
 * Create payment mutation
 */
export function useCreatePayment(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (data: CreatePaymentRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await paymentsAPI.createPayment(data)
      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil dibuat',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal membuat pembayaran')
      setError(error)
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      })
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options, toast])

  return { mutate, loading, error }
}

/**
 * Update payment mutation
 */
export function useUpdatePayment(id?: number, options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (data: UpdatePaymentRequest) => {
    if (!id) throw new Error('ID diperlukan untuk update')
    setLoading(true)
    setError(null)
    try {
      const result = await paymentsAPI.updatePayment(id, data)
      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil diperbarui',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal memperbarui pembayaran')
      setError(error)
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      })
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [id, options, toast])

  return { mutate, loading, error }
}

/**
 * Delete payment mutation
 */
export function useDeletePayment(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await paymentsAPI.deletePayment(id)
      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil dihapus',
      })
      options?.onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal menghapus pembayaran')
      setError(error)
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      })
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options, toast])

  return { mutate, loading, error }
}

/**
 * Post payment to journal mutation
 */
export function usePostPayment(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (paymentId: number, periodId?: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await paymentsAPI.postPayment(paymentId, periodId)
      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil diposting ke jurnal',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal posting pembayaran')
      setError(error)
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      })
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options, toast])

  return { mutate, loading, error }
}

/**
 * Reverse payment mutation
 */
export function useReversePayment(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (id: number, reason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await paymentsAPI.reversePayment(id, reason)
      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil dibatalkan',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal membatalkan pembayaran')
      setError(error)
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      })
      options?.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options, toast])

  return { mutate, loading, error }
}

/**
 * Payment summary hook
 */
export function usePaymentSummary(fromDate?: string, toDate?: string) {
  const [data, setData] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const result = await paymentsAPI.getPaymentSummary(fromDate, toDate)
        setData(result)
      } catch (error) {
        console.error('Failed to fetch summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [fromDate, toDate])

  return { data, loading }
}
