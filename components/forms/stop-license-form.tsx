'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { WorkOrder } from '@/lib/api/types/work-orders'
import type { TeamMember } from '@/lib/api/types/team-members'
import type { StopLicense, CreateStopLicenseRequest } from '@/lib/api/types/stop-licenses'
import { toBooleanFlag } from '@/lib/utils/boolean'

export type StopLicenseFormSubmitData = CreateStopLicenseRequest

type StopLicenseFormSource = Partial<StopLicense>

interface StopLicenseFormProps {
  stopLicense?: StopLicenseFormSource
  onSubmit: (data: StopLicenseFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  workOrders?: WorkOrder[]
  teamMembers?: TeamMember[]
}

export function StopLicenseForm({
  stopLicense,
  onSubmit,
  onCancel,
  loading,
  error,
  workOrders = [],
  teamMembers = [],
}: StopLicenseFormProps) {
  const [formData, setFormData] = useState({
    number: stopLicense?.number || '',
    date: stopLicense?.date || new Date().toISOString().split('T')[0],
    stop_date: stopLicense?.stop_date || new Date().toISOString().split('T')[0],
    work_order_id: String(stopLicense?.work_order_id ?? ''),
    client_spv_code: stopLicense?.client_spv_code || '',
    notes: stopLicense?.notes || '',
    is_stopped: stopLicense === undefined ? true : toBooleanFlag(stopLicense.is_stopped),
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.number.trim()) errors.number = 'Nomor stop license harus diisi'
    if (!formData.date) errors.date = 'Tanggal harus diisi'
    if (!formData.stop_date) errors.stop_date = 'Tanggal stop harus diisi'
    if (!formData.work_order_id) errors.work_order_id = 'Work order harus dipilih'
    if (!formData.client_spv_code.trim()) errors.client_spv_code = 'Client SPV harus dipilih'
    if (!formData.notes.trim()) errors.notes = 'Catatan harus diisi'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleWorkOrderChange = (workOrderId: string) => {
    setFormData({
      ...formData,
      work_order_id: workOrderId,
      notes: formData.notes,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit({
        number: formData.number,
        date: formData.date,
        stop_date: formData.stop_date,
        work_order_id: Number(formData.work_order_id),
        client_spv_code: formData.client_spv_code,
        notes: formData.notes || undefined,
        is_stopped: formData.is_stopped,
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
            <CardTitle className="text-base">Informasi Henti Lisensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Nomor *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="001/MIS-03/26"
                  disabled={loading}
                />
                {formErrors.number && <p className="text-xs text-red-500">{formErrors.number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={loading}
                />
                {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stop_date">Tanggal Stop *</Label>
                <Input
                  id="stop_date"
                  type="date"
                  value={formData.stop_date}
                  onChange={(e) => setFormData({ ...formData, stop_date: e.target.value })}
                  disabled={loading}
                />
                {formErrors.stop_date && <p className="text-xs text-red-500">{formErrors.stop_date}</p>}
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
                <Label htmlFor="client_spv_code">Client SPV *</Label>
                <Select
                  value={formData.client_spv_code}
                  onValueChange={(value) => setFormData({ ...formData, client_spv_code: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih SPV" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.code}>
                        {member.code} - {member.name} ({member.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.client_spv_code && (
                  <p className="text-xs text-red-500">{formErrors.client_spv_code}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 pt-7">
                <Checkbox
                  id="is_stopped"
                  checked={formData.is_stopped}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_stopped: Boolean(checked) })
                  }
                  disabled={loading}
                />
                <Label htmlFor="is_stopped" className="cursor-pointer">
                  Is Stopped
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan *</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-20"
                placeholder="BERHENTI"
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
            {loading ? 'Memproses...' : stopLicense ? 'Perbarui' : 'Buat'}
          </Button>
        </div>
      </form>
    </div>
  )
}
