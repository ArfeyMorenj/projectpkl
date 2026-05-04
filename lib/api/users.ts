// User Management API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  AssignRoleRequest,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserDeleteResponse,
  UserResponse,
  UsersListResponse,
} from './types/users'

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<UsersListResponse>(ENDPOINTS.USERS.LIST)
  return response.data || []
}

export async function getUserById(id: string | number): Promise<User> {
  const response = await apiClient.get<UserResponse>(ENDPOINTS.USERS.GET(id))
  return response.data
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<UserResponse>(ENDPOINTS.USERS.CREATE, data)
  return response.data
}

export async function updateUser(id: string | number, data: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put<UserResponse>(ENDPOINTS.USERS.UPDATE(id), data)
  return response.data
}

export async function deleteUser(id: string | number): Promise<UserDeleteResponse> {
  return apiClient.delete<UserDeleteResponse>(ENDPOINTS.USERS.DELETE(id))
}

export async function assignRole(id: string | number, data: AssignRoleRequest): Promise<User> {
  const response = await apiClient.post<UserResponse>(ENDPOINTS.USERS.ASSIGN_ROLE(id), data)
  return response.data
}

export async function toggleUserStatus(id: string | number): Promise<User> {
  const response = await apiClient.post<UserResponse>(ENDPOINTS.USERS.TOGGLE_STATUS(id))
  return response.data
}
