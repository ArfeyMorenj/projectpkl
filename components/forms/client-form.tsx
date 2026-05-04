// Client Form Component
'use client'

import { useState } from 'react'
import { Client, CreateClientRequest } from '@/lib/api/types/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toBooleanFlag } from '@/lib/utils/boolean'

interface ClientFormProps {
  client?: Client
  onSubmit: (data: CreateClientRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function ClientForm({ client, onSubmit, onCancel, loading = false, error }: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientRequest>({
    code: client?.code || '',
    status: client?.status || 'NON GROUP',
    name: client?.name || '',
    address: client?.address || '',
    city: client?.city || '',
    phone: client?.phone || '',
    fax: client?.fax || '',
    npwp: client?.npwp || '',
    npkp: client?.npkp || '',
    tax_name: client?.tax_name || '',
    tax_address: client?.tax_address || '',
    credit_term_days: client?.credit_term_days || 0,
    is_active: client?.is_active === undefined ? true : toBooleanFlag(client.is_active),
  })

  const handleInputChange = <K extends keyof CreateClientRequest>(
    field: K,
    value: CreateClientRequest[K]
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
        {/* Code & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Klien *</Label>
            <Input
              id="code"
              placeholder="0000"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={loading}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NON GROUP">NON GROUP</SelectItem>
                <SelectItem value="GROUP">GROUP</SelectItem>
                <SelectItem value="INDIVIDUAL">INDIVIDUAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nama Klien *</Label>
          <Input
            id="name"
            placeholder="PUBLIC"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Address & City */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              placeholder="Jl. Raya..."
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              placeholder="SURABAYA"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone & Fax */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              placeholder="031-..."
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fax">Fax</Label>
            <Input
              id="fax"
              placeholder="031-..."
              value={formData.fax || ''}
              onChange={(e) => handleInputChange('fax', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* NPWP & NPKP */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="npwp">NPWP</Label>
            <Input
              id="npwp"
              placeholder="00.000.000.0-000.000"
              value={formData.npwp || ''}
              onChange={(e) => handleInputChange('npwp', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npkp">NPKP</Label>
            <Input
              id="npkp"
              placeholder="00.000.000.0"
              value={formData.npkp || ''}
              onChange={(e) => handleInputChange('npkp', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Tax Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_name">Nama PKP</Label>
            <Input
              id="tax_name"
              placeholder="Nama Pengusaha Kena Pajak"
              value={formData.tax_name || ''}
              onChange={(e) => handleInputChange('tax_name', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_address">Alamat PKP</Label>
            <Input
              id="tax_address"
              placeholder="Alamat PKP"
              value={formData.tax_address || ''}
              onChange={(e) => handleInputChange('tax_address', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Credit Term */}
        <div className="space-y-2">
          <Label htmlFor="credit_term_days">Jangka Waktu Kredit (Hari)</Label>
          <Input
            id="credit_term_days"
            type="number"
            min="0"
            value={formData.credit_term_days || 0}
            onChange={(e) =>
              handleInputChange('credit_term_days', parseInt(e.target.value) || 0)
            }
            disabled={loading}
          />
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
