// Chart of Accounts hooks
'use client'

import { useEffect, useState } from 'react'
import { useFetch } from './use-fetch'
import type { ChartOfAccount } from '@/lib/api/types/master-data'
import { getChartOfAccounts, searchChartOfAccounts } from '@/lib/api/chart-of-accounts'
import { ENDPOINTS } from '@/lib/api/endpoints'

export function useChartOfAccounts() {
  return useFetch<ChartOfAccount[]>(ENDPOINTS.LOOKUPS.COA, {
    skip: false,
  })
}

export function useChartOfAccountDetail(id?: string | number | null) {
  return useFetch<ChartOfAccount>(id ? `${ENDPOINTS.LOOKUPS.COA}/${id}` : null, {
    skip: !id,
  })
}

export function useChartOfAccountsSearch(searchTerm: string = '') {
  const [results, setResults] = useState<ChartOfAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await searchChartOfAccounts(searchTerm)
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'))
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return { results, loading, error }
}

export function useChartOfAccountsLookup() {
  return useFetch<ChartOfAccount[]>(ENDPOINTS.LOOKUPS.COA, {
    skip: false,
  })
}
