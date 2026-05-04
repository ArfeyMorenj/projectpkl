// User Management Custom Hooks
'use client'

import { useEffect, useState } from 'react'
import { ENDPOINTS } from '../endpoints'
import * as usersAPI from '../users'
import type {
  AssignRoleRequest,
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '../types/users'
import { useFetch } from './use-fetch'
import { useMutation } from './use-mutation'

export function useUsers() {
  return useFetch<User[]>(ENDPOINTS.USERS.LIST)
}

export function useUserDetail(id?: string | number | null) {
  return useFetch<User | null>(id ? ENDPOINTS.USERS.GET(id) : null, {
    skip: !id,
  })
}

export function useCreateUser() {
  return useMutation<User, CreateUserRequest>({
    mutationFn: (data) => usersAPI.createUser(data),
  })
}

export function useUpdateUser(id?: string | number | null) {
  return useMutation<User, UpdateUserRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('User ID is required')
      return usersAPI.updateUser(id, data)
    },
  })
}

export function useDeleteUser() {
  return useMutation<{ success: boolean; message: string }, string | number>({
    mutationFn: (id) => usersAPI.deleteUser(id),
  })
}

export function useAssignRole() {
  return useMutation<User, { id: string | number; data: AssignRoleRequest }>({
    mutationFn: ({ id, data }) => usersAPI.assignRole(id, data),
  })
}

export function useToggleUserStatus() {
  return useMutation<User, string | number>({
    mutationFn: (id) => usersAPI.toggleUserStatus(id),
  })
}

