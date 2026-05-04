// Company Management Custom Hooks
'use client'

import { useEffect, useState } from 'react'
import { ENDPOINTS } from '../endpoints'
import * as companiesAPI from '../companies'
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../types/companies'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

export function useCompanies() {
  return useFetch<Company[]>(ENDPOINTS.COMPANIES.LIST)
}

export function useCompanyDetail(id?: string | number | null) {
  return useFetch<Company | null>(id ? ENDPOINTS.COMPANIES.GET(id) : null, {
    skip: !id,
  })
}

export function useCompaniesSearch(searchTerm: string = '') {
  const [results, setResults] = useState<Company[]>([])
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
        const data = await companiesAPI.searchCompanies(term)
        setResults(data)
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

export function useCreateCompany() {
  return useMutation<Company, CreateCompanyRequest>({
    mutationFn: (data) => companiesAPI.createCompany(data),
  })
}

export function useUpdateCompany(id?: string | number | null) {
  return useMutation<Company, UpdateCompanyRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Company ID is required')
      return companiesAPI.updateCompany(id, data)
    },
  })
}

export function useDeleteCompany() {
  return useMutation<{ success: boolean; message: string }, string | number>({
    mutationFn: (id) => companiesAPI.deleteCompany(id),
  })
}
