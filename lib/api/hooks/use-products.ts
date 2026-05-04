// Product Management Custom Hooks
import { useState, useEffect } from 'react'
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types/products'
import * as productsAPI from '../products'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

/**
 * useProducts - Fetch all products
 */
export function useProducts() {
  return useFetch<Product[]>('/products', {
    skip: false,
  })
}

/**
 * useProductDetail - Fetch single product by ID
 */
export function useProductDetail(id?: number) {
  return useFetch<Product | null>(id ? `/products/${id}` : null, {
    skip: !id,
  })
}

/**
 * useProductsSearch - Search products with debounce
 */
export function useProductsSearch(searchTerm: string = '') {
  const [results, setResults] = useState<Product[]>([])
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
        const data = await productsAPI.searchProducts(searchTerm)
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
 * useCreateProduct - Create new product mutation
 */
export function useCreateProduct() {
  return useMutation<Product, CreateProductRequest>({
    mutationFn: (data) => productsAPI.createProduct(data),
  })
}

/**
 * useUpdateProduct - Update product mutation
 */
export function useUpdateProduct(id?: number) {
  return useMutation<Product, UpdateProductRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Product ID is required')
      return productsAPI.updateProduct(id, data)
    },
  })
}

/**
 * useDeleteProduct - Delete product mutation
 */
export function useDeleteProduct() {
  return useMutation<{ success: boolean; message: string }, number>({
    mutationFn: (id) => productsAPI.deleteProduct(id),
  })
}
