import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import * as installationsAPI from '../installations'
import {
  Installation,
  CreateInstallationRequest,
  UpdateInstallationRequest,
} from '../types/installations'

// Fetch Hooks

export function useInstallations(filters?: { page?: number; per_page?: number }) {
  const [data, setData] = useState<Installation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInstallations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await installationsAPI.getInstallations(filters)
      setData(result)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchInstallations()
  }, [fetchInstallations])

  return {
    data,
    loading,
    error,
    refetch: fetchInstallations,
  }
}

export function useInstallationDetail(id?: number) {
  const [data, setData] = useState<Installation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await installationsAPI.getInstallationById(id)
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

export function useCreateInstallation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: CreateInstallationRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await installationsAPI.createInstallation(data)
      toast({
        title: 'Sukses',
        description: 'Instalasi berhasil dibuat',
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal membuat instalasi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useUpdateInstallation(id?: number) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (data: UpdateInstallationRequest) => {
    if (!id) throw new Error('ID is required for update')

    try {
      setLoading(true)
      setError(null)
      const result = await installationsAPI.updateInstallation(id, data)
      toast({
        title: 'Sukses',
        description: 'Instalasi berhasil diperbarui',
        variant: 'default',
      })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal memperbarui instalasi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDeleteInstallation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const mutate = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await installationsAPI.deleteInstallation(id)
      toast({
        title: 'Sukses',
        description: 'Instalasi berhasil dihapus',
        variant: 'default',
      })
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      toast({
        title: 'Error',
        description: errorObj.message || 'Gagal menghapus instalasi',
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
