// Product Group Form Component
'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateProductGroupRequest, ProductGroup } from '@/lib/api/types/product-groups'
import { toBooleanFlag } from '@/lib/utils/boolean'

export type ProductGroupFormSubmitData = CreateProductGroupRequest

interface ProductGroupFormProps {
  group?: ProductGroup
  onSubmit: (data: ProductGroupFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function ProductGroupForm({
  group,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: ProductGroupFormProps) {
  const [formData, setFormData] = useState<CreateProductGroupRequest>({
    code: group?.code || '',
    name: group?.name || '',
    acc_omzet: group?.acc_omzet ? String(group.acc_omzet) : '',
    cdf_piutang: group?.cdf_piutang ? String(group.cdf_piutang) : '',
    is_active: group?.is_active === undefined ? true : toBooleanFlag(group.is_active),
  })

  const handleInputChange = (field: keyof CreateProductGroupRequest, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Grup *</Label>
            <Input
              id="code"
              placeholder="GRP001"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Grup *</Label>
            <Input
              id="name"
              placeholder="Nama Grup Produk"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acc_omzet">ACC Omzet *</Label>
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
