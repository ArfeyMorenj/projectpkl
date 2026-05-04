// Team Member Form Component
'use client'

import { useState } from 'react'
import { TeamMember, CreateTeamMemberRequest } from '@/lib/api/types/team-members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toBooleanFlag } from '@/lib/utils/boolean'

interface TeamMemberFormProps {
  member?: TeamMember
  onSubmit: (data: CreateTeamMemberRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function TeamMemberForm({ member, onSubmit, onCancel, loading = false, error }: TeamMemberFormProps) {
  const [formData, setFormData] = useState<CreateTeamMemberRequest>({
    code: member?.code || '',
    name: member?.name || '',
    position: member?.position || '',
    status: member?.status || 'STATUS1',
    is_active: member?.is_active === undefined ? true : toBooleanFlag(member.is_active),
  })

  const handleInputChange = <K extends keyof CreateTeamMemberRequest>(
    field: K,
    value: CreateTeamMemberRequest[K]
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
        {/* Code & Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode *</Label>
            <Input
              id="code"
              placeholder="03"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Position & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="position">Posisi *</Label>
            <Input
              id="position"
              placeholder="ADMINISTRASI"
              value={formData.position || ''}
              onChange={(e) => handleInputChange('position', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STATUS1">STATUS1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', Boolean(checked))}
            disabled={loading}
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Aktif
          </Label>
        </div>

        {/* Buttons */}
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
