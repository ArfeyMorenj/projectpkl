// User Form Component
'use client'

import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateUserRequest, User, UpdateUserRequest } from '@/lib/api/types/users'
import { toBooleanFlag } from '@/lib/utils/boolean'

interface UserFormProps {
  user?: User
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function UserForm({ user, onSubmit, onCancel, loading = false, error }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roles: user?.roles || [],
    status: toBooleanFlag(user?.status) ? 'active' : 'inactive',
  })

  const toggleRole = (role: string) => {
    setFormData((prev) => {
      const roles = prev.roles || []
      return {
        ...prev,
        roles: roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role],
      }
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card className="p-6 max-w-2xl">
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{user ? 'Password Baru' : 'Password *'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            disabled={loading}
            required={!user}
          />
        </div>

        <div className="space-y-3">
          <Label>Roles</Label>
          <div className="flex flex-wrap gap-4">
            {['super_admin', 'finance_admin', 'manager', 'sales_operator', 'ar_collector'].map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={(formData.roles || []).includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                  disabled={loading}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="status"
            checked={toBooleanFlag(formData.status)}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, status: checked ? 'active' : 'inactive' }))
            }
            disabled={loading}
          />
          <Label htmlFor="status" className="cursor-pointer">
            Aktif
          </Label>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
