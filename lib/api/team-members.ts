// Team Member Management API Functions
import { apiClient } from './client'
import {
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  TeamMemberResponse,
  TeamMembersListResponse,
  TeamMembersSearchResponse,
  TeamMemberDeleteResponse,
} from './types/team-members'
import { ENDPOINTS } from './endpoints'

/**
 * Get all team members
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await apiClient.get<TeamMembersListResponse>(ENDPOINTS.TEAM_MEMBERS.LIST)
    return response.data || []
  } catch (error) {
    console.error('Error fetching team members:', error)
    throw error
  }
}

/**
 * Get team member detail by ID
 */
export async function getTeamMemberById(id: number): Promise<TeamMember> {
  try {
    const response = await apiClient.get<TeamMemberResponse>(`${ENDPOINTS.TEAM_MEMBERS.LIST}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching team member ${id}:`, error)
    throw error
  }
}

/**
 * Search team members by keyword
 */
export async function searchTeamMembers(query: string): Promise<TeamMember[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await apiClient.get<TeamMembersSearchResponse>(
      `${ENDPOINTS.TEAM_MEMBERS.LIST}/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error searching team members:', error)
    throw error
  }
}

/**
 * Create new team member
 */
export async function createTeamMember(data: CreateTeamMemberRequest): Promise<TeamMember> {
  try {
    const response = await apiClient.post<TeamMemberResponse>(ENDPOINTS.TEAM_MEMBERS.LIST, data)
    return response.data
  } catch (error) {
    console.error('Error creating team member:', error)
    throw error
  }
}

/**
 * Update existing team member
 */
export async function updateTeamMember(id: number, data: UpdateTeamMemberRequest): Promise<TeamMember> {
  try {
    const response = await apiClient.put<TeamMemberResponse>(`${ENDPOINTS.TEAM_MEMBERS.LIST}/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating team member ${id}:`, error)
    throw error
  }
}

/**
 * Delete team member
 */
export async function deleteTeamMember(id: number): Promise<TeamMemberDeleteResponse> {
  try {
    const response = await apiClient.delete<TeamMemberDeleteResponse>(`${ENDPOINTS.TEAM_MEMBERS.LIST}/${id}`)
    return response
  } catch (error) {
    console.error(`Error deleting team member ${id}:`, error)
    throw error
  }
}
