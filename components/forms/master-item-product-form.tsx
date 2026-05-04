// Master Item Product Form Component
'use client'

import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  CreateMasterItemProductRequest,
  MasterItemProduct,
} from '@/lib/api/types/master-item-products'

type LookupItem = { id: number; code: string; name: string }

function toBooleanFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'active', 'aktif', 'yes', 'y', 'on'].includes(normalized)
  }
  return false
}

interface MasterItemProductFormProps {
  itemProduct?: MasterItemProduct
  onSubmit: (data: CreateMasterItemProductRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function MasterItemProductForm({
  itemProduct,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: MasterItemProductFormProps) {
  const [formData, setFormData] = useState<CreateMasterItemProductRequest>({
    code: itemProduct?.code || '',
    name: itemProduct?.name || '',
    unit: itemProduct?.unit || '',
    price: itemProduct?.price ?? '',
    acc_omzet: itemProduct?.acc_omzet || '',
    acc_omzet_np: itemProduct?.acc_omzet_np || '',
    acc_piutang: itemProduct?.acc_piutang || '',
    cdf_piutang: itemProduct?.cdf_piutang || '',
    is_active: (() => {
      if (!itemProduct) return true

      const hasStatusField =
        'is_active' in itemProduct ||
        'status' in itemProduct ||
        'active' in (itemProduct as { active?: unknown }) ||
        'isActive' in (itemProduct as { isActive?: unknown })

      if (!hasStatusField) return true

      return (
        toBooleanFlag(itemProduct.is_active) ||
        toBooleanFlag((itemProduct as { status?: unknown }).status) ||
        toBooleanFlag((itemProduct as { active?: unknown }).active) ||
        toBooleanFlag((itemProduct as { isActive?: unknown }).isActive)
      )
    })(),
  })

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
            <Label htmlFor="code">Kode *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              disabled={loading}
              required
            />
          </div>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
              disabled={loading}
              placeholder="UNIT"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acc_omzet">Acc Omzet *</Label>
            <Input
              id="acc_omzet"
              value={formData.acc_omzet}
              onChange={(e) => setFormData((prev) => ({ ...prev, acc_omzet: e.target.value }))}
              disabled={loading}
              placeholder="5032"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc_omzet_np">Acc Omzet Non Pajak</Label>
            <Input
              id="acc_omzet_np"
              value={formData.acc_omzet_np || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, acc_omzet_np: e.target.value }))}
              disabled={loading}
              placeholder="5033"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acc_piutang">Acc Piutang *</Label>
            <Input
              id="acc_piutang"
              value={formData.acc_piutang}
              onChange={(e) => setFormData((prev) => ({ ...prev, acc_piutang: e.target.value }))}
              disabled={loading}
              placeholder="1532"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cdf_piutang">CDF Piutang *</Label>
            <Input
              id="cdf_piutang"
              value={formData.cdf_piutang}
              onChange={(e) => setFormData((prev) => ({ ...prev, cdf_piutang: e.target.value }))}
              disabled={loading}
              placeholder="1533"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={Boolean(formData.is_active)}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_active: Boolean(checked) }))
            }
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
