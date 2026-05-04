// Invoice Type Form Component
'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateInvoiceTypeRequest, InvoiceType } from '@/lib/api/types/invoice-types'
import { toBooleanFlag } from '@/lib/utils/boolean'

export type InvoiceTypeFormSubmitData = CreateInvoiceTypeRequest

interface InvoiceTypeFormProps {
  invoiceType?: InvoiceType
  onSubmit: (data: InvoiceTypeFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function InvoiceTypeForm({
  invoiceType,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: InvoiceTypeFormProps) {
  const [formData, setFormData] = useState<CreateInvoiceTypeRequest>({
    code: invoiceType?.code || '',
    name: invoiceType?.name || '',
    is_license: invoiceType?.is_license === undefined ? false : toBooleanFlag(invoiceType.is_license),
    auto_create_number:
      invoiceType?.auto_create_number === undefined ? true : toBooleanFlag(invoiceType.auto_create_number),
    is_active: invoiceType?.is_active === undefined ? true : toBooleanFlag(invoiceType.is_active),
  })

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
            <Label htmlFor="code">Kode Invoice Type *</Label>
            <Input
              id="code"
              placeholder="S01"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              placeholder="PENDAPATAN LICENSE"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_license"
            checked={formData.is_license}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_license: Boolean(checked) }))
            }
            disabled={loading}
          />
          <Label htmlFor="is_license" className="cursor-pointer">
            Tipe license
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto_create_number"
            checked={formData.auto_create_number}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, auto_create_number: Boolean(checked) }))
            }
            disabled={loading}
          />
          <Label htmlFor="auto_create_number" className="cursor-pointer">
            Auto create number
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active ?? true}
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
