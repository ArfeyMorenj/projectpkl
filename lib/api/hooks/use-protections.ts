// Protection custom hooks
'use client'

import { useEffect, useState } from 'react'
import { ENDPOINTS } from '../endpoints'
import * as protectionsAPI from '@/lib/api/protections'
import type {
  Protection,
  CreateProtectionRequest,
  UpdateProtectionRequest,
} from '@/lib/api/types/protections'
import { useFetch, useMutation } from './use-fetch'

export function useProtections() {
  return useFetch<Protection[]>(ENDPOINTS.PROTECTIONS.LIST)
}

export function useProtectionDetail(id: string | number | null) {
  return useFetch<Protection>(id ? ENDPOINTS.PROTECTIONS.GET(id) : null, {
    skip: !id,
  })
}

export function useCreateProtection() {
  return useMutation<Protection, CreateProtectionRequest>({
    mutationFn: (data) => protectionsAPI.createProtection(data),
  })
}

export function useUpdateProtection(id: string | number | null) {
  return useMutation<Protection, UpdateProtectionRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Protection ID required')
      return protectionsAPI.updateProtection(id, data)
    },
  })
}

export function useDeleteProtection() {
  return useMutation<void, string | number>({
    mutationFn: (id) => protectionsAPI.deleteProtection(id),
  })
}

export function useProtectionSearch(searchTerm: string) {
  const [results, setResults] = useState<Protection[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = searchTerm.trim()
    if (!term) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const protections = await protectionsAPI.getProtections()
        const query = term.toLowerCase()
        setResults(
          protections.filter((item) => {
            const period = item.period.toLowerCase()
            const protectedBy = String(item.protected_by)
            const protectedAt = item.protected_at.toLowerCase()
            return (
              period.includes(query) ||
              protectedBy.includes(query) ||
              protectedAt.includes(query)
            )
          })
        )
      } catch (error) {
        console.error('Failed to search protections:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return { results, loading }
}
