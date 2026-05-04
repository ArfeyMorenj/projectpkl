'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { downloadInvoicePdf, downloadReceiptPdf, getInvoiceBatchPrint, queueBatchInvoices } from '../print'
import type { PrintBatchFilters, PrintBatchQueueResponse, PrintBatchResponse } from '../print'

export function useInvoiceBatchPrint(filters?: PrintBatchFilters) {
  const [data, setData] = useState<PrintBatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getInvoiceBatchPrint(filters)
        if (mounted) setData(result)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch print batch'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchData()

    return () => {
      mounted = false
    }
  }, [filters?.date_from, filters?.date_to])

  const refetch = async () => {
    setLoading(true)
    try {
      const result = await getInvoiceBatchPrint(filters)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch print batch'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

export function useQueueInvoiceBatchPrint() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async (filters?: PrintBatchFilters): Promise<PrintBatchQueueResponse> => {
    setLoading(true)
    setError(null)
    try {
      const result = await queueBatchInvoices(filters)
      toast({
        title: 'Sukses',
        description: result.message || 'Batch print queue disiapkan',
      })
      return result
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Failed to queue batch print')
      setError(apiError)
      toast({
        title: 'Gagal',
        description: apiError.message,
        variant: 'destructive',
      })
      throw apiError
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export async function fetchInvoicePdf(id: string | number) {
  return downloadInvoicePdf(id)
}

export async function fetchReceiptPdf(id: string | number) {
  return downloadReceiptPdf(id)
}
