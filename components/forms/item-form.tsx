// Item Form Component
'use client'

import { useState } from 'react'
import { Item, CreateItemRequest } from '@/lib/api/types/items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toBooleanFlag } from '@/lib/utils/boolean'

interface ItemFormProps {
  item?: Item
  onSubmit: (data: CreateItemRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function ItemForm({ item, onSubmit, onCancel, loading = false, error }: ItemFormProps) {
  const [formData, setFormData] = useState<CreateItemRequest>({
    code: item?.code || '',
    name: item?.name || '',
    acc_omzet: item?.acc_omzet || '',
    acc_piutang: item?.acc_piutang || '',
    cdf_omzet: item?.cdf_omzet || '',
    cdf_piutang: item?.cdf_piutang || '',
    is_active: item?.is_active === undefined ? true : toBooleanFlag(item.is_active),
  })

  const handleInputChange = <K extends keyof CreateItemRequest>(
    field: K,
    value: CreateItemRequest[K]
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
            <Label htmlFor="code">Kode Item *</Label>
            <Input
              id="code"
              placeholder="ITM001"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Item *</Label>
            <Input
              id="name"
              placeholder="Nama Item"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acc_omzet">Acc Omzet *</Label>
            <Input
              id="acc_omzet"
              placeholder="5033"
              value={formData.acc_omzet}
              onChange={(e) => handleInputChange('acc_omzet', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acc_piutang">Acc Piutang *</Label>
            <Input
              id="acc_piutang"
              placeholder="1535"
              value={formData.acc_piutang}
              onChange={(e) => handleInputChange('acc_piutang', e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cdf_omzet">CDF Omzet *</Label>
            <Input
              id="cdf_omzet"
              placeholder="5033"
              value={formData.cdf_omzet}
              onChange={(e) => handleInputChange('cdf_omzet', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cdf_piutang">CDF Piutang *</Label>
            <Input
              id="cdf_piutang"
              placeholder="1535"
              value={formData.cdf_piutang}
              onChange={(e) => handleInputChange('cdf_piutang', e.target.value)}
              disabled={loading}
              required
            />
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
