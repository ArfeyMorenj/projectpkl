// Setup Module Hooks
'use client'

import { useEffect, useState } from 'react'
import { ENDPOINTS } from '../endpoints'
import * as setupAPI from '../setup'
import type {
  CompanySettings,
  CreateTaxSeriesRequest,
  TaxSeries,
  UpdateTaxSeriesRequest,
} from '../types/setup'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

export function useCompanySettings() {
  return useFetch<CompanySettings>(ENDPOINTS.SETUP.COMPANY_SETTINGS)
}

export function useSaveCompanySettings() {
  return useMutation<CompanySettings, CompanySettings>({
    mutationFn: (data) => setupAPI.updateCompanySettings(data),
  })
}

export function useTaxSeries() {
  return useFetch<TaxSeries[]>(ENDPOINTS.SETUP.TAX_SERIES)
}

export function useTaxSeriesSearch(searchTerm: string = '') {
  const [results, setResults] = useState<TaxSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const term = searchTerm.trim()
    if (term.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await setupAPI.getTaxSeries()
        const filtered = data.filter((item) =>
          [item.filled_date, item.period, item.tax_code, item.start_number, item.end_number, item.current_number]
            .join(' ')
            .toLowerCase()
            .includes(term.toLowerCase())
        )
        setResults(filtered)
      } catch (err) {
        setResults([])
        setError(err instanceof Error ? err : new Error('Search failed'))
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return { results, loading, error }
}

export function useCreateTaxSeries() {
  return useMutation<TaxSeries, CreateTaxSeriesRequest>({
    mutationFn: (data) => setupAPI.createTaxSeries(data),
  })
}

export function useUpdateTaxSeries(id?: number | string | null) {
  return useMutation<TaxSeries, UpdateTaxSeriesRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Tax series ID is required')
      return setupAPI.updateTaxSeries(id, data)
    },
  })
}

export function useDeleteTaxSeries() {
  return useMutation<{ success: boolean; message: string }, number | string>({
    mutationFn: (id) => setupAPI.deleteTaxSeries(id),
  })
}

export function useNextTaxSeriesNumber() {
  return useMutation<TaxSeries, number | string>({
    mutationFn: (id) => setupAPI.nextTaxSeriesNumber(id),
  })
}
