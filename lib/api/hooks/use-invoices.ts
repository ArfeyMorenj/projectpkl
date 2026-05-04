// Invoice Management Custom Hooks
import { useState, useEffect } from 'react'
import {
  Invoice,
  InvoiceDetail,
  InvoiceSummary,
  InvoiceDeleteResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  PostInvoiceResponse,
} from '../types/invoices'
import * as invoicesAPI from '../invoices'
import { useMutation } from './use-fetch'
import { useToast } from '@/hooks/use-toast'

export interface InvoiceFilters {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
}

/**
 * useInvoices - Fetch all invoices with optional filters
 */
export function useInvoices(filters: InvoiceFilters = {}) {
  const [data, setData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await invoicesAPI.getInvoices(filters)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch invoices'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters?.status, filters?.client_id, filters?.from_date, filters?.to_date])

  const refetch = async () => {
    setLoading(true)
    try {
      const result = await invoicesAPI.getInvoices(filters)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * useInvoiceDetail - Fetch single invoice with items
 */
export function useInvoiceDetail(id?: number) {
  const [data, setData] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await invoicesAPI.getInvoiceById(id)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch invoice'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, loading, error }
}

/**
 * useInvoicesSearch - Search invoices with debounce
 */
export function useInvoicesSearch(searchTerm: string = '') {
  const [results, setResults] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([])
      return
    }

    let isMounted = true

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await invoicesAPI.searchInvoices(searchTerm)
        if (isMounted) {
          setResults(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Search failed'))
          setResults([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchTerm])

  return { results, loading, error }
}

/**
 * useCreateInvoice - Create new invoice mutation
 */
export function useCreateInvoice() {
  const { toast } = useToast()

  return useMutation<InvoiceDetail, CreateInvoiceRequest>({
    mutationFn: (data) => invoicesAPI.createInvoice(data),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice berhasil dibuat',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal membuat invoice',
        variant: 'destructive',
      })
    },
  })
}

/**
 * useUpdateInvoice - Update invoice mutation
 */
export function useUpdateInvoice(id?: number) {
  const { toast } = useToast()

  return useMutation<InvoiceDetail, UpdateInvoiceRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Invoice ID is required')
      return invoicesAPI.updateInvoice(id, data)
    },
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice berhasil diperbarui',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui invoice',
        variant: 'destructive',
      })
    },
  })
}

/**
 * useDeleteInvoice - Delete invoice mutation (draft only)
 */
export function useDeleteInvoice() {
  const { toast } = useToast()

  return useMutation<InvoiceDeleteResponse, number>({
    mutationFn: (id) => invoicesAPI.deleteInvoice(id),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice berhasil dihapus',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus invoice',
        variant: 'destructive',
      })
    },
  })
}

/**
 * usePostInvoice - Post invoice to journal
 */
export function usePostInvoice() {
  const { toast } = useToast()

  return useMutation<PostInvoiceResponse['data'], { invoiceId: number; periodId?: number }>({
    mutationFn: ({ invoiceId, periodId }) => invoicesAPI.postInvoice(invoiceId, periodId),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice berhasil diposting ke jurnal',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal posting invoice',
        variant: 'destructive',
      })
    },
  })
}

/**
 * useCancelInvoice - Cancel invoice
 */
export function useCancelInvoice() {
  const { toast } = useToast()

  return useMutation<InvoiceDetail, { invoiceId: number; reason?: string }>({
    mutationFn: ({ invoiceId, reason }) => invoicesAPI.cancelInvoice(invoiceId, reason),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice berhasil dibatalkan',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal membatalkan invoice',
        variant: 'destructive',
      })
    },
  })
}

/**
 * useGenerateInvoiceNumber - Generate next invoice number
 */
export function useGenerateInvoiceNumber() {
  return useMutation<string, string | undefined>({
    mutationFn: (prefix) => invoicesAPI.generateInvoiceNumber(prefix),
  })
}

/**
 * useInvoiceSummary - Get invoice summary for period
 */
export function useInvoiceSummary(fromDate: string, toDate: string) {
  const [data, setData] = useState<InvoiceSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!fromDate || !toDate) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await invoicesAPI.getInvoiceSummary(fromDate, toDate)
        setData(result as InvoiceSummary)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch summary'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fromDate, toDate])

  return { data, loading, error }
}
