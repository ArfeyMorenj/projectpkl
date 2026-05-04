// Receivables Management Custom Hooks
import { useState, useEffect } from 'react'
import {
  Receivable,
  ReceivableDetail,
  ReceivableSummary,
} from '../types/receivables'
import * as receivablesAPI from '../receivables'
import { useFetch } from './use-fetch'

interface ReceivableFilters {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
}

/**
 * useReceivables - Fetch all receivables with optional filters
 */
export function useReceivables(filters?: ReceivableFilters) {
  const [data, setData] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await receivablesAPI.getReceivables(filters)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch receivables'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters?.status, filters?.client_id, filters?.from_date, filters?.to_date])

  const refetch = async () => {
    setLoading(true)
    try {
      const result = await receivablesAPI.getReceivables(filters)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch receivables'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * useReceivableDetail - Fetch single receivable by ID
 */
export function useReceivableDetail(id?: number) {
  const [data, setData] = useState<ReceivableDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await receivablesAPI.getReceivableById(id)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch receivable'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, loading, error }
}

/**
 * useReceivablesSearch - Search receivables with debounce
 */
export function useReceivablesSearch(searchTerm: string = '') {
  const [results, setResults] = useState<Receivable[]>([])
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
        const data = await receivablesAPI.searchReceivables(searchTerm)
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

  return {
    results,
    loading,
    error,
  }
}

/**
 * useReceivablesSummary - Fetch receivables summary & aging
 */
export function useReceivablesSummary(period?: string) {
  const [data, setData] = useState<ReceivableSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await receivablesAPI.getReceivablesSummary(period)
        setData(result as ReceivableSummary)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch summary'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  const refetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await receivablesAPI.getReceivablesSummary(period)
      setData(result as ReceivableSummary)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch summary'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

/**
 * useOutstandingReceivables - Fetch outstanding receivables only
 */
export function useOutstandingReceivables() {
  const [data, setData] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await receivablesAPI.getOutstandingReceivables()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch outstanding'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const refetch = async () => {
    setLoading(true)
    try {
      const result = await receivablesAPI.getOutstandingReceivables()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch outstanding'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}
