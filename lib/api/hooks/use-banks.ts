// Banks hooks - Data fetching and mutations
'use client'

import { useEffect, useState } from 'react'
import { useFetch, useMutation } from './use-fetch'
import * as banksAPI from '@/lib/api/banks'
import type { Bank, CreateBankRequest, UpdateBankRequest } from '@/lib/api/types/banks'
import { ENDPOINTS } from '../endpoints'

// ==================== QUERIES ====================

/**
 * Fetch all banks
 * Returns: { data (Bank[]), loading, error, refetch }
 */
export function useBanks() {
  return useFetch<Bank[]>('/banks', {
    skip: false,
  })
}

/**
 * Fetch single bank by ID
 * Returns: { data (Bank), loading, error, refetch }
 */
export function useBankDetail(id: string | number | null) {
  return useFetch<Bank>(id ? ENDPOINTS.BANKS.GET(id) : null, {
    skip: !id,
  })
}

/**
 * Search banks with debounce
 * Returns: { data (Bank[]), loading, error }
 * Automatically debounces search term
 */
export function useBanksSearch(searchTerm: string) {
  const [debouncedTerm, setDebouncedTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const url =
    debouncedTerm.length >= 2
      ? `${ENDPOINTS.BANKS.SEARCH}?q=${encodeURIComponent(debouncedTerm)}`
      : null

  return useFetch<Bank[]>(url, {
    skip: !url,
  })
}

// ==================== MUTATIONS ====================

/**
 * Create new bank
 * Returns: { mutate, data, loading, error }
 * Usage:
 *   const { mutate: createBank } = useCreateBank()
 *   await createBank({ code: 'BK01', name: '...' })
 */
export function useCreateBank() {
  return useMutation<Bank, CreateBankRequest>({
    mutationFn: (data) => banksAPI.createBank(data),
  })
}

/**
 * Update existing bank
 * Usage:
 *   const { mutate: updateBank } = useUpdateBank()
 *   await updateBank(bankId, { code: 'BK02', name: '...' })
 */
export function useUpdateBank(id: string | number | null) {
  return useMutation<Bank, UpdateBankRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Bank ID required')
      return banksAPI.updateBank(id, data)
    },
  })
}

/**
 * Delete bank
 * Usage:
 *   const { mutate: deleteBank } = useDeleteBank()
 *   await deleteBank(bankId)
 */
export function useDeleteBank() {
  return useMutation<void, string | number>({
    mutationFn: (id) => banksAPI.deleteBank(id),
  })
}
