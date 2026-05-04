'use client'

import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Client } from '@/lib/api/types/clients'
import type { WorkOrder } from '@/lib/api/types/work-orders'
import type { License, CreateLicenseRequest } from '@/lib/api/types/licenses'

export type LicenseFormSubmitData = CreateLicenseRequest

interface LicenseFormProps {
  license?: Partial<License>
  onSubmit: (data: LicenseFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  clients?: Client[]
  workOrders?: WorkOrder[]
}

export function LicenseForm({
  license,
  onSubmit,
  onCancel,
  loading,
  error,
  clients = [],
  workOrders = [],
}: LicenseFormProps) {
  const workOrderMap = useMemo(() => new Map(workOrders.map((wo) => [wo.id, wo])), [workOrders])

  const [formData, setFormData] = useState({
    license_number: license?.license_number || '',
    client_id: String(license?.client_id ?? ''),
    work_order_id: String(license?.work_order_id ?? ''),
    license_date: license?.license_date || new Date().toISOString().split('T')[0],
    due_date: license?.due_date || '',
    subtotal: String(license?.subtotal ?? ''),
    discount: String(license?.discount ?? 0),
    tax: String(license?.tax ?? 0),
    total: String(license?.total ?? ''),
    status: license?.status || 'unpaid',
    notes: license?.notes || '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.license_number.trim()) errors.license_number = 'Nomor lisensi harus diisi'
    if (!formData.client_id) errors.client_id = 'Klien harus dipilih'
    if (!formData.work_order_id) errors.work_order_id = 'Work order harus dipilih'
    if (!formData.license_date) errors.license_date = 'Tanggal lisensi harus diisi'
    if (!formData.due_date) errors.due_date = 'Tanggal jatuh tempo harus diisi'
    if (!formData.subtotal || Number.isNaN(Number(formData.subtotal))) errors.subtotal = 'Subtotal harus diisi'
    if (!formData.total || Number.isNaN(Number(formData.total))) errors.total = 'Total harus diisi'
    if (!formData.status.trim()) errors.status = 'Status harus diisi'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleWorkOrderChange = (workOrderId: string) => {
    const selected = workOrderMap.get(Number(workOrderId))
    setFormData({
      ...formData,
      work_order_id: workOrderId,
      client_id: selected?.client_id ? String(selected.client_id) : formData.client_id,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit({
        license_number: formData.license_number,
        client_id: Number(formData.client_id),
        work_order_id: Number(formData.work_order_id),
        license_date: formData.license_date,
        due_date: formData.due_date,
        subtotal: Number(formData.subtotal),
        discount: Number(formData.discount || 0),
        tax: Number(formData.tax || 0),
        total: Number(formData.total),
        status: formData.status,
        notes: formData.notes || undefined,
      })
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Lisensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">Nomor Lisensi *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="LIC-2026-0001"
                  disabled={loading}
                />
                {formErrors.license_number && (
                  <p className="text-xs text-red-500">{formErrors.license_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  placeholder="unpaid"
                  disabled={loading}
                />
                {formErrors.status && <p className="text-xs text-red-500">{formErrors.status}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Klien *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Klien" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.code} - {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.client_id && <p className="text-xs text-red-500">{formErrors.client_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_order_id">Work Order *</Label>
                <Select
                  value={formData.work_order_id}
                  onValueChange={(value) => handleWorkOrderChange(value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Work Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {workOrders.map((wo) => (
                      <SelectItem key={wo.id} value={String(wo.id)}>
                        {wo.number} - {wo.client?.name || wo.client_name || '-'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.work_order_id && (
                  <p className="text-xs text-red-500">{formErrors.work_order_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_date">Tanggal Lisensi *</Label>
                <Input
                  id="license_date"
                  type="date"
                  value={formData.license_date}
                  onChange={(e) => setFormData({ ...formData, license_date: e.target.value })}
                  disabled={loading}
                />
                {formErrors.license_date && (
                  <p className="text-xs text-red-500">{formErrors.license_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Tanggal Jatuh Tempo *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  disabled={loading}
                />
                {formErrors.due_date && <p className="text-xs text-red-500">{formErrors.due_date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subtotal">Subtotal *</Label>
                <Input
                  id="subtotal"
                  type="number"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  placeholder="1000000"
                  disabled={loading}
                  min="0"
                />
                {formErrors.subtotal && <p className="text-xs text-red-500">{formErrors.subtotal}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0"
                  disabled={loading}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  id="tax"
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  placeholder="110000"
                  disabled={loading}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total">Total *</Label>
                <Input
                  id="total"
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="1110000"
                  disabled={loading}
                  min="0"
                />
                {formErrors.total && <p className="text-xs text-red-500">{formErrors.total}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-20"
                  placeholder="Annual license"
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : license ? 'Perbarui' : 'Buat'}
          </Button>
        </div>
      </form>
    </div>
  )
}
