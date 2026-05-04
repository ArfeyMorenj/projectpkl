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
import type { Installation, CreateInstallationRequest } from '@/lib/api/types/installations'

export type InstallationFormSubmitData = CreateInstallationRequest

type InstallationFormSource = Partial<Installation>

interface InstallationFormProps {
  installation?: InstallationFormSource
  onSubmit: (data: InstallationFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  clients?: Client[]
  workOrders?: WorkOrder[]
}

export function InstallationForm({
  installation,
  onSubmit,
  onCancel,
  loading = false,
  error,
  clients = [],
  workOrders = [],
}: InstallationFormProps) {
  const workOrderMap = useMemo(() => new Map(workOrders.map((wo) => [wo.id, wo])), [workOrders])

  const [formData, setFormData] = useState({
    work_order_id: String(installation?.work_order_id ?? ''),
    client_id: String(installation?.client_id ?? ''),
    install_date: installation?.install_date || new Date().toISOString().split('T')[0],
    implementor_1: installation?.implementor_1 || '',
    implementor_2: installation?.implementor_2 || '',
    implementor_3: installation?.implementor_3 || '',
    notes: installation?.notes || '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.work_order_id) errors.work_order_id = 'Work order harus dipilih'
    if (!formData.client_id) errors.client_id = 'Klien harus dipilih'
    if (!formData.install_date) errors.install_date = 'Tanggal instalasi harus diisi'
    if (!formData.notes.trim()) errors.notes = 'Catatan harus diisi'

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
        work_order_id: Number(formData.work_order_id),
        client_id: Number(formData.client_id),
        install_date: formData.install_date,
        implementor_1: formData.implementor_1 || undefined,
        implementor_2: formData.implementor_2 || undefined,
        implementor_3: formData.implementor_3 || undefined,
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
            <CardTitle className="text-base">Informasi Instalasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="install_date">Tanggal Instalasi *</Label>
              <Input
                id="install_date"
                type="date"
                value={formData.install_date}
                onChange={(e) => setFormData({ ...formData, install_date: e.target.value })}
                disabled={loading}
              />
              {formErrors.install_date && (
                <p className="text-xs text-red-500">{formErrors.install_date}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="implementor_1">Implementor 1</Label>
                <Input
                  id="implementor_1"
                  value={formData.implementor_1}
                  onChange={(e) => setFormData({ ...formData, implementor_1: e.target.value })}
                  placeholder="Budi"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementor_2">Implementor 2</Label>
                <Input
                  id="implementor_2"
                  value={formData.implementor_2}
                  onChange={(e) => setFormData({ ...formData, implementor_2: e.target.value })}
                  placeholder="Rina"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementor_3">Implementor 3</Label>
                <Input
                  id="implementor_3"
                  value={formData.implementor_3}
                  onChange={(e) => setFormData({ ...formData, implementor_3: e.target.value })}
                  placeholder="Dedi Pratama"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan *</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-20"
                placeholder="Masukkan catatan instalasi..."
                disabled={loading}
              />
              {formErrors.notes && <p className="text-xs text-red-500">{formErrors.notes}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : installation ? 'Perbarui' : 'Buat'}
          </Button>
        </div>
      </form>
    </div>
  )
}
