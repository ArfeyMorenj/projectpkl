// Company Form Component
'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Company, CreateCompanyRequest } from '@/lib/api/types/companies'

export type CompanyFormSubmitData = CreateCompanyRequest

interface CompanyFormProps {
  company?: Company
  onSubmit: (data: CompanyFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

function valueOrEmpty(value: string | number | null | undefined) {
  return value ?? ''
}

export function CompanyForm({
  company,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    code: company?.code || '',
    name: company?.name || '',
    address: company?.address || '',
    address_invoice: company?.address_invoice || '',
    city: company?.city || '',
    city_invoice: company?.city_invoice || '',
    phone: company?.phone || '',
    fax: company?.fax || '',
    email: company?.email || '',
    website: company?.website || '',
    npwp: company?.npwp || '',
    npkp: company?.npkp || '',
    tax_name: company?.tax_name || '',
    tax_position: company?.tax_position || '',
    invoice_name: company?.invoice_name || '',
    invoice_position: company?.invoice_position || '',
    invoice_name_2: company?.invoice_name_2 || '',
    invoice_position_2: company?.invoice_position_2 || '',
    invoice_tolerance_days: valueOrEmpty(company?.invoice_tolerance_days),
    upgrade_days: valueOrEmpty(company?.upgrade_days),
    letterhead_top: company?.letterhead_top || '',
    letterhead_bottom: company?.letterhead_bottom || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card className="max-w-4xl p-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Informasi Dasar
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Alamat dan Kontak
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address">Alamat *</Label>
              <textarea
                id="address"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_invoice">Alamat Invoice</Label>
              <textarea
                id="address_invoice"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={formData.address_invoice || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, address_invoice: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Kota *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city_invoice">Kota Invoice</Label>
              <Input
                id="city_invoice"
                value={formData.city_invoice || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, city_invoice: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={formData.fax || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, fax: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pajak dan Penandatangan
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="npwp">NPWP *</Label>
              <Input
                id="npwp"
                value={formData.npwp}
                onChange={(e) => setFormData((prev) => ({ ...prev, npwp: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npkp">NPKP</Label>
              <Input
                id="npkp"
                value={formData.npkp || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, npkp: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tax_name">Nama Pajak</Label>
              <Input
                id="tax_name"
                value={formData.tax_name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, tax_name: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_position">Jabatan Pajak</Label>
              <Input
                id="tax_position"
                value={formData.tax_position || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, tax_position: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_name">Nama Invoice 1</Label>
              <Input
                id="invoice_name"
                value={formData.invoice_name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_name: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_position">Jabatan Invoice 1</Label>
              <Input
                id="invoice_position"
                value={formData.invoice_position || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_position: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_name_2">Nama Invoice 2</Label>
              <Input
                id="invoice_name_2"
                value={formData.invoice_name_2 || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_name_2: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_position_2">Jabatan Invoice 2</Label>
              <Input
                id="invoice_position_2"
                value={formData.invoice_position_2 || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_position_2: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_tolerance_days">Invoice Tolerance Days</Label>
              <Input
                id="invoice_tolerance_days"
                value={String(formData.invoice_tolerance_days ?? '')}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, invoice_tolerance_days: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upgrade_days">Upgrade Days</Label>
              <Input
                id="upgrade_days"
                value={String(formData.upgrade_days ?? '')}
                onChange={(e) => setFormData((prev) => ({ ...prev, upgrade_days: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Letterhead
            </h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letterhead_top">Letterhead Top</Label>
            <textarea
              id="letterhead_top"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              value={formData.letterhead_top || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, letterhead_top: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letterhead_bottom">Letterhead Bottom</Label>
            <textarea
              id="letterhead_bottom"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              value={formData.letterhead_bottom || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, letterhead_bottom: e.target.value }))
              }
              disabled={loading}
            />
          </div>
        </section>

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
