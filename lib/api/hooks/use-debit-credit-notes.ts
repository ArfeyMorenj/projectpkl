import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import * as debitCreditNotesAPI from '../debit-credit-notes'
import { normalizeApiError } from '../client'
import {
  DebitCreditNote,
  DebitCreditNoteDetail,
  DebitCreditNoteListRow,
  DebitCreditNoteSummaryRow,
  CreateDebitCreditNoteRequest,
  UpdateDebitCreditNoteRequest,
} from '../types/debit-credit-notes'

// Fetch Hooks

export function useDebitCreditNotes(filters?: {
  page?: number
  per_page?: number
  date_from?: string
  date_to?: string
  number?: string
  client_name?: string
}) {
  const [data, setData] = useState<DebitCreditNoteListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDebitCreditNotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await debitCreditNotesAPI.getDebitCreditNotes(filters)
      setData(result)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchDebitCreditNotes()
  }, [fetchDebitCreditNotes])

  return {
    data,
    loading,
    error,
    refetch: fetchDebitCreditNotes,
  }
}

export function useDebitCreditNoteDetail(id?: number) {
  const [data, setData] = useState<DebitCreditNoteDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const result = await debitCreditNotesAPI.getDebitCreditNoteById(id)
      setData(result)
    } catch (err) {
      const errorObj = normalizeApiError(err)
      setError(errorObj)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

export function useDebitCreditNotesSearch(filters?: {
  q?: string
  date_from?: string
  date_to?: string
  number?: string
  client_name?: string
}) {
  const [results, setResults] = useState<DebitCreditNoteListRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!filters?.q || filters.q.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await debitCreditNotesAPI.searchDebitCreditNotes(
          filters
        )
        setResults(result)
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  return { results, loading, error }
}

// Mutation Hooks

export function useCreateDebitCreditNote() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: CreateDebitCreditNoteRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await debitCreditNotesAPI.createDebitCreditNote(data)
      const noteType = data.type === 'D' ? 'Nota Debet' : 'Nota Kredit'
      toast({
        title: 'Sukses',
        description: `${noteType} berhasil dibuat`,
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = normalizeApiError(err)
      setError(errorObj)
      const noteType = data.type === 'D' ? 'Nota Debet' : 'Nota Kredit'
      toast({
        title: 'Error',
        description: errorObj.message || `Gagal membuat ${noteType}`,
        variant: 'destructive',
      })
      throw errorObj
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useUpdateDebitCreditNote(id?: number) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: UpdateDebitCreditNoteRequest) => {
    if (!id) throw new Error('ID is required for update')

    try {
      setLoading(true)
      setError(null)
      const result = await debitCreditNotesAPI.updateDebitCreditNote(id, data)
      const noteType = data.type === 'D' ? 'Nota Debet' : 'Nota Kredit'
      toast({
        title: 'Sukses',
        description: `${noteType} berhasil diperbarui`,
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = normalizeApiError(err)
      setError(errorObj)
      const noteType = data.type === 'D' ? 'Nota Debet' : 'Nota Kredit'
      toast({
        title: 'Error',
        description: errorObj.message || `Gagal memperbarui ${noteType}`,
        variant: 'destructive',
      })
      throw errorObj
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDeleteDebitCreditNote() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await debitCreditNotesAPI.deleteDebitCreditNote(id)
      toast({
        title: 'Sukses',
        description: 'Nota debet/kredit berhasil dihapus',
        variant: 'default',
      })
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal menghapus nota debet/kredit',
        variant: 'destructive',
      })
      throw errorObj
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDebitCreditNoteSummary(id?: number) {
  const [data, setData] = useState<DebitCreditNoteSummaryRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!id) return

      try {
        setLoading(true)
        setError(null)
        const result = await debitCreditNotesAPI.getDebitCreditNoteSummary(id)
        setData(result)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
