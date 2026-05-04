// Invoice Type Management Custom Hooks
'use client'

import { useEffect, useState } from 'react'
import { ENDPOINTS } from '../endpoints'
import * as invoiceTypesAPI from '../invoice-types'
import type {
  CreateInvoiceTypeRequest,
  InvoiceType,
  UpdateInvoiceTypeRequest,
} from '../types/invoice-types'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

export function useInvoiceTypes() {
  return useFetch<InvoiceType[]>(ENDPOINTS.INVOICE_TYPES.LIST)
}

export function useInvoiceTypeDetail(id?: number | null) {
  return useFetch<InvoiceType | null>(id ? ENDPOINTS.INVOICE_TYPES.GET(id) : null, {
    skip: !id,
  })
}

export function useInvoiceTypesSearch(searchTerm: string = '') {
  const [results, setResults] = useState<InvoiceType[]>([])
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
        const data = await invoiceTypesAPI.searchInvoiceTypes(searchTerm.trim())
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

export function useCreateInvoiceType() {
  return useMutation<InvoiceType, CreateInvoiceTypeRequest>({
    mutationFn: (data) => invoiceTypesAPI.createInvoiceType(data),
  })
}

export function useUpdateInvoiceType(id?: number | null) {
  return useMutation<InvoiceType, UpdateInvoiceTypeRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Invoice type ID is required')
      return invoiceTypesAPI.updateInvoiceType(id, data)
    },
  })
}

export function useDeleteInvoiceType() {
  return useMutation<{ success: boolean; message: string }, number>({
    mutationFn: (id) => invoiceTypesAPI.deleteInvoiceType(id),
  })
}

export function useToggleInvoiceTypeStatus() {
  return useMutation<InvoiceType, number>({
    mutationFn: (id) => invoiceTypesAPI.toggleInvoiceTypeStatus(id),
  })
}
