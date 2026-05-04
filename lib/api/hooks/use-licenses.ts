import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import * as licensesAPI from '../licenses'
import {
  License,
  CreateLicenseRequest,
  UpdateLicenseRequest,
} from '../types/licenses'

// Fetch Hooks

export function useLicenses(filters?: { page?: number; per_page?: number }) {
  const [data, setData] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await licensesAPI.getLicenses(filters)
      setData(result)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLicenses()
  }, [fetchLicenses])

  return {
    data,
    loading,
    error,
    refetch: fetchLicenses,
  }
}

export function useLicenseDetail(id?: number) {
  const [data, setData] = useState<License | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await licensesAPI.getLicenseById(id)
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

// Mutation Hooks

export function useCreateLicense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: CreateLicenseRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await licensesAPI.createLicense(data)
      toast({
        title: 'Sukses',
        description: 'Lisensi berhasil dibuat',
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal membuat lisensi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useUpdateLicense(id?: number) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: UpdateLicenseRequest) => {
    if (!id) throw new Error('ID is required for update')

    try {
      setLoading(true)
      setError(null)
      const result = await licensesAPI.updateLicense(id, data)
      toast({
        title: 'Sukses',
        description: 'Lisensi berhasil diperbarui',
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal memperbarui lisensi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDeleteLicense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await licensesAPI.deleteLicense(id)
      toast({
        title: 'Sukses',
        description: 'Lisensi berhasil dihapus',
        variant: 'default',
      })
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal menghapus lisensi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
