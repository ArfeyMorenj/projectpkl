'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Edit2, KeyRound, Plus, Power, Trash2 } from 'lucide-react'
import { UserForm } from '@/components/forms/user-form'
import {
  useAssignRole,
  useCreateUser,
  useDeleteUser,
  useToggleUserStatus,
  useUpdateUser,
  useUsers,
} from '@/lib/api/hooks'
import type { CreateUserRequest, UpdateUserRequest, User } from '@/lib/api/types/users'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function isUserActive(user: User) {
  return toBooleanFlag(user.status)
}

export function UsersModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleToAssign, setRoleToAssign] = useState('manager')

  const { data: users, loading, error, refetch } = useUsers()
  const { mutate: createUser, loading: createLoading, error: createError } = useCreateUser()
  const { mutate: updateUser, loading: updateLoading, error: updateError } = useUpdateUser(
    selectedUser?.id ?? null
  )
  const { mutate: deleteUser, loading: deleteLoading } = useDeleteUser()
  const { mutate: assignRole, loading: assignRoleLoading } = useAssignRole()
  const { mutate: toggleStatus, loading: toggleLoading } = useToggleUserStatus()
  const { rows: userRows, setRows: setUserRows } = usePersistedRows<User>('fitart_users_rows', users)

  const displayedUsers =
    searchTerm.trim().length >= 2
      ? userRows.filter((user) =>
          [user.name, user.email, Array.isArray(user.roles) ? user.roles.join(' ') : '']
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : userRows

  const handleCreateUser = async (formData: CreateUserRequest | UpdateUserRequest) => {
    const createdUser = await createUser(formData as CreateUserRequest)
    setUserRows((current) => upsertPersistedRow(current, createdUser))
    setIsCreateDialogOpen(false)
  }

  const handleUpdateUser = async (formData: CreateUserRequest | UpdateUserRequest) => {
    const updatedUser = await updateUser(formData as UpdateUserRequest)
    setUserRows((current) => upsertPersistedRow(current, updatedUser))
    setIsEditDialogOpen(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    await deleteUser(selectedUser.id)
    setUserRows((current) => softDeletePersistedRow(current, selectedUser.id))
    setIsDeleteDialogOpen(false)
  }

  const handleAssignRole = async () => {
    if (!selectedUser) return
    const updatedUser = await assignRole({ id: selectedUser.id, data: { role: roleToAssign } })
    setUserRows((current) => upsertPersistedRow(current, updatedUser))
    setIsRoleDialogOpen(false)
  }

  const handleToggleStatus = async (user: User) => {
    const updatedUser = await toggleStatus(user.id)
    setUserRows((current) => upsertPersistedRow(current, updatedUser))
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
          <Button className="ml-2" onClick={refetch} size="sm">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Users</h1>
          <p className="text-muted-foreground">Kelola user backend untuk role super_admin.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah User
        </Button>
      </div>

      <div className={shellClass}>
        <Input
          placeholder="Cari nama, email, atau role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Roles</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user.roles) ? user.roles : []).map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isUserActive(user) ? 'default' : 'secondary'}>
                      {isUserActive(user) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading || deleteLoading || assignRoleLoading || toggleLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsRoleDialogOpen(true)
                        }}
                        disabled={updateLoading || deleteLoading || assignRoleLoading || toggleLoading}
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggleLoading || updateLoading || deleteLoading || assignRoleLoading}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={deleteLoading || updateLoading || assignRoleLoading || toggleLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada user ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Tambah User</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Pilih role yang ingin ditambahkan ke user ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="role">Role</Label>
            <Select value={roleToAssign} onValueChange={setRoleToAssign}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">super_admin</SelectItem>
                <SelectItem value="finance_admin">finance_admin</SelectItem>
                <SelectItem value="manager">manager</SelectItem>
                <SelectItem value="sales_operator">sales_operator</SelectItem>
                <SelectItem value="ar_collector">ar_collector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssignRole} disabled={assignRoleLoading}>
              {assignRoleLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus User?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus user <strong>{selectedUser?.name}</strong>?
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

