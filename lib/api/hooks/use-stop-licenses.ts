import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import * as stopLicensesAPI from '../stop-licenses'
import {
  StopLicense,
  CreateStopLicenseRequest,
  UpdateStopLicenseRequest,
} from '../types/stop-licenses'

// Fetch Hooks

export function useStopLicenses(filters?: { page?: number; per_page?: number }) {
  const [data, setData] = useState<StopLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStopLicenses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await stopLicensesAPI.getStopLicenses(filters)
      setData(result)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchStopLicenses()
  }, [fetchStopLicenses])

  return {
    data,
    loading,
    error,
    refetch: fetchStopLicenses,
  }
}

export function useStopLicenseDetail(id?: number) {
  const [data, setData] = useState<StopLicense | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await stopLicensesAPI.getStopLicenseById(id)
        setData(result)
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  return { data, loading, error }
}

export function useStopLicensesSearch(searchTerm: string) {
  const [results, setResults] = useState<StopLicense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await stopLicensesAPI.searchStopLicenses(searchTerm)
        setResults(result)
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return { results, loading, error }
}

// Mutation Hooks

export function useCreateStopLicense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: CreateStopLicenseRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await stopLicensesAPI.createStopLicense(data)
      toast({
        title: 'Sukses',
        description: 'Henti Lisensi berhasil dibuat',
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal membuat Henti Lisensi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useUpdateStopLicense(id?: number) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: UpdateStopLicenseRequest) => {
    if (!id) throw new Error('ID is required for update')

    try {
      setLoading(true)
      setError(null)
      const result = await stopLicensesAPI.updateStopLicense(id, data)
      toast({
        title: 'Sukses',
        description: 'Henti Lisensi berhasil diperbarui',
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal memperbarui Henti Lisensi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDeleteStopLicense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await stopLicensesAPI.deleteStopLicense(id)
      toast({
        title: 'Sukses',
        description: 'Henti Lisensi berhasil dihapus',
        variant: 'default',
      })
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal menghapus Henti Lisensi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
