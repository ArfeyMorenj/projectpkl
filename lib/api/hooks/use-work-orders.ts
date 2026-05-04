import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import * as workOrdersAPI from '@/lib/api/work-orders'
import type { WorkOrder, WorkOrderDetail, WorkOrderSummary, WorkOrderResponse, CreateWorkOrderRequest, UpdateWorkOrderRequest, WorkOrderTeamMember } from '@/lib/api/types/work-orders'

interface UseFetchOptions<T> {
  skip?: boolean
  refetchInterval?: number
}

export interface WorkOrderFilters {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
  page?: number
  per_page?: number
}

interface UseMutationOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Fetch work orders with pagination and filters
 */
export function useWorkOrders(
  filters?: WorkOrderFilters,
  options?: UseFetchOptions<WorkOrder[]>
) {
  const [data, setData] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const status = filters?.status ?? ''
  const clientId = filters?.client_id ?? null
  const fromDate = filters?.from_date ?? ''
  const toDate = filters?.to_date ?? ''
  const page = filters?.page ?? 1
  const perPage = filters?.per_page ?? 10

  const refetch = useCallback(async () => {
    if (options?.skip) return
    setLoading(true)
    setError(null)
    try {
      const result = await workOrdersAPI.getWorkOrders({
        status: status || undefined,
        client_id: clientId ?? undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page,
        per_page: perPage,
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [clientId, fromDate, options?.skip, page, perPage, status, toDate])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

/**
 * Fetch single work order by ID
 */
export function useWorkOrderDetail(id?: number) {
  const [data, setData] = useState<WorkOrderDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await workOrdersAPI.getWorkOrderById(id)
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
 * Search work orders by query with debouncing
 */
export function useWorkOrdersSearch(searchTerm: string) {
  const [results, setResults] = useState<WorkOrderResponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await workOrdersAPI.searchWorkOrders(searchTerm)
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
 * Create work order mutation
 */
export function useCreateWorkOrder(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (data: CreateWorkOrderRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workOrdersAPI.createWorkOrder(data)
      toast({
        title: 'Berhasil',
        description: 'Work Order berhasil dibuat',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal membuat Work Order')
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
 * Update work order mutation
 */
export function useUpdateWorkOrder(id?: number, options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (data: UpdateWorkOrderRequest) => {
    if (!id) throw new Error('ID diperlukan untuk update')
    setLoading(true)
    setError(null)
    try {
      const result = await workOrdersAPI.updateWorkOrder(id, data)
      toast({
        title: 'Berhasil',
        description: 'Work Order berhasil diperbarui',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal memperbarui Work Order')
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
 * Delete work order mutation
 */
export function useDeleteWorkOrder(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await workOrdersAPI.deleteWorkOrder(id)
      toast({
        title: 'Berhasil',
        description: 'Work Order berhasil dihapus',
      })
      options?.onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal menghapus Work Order')
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
 * Assign team to work order mutation
 */
export function useAssignTeamToWorkOrder(options?: UseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = useCallback(async (woId: number, team: Array<{ team_member_id: number; role: WorkOrderTeamMember['role'] }>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workOrdersAPI.assignTeamToWorkOrder(woId, team)
      toast({
        title: 'Berhasil',
        description: 'Team berhasil ditugaskan',
      })
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Gagal menugaskan team')
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
 * Work order summary hook
 */
export function useWorkOrderSummary(fromDate?: string, toDate?: string) {
  const [data, setData] = useState<WorkOrderSummary | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const result = await workOrdersAPI.getWorkOrderSummary(fromDate, toDate)
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
