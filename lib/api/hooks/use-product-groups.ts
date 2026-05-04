// Product Group Management Custom Hooks
'use client'

import { useEffect, useState } from 'react'
import * as productGroupsAPI from '../product-groups'
import { ENDPOINTS } from '../endpoints'
import type {
  CreateProductGroupRequest,
  ProductGroup,
  UpdateProductGroupRequest,
} from '../types/product-groups'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

export function useProductGroups() {
  return useFetch<ProductGroup[]>(ENDPOINTS.PRODUCT_GROUPS.LIST)
}

export function useProductGroupDetail(id?: number | null) {
  return useFetch<ProductGroup | null>(id ? ENDPOINTS.PRODUCT_GROUPS.GET(id) : null, {
    skip: !id,
  })
}

export function useProductGroupsSearch(searchTerm: string = '') {
  const [results, setResults] = useState<ProductGroup[]>([])
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
        const data = await productGroupsAPI.searchProductGroups(searchTerm.trim())
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

export function useCreateProductGroup() {
  return useMutation<ProductGroup, CreateProductGroupRequest>({
    mutationFn: (data) => productGroupsAPI.createProductGroup(data),
  })
}

export function useUpdateProductGroup(id?: number | null) {
  return useMutation<ProductGroup, UpdateProductGroupRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Product group ID is required')
      return productGroupsAPI.updateProductGroup(id, data)
    },
  })
}

export function useDeleteProductGroup() {
  return useMutation<{ success: boolean; message: string }, number>({
    mutationFn: (id) => productGroupsAPI.deleteProductGroup(id),
  })
}
