// Team Member Management Types
// Based on GET /api/team-members response from Postman collection

export interface TeamMember {
  id: number
  code: string
  name: string
  position: string | null
  status: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateTeamMemberRequest {
  code: string
  name: string
  position: string
  status: string
  is_active?: boolean
}

export interface UpdateTeamMemberRequest extends CreateTeamMemberRequest {}

// Response types
export interface TeamMemberResponse {
  success: boolean
  data: TeamMember
  message?: string
}

export interface TeamMembersListResponse {
  success: boolean
  data: TeamMember[]
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface TeamMembersSearchResponse {
  success: boolean
  data: TeamMember[]
  message?: string
}

export interface TeamMemberDeleteResponse {
  success: boolean
  message: string
}
