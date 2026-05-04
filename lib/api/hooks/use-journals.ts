'use client'

import { useEffect, useState } from 'react'
import { getJournals, type JournalFilters } from '../journals'
import type { JournalPage } from '../types/journals'

export function useJournals(filters?: JournalFilters) {
  const [data, setData] = useState<JournalPage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getJournals(filters)
        if (mounted) {
          setData(result)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch journals'))
          setData(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchData()

    return () => {
      mounted = false
    }
  }, [filters?.page, filters?.per_page])

  const refetch = async () => {
    setLoading(true)
    try {
      const result = await getJournals(filters)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch journals'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}
