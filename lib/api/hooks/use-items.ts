// Item Management Custom Hooks
import { useState, useEffect } from 'react'
import {
  Item,
  CreateItemRequest,
  UpdateItemRequest,
} from '../types/items'
import * as itemsAPI from '../items'
import { useFetch, useMutation } from './use-fetch'

/**
 * useItems - Fetch all items
 */
export function useItems() {
  return useFetch<Item[]>('/items', {
    skip: false,
  })
}

/**
 * useItemDetail - Fetch single item by ID
 */
export function useItemDetail(id?: number) {
  return useFetch<Item | null>(id ? `/items/${id}` : null, {
    skip: !id,
  })
}

/**
 * useItemsSearch - Search items with debounce
 */
export function useItemsSearch(searchTerm: string = '') {
  const [results, setResults] = useState<Item[]>([])
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
        const data = await itemsAPI.searchItems(searchTerm)
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
 * useCreateItem - Create new item mutation
 */
export function useCreateItem() {
  return useMutation<Item, CreateItemRequest>({
    mutationFn: (data) => itemsAPI.createItem(data),
  })
}

/**
 * useUpdateItem - Update item mutation
 */
export function useUpdateItem(id?: number) {
  return useMutation<Item, UpdateItemRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Item ID is required')
      return itemsAPI.updateItem(id, data)
    },
  })
}

/**
 * useDeleteItem - Delete item mutation
 */
export function useDeleteItem() {
  return useMutation<{ success: boolean; message: string }, number>({
    mutationFn: (id) => itemsAPI.deleteItem(id),
  })
}
