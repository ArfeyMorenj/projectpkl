// Master Item Product Management Custom Hooks
'use client'

import { useEffect, useState } from 'react'
import { ENDPOINTS } from '../endpoints'
import * as masterItemProductsAPI from '../master-item-products'
import type {
  CreateMasterItemProductRequest,
  MasterItemProduct,
  UpdateMasterItemProductRequest,
} from '../types/master-item-products'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

export function useMasterItemProducts() {
  return useFetch<MasterItemProduct[]>(ENDPOINTS.MASTER_ITEM_PRODUCTS.LIST)
}

export function useMasterItemProductDetail(id?: string | number | null) {
  return useFetch<MasterItemProduct | null>(id ? ENDPOINTS.MASTER_ITEM_PRODUCTS.GET(id) : null, {
    skip: !id,
  })
}

export function useMasterItemProductsSearch(searchTerm: string = '', refreshKey = 0) {
  const [results, setResults] = useState<MasterItemProduct[]>([])
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
        const data = await masterItemProductsAPI.searchMasterItemProducts(term)
        setResults(data)
      } catch (err) {
        setResults([])
        setError(err instanceof Error ? err : new Error('Search failed'))
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, refreshKey])

  return { results, loading, error }
}

export function useCreateMasterItemProduct() {
  return useMutation<MasterItemProduct, CreateMasterItemProductRequest>({
    mutationFn: (data) => masterItemProductsAPI.createMasterItemProduct(data),
  })
}

export function useUpdateMasterItemProduct(id?: string | number | null) {
  return useMutation<MasterItemProduct, UpdateMasterItemProductRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Master item product ID is required')
      return masterItemProductsAPI.updateMasterItemProduct(id, data)
    },
  })
}

export function useDeleteMasterItemProduct() {
  return useMutation<{ success: boolean; message: string }, string | number>({
    mutationFn: (id) => masterItemProductsAPI.deleteMasterItemProduct(id),
  })
}

export function useToggleMasterItemProductStatus() {
  return useMutation<MasterItemProduct, string | number>({
    mutationFn: (id) => masterItemProductsAPI.toggleMasterItemProductStatus(id),
  })
}
