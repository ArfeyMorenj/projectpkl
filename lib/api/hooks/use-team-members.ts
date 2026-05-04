// Team Member Management Custom Hooks
import { useState, useEffect } from 'react'
import {
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from '../types/team-members'
import * as teamMembersAPI from '../team-members'
import { useFetch, useMutation } from './use-fetch'

/**
 * useTeamMembers - Fetch all team members
 */
export function useTeamMembers() {
  return useFetch<TeamMember[]>('/team-members', {
    skip: false,
  })
}

/**
 * useTeamMemberDetail - Fetch single team member by ID
 */
export function useTeamMemberDetail(id?: number) {
  return useFetch<TeamMember | null>(id ? `/team-members/${id}` : null, {
    skip: !id,
  })
}

/**
 * useTeamMembersSearch - Search team members with debounce
 */
export function useTeamMembersSearch(searchTerm: string = '') {
  const [results, setResults] = useState<TeamMember[]>([])
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
        const data = await teamMembersAPI.searchTeamMembers(searchTerm)
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
 * useCreateTeamMember - Create new team member mutation
 */
export function useCreateTeamMember() {
  return useMutation<TeamMember, CreateTeamMemberRequest>({
    mutationFn: (data) => teamMembersAPI.createTeamMember(data),
  })
}

/**
 * useUpdateTeamMember - Update team member mutation
 */
export function useUpdateTeamMember(id?: number) {
  return useMutation<TeamMember, UpdateTeamMemberRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Team member ID is required')
      return teamMembersAPI.updateTeamMember(id, data)
    },
  })
}

/**
 * useDeleteTeamMember - Delete team member mutation
 */
export function useDeleteTeamMember() {
  return useMutation<{ success: boolean; message: string }, number>({
    mutationFn: (id) => teamMembersAPI.deleteTeamMember(id),
  })
}
