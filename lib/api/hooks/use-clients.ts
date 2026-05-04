// Client Management Custom Hooks
import { useState, useEffect } from 'react'
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
} from '../types/clients'
import * as clientsAPI from '../clients'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

/**
 * useClients - Fetch all clients
 */
export function useClients() {
  return useFetch<Client[]>('/clients', {
    skip: false,
  })
}

/**
 * useClientDetail - Fetch single client by ID
 */
export function useClientDetail(id?: number) {
  return useFetch<Client | null>(id ? `/clients/${id}` : null, {
    skip: !id,
  })
}

/**
 * useClientsSearch - Search clients with debounce
 */
export function useClientsSearch(searchTerm: string = '') {
  const [results, setResults] = useState<Client[]>([])
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
        const data = await clientsAPI.searchClients(searchTerm)
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
 * useCreateClient - Create new client mutation
 */
export function useCreateClient() {
  return useMutation<Client, CreateClientRequest>({
    mutationFn: (data) => clientsAPI.createClient(data),
  })
}

/**
 * useUpdateClient - Update client mutation
 */
export function useUpdateClient(id?: number) {
  return useMutation<Client, UpdateClientRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Client ID is required')
      return clientsAPI.updateClient(id, data)
    },
  })
}

/**
 * useDeleteClient - Delete client mutation
 */
export function useDeleteClient() {
  return useMutation<{ success: boolean; message: string }, number>({
    mutationFn: (id) => clientsAPI.deleteClient(id),
  })
}
