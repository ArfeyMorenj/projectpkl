'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client } from '@/lib/api/types/clients'
import type { Product } from '@/lib/api/types/products'
import type { Item } from '@/lib/api/types/items'
import type { TeamMember } from '@/lib/api/types/team-members'
import type {
  CreateWorkOrderRequest,
  WorkOrderDetail,
  WorkOrderTeamMember,
} from '@/lib/api/types/work-orders'

export type WorkOrderFormSubmitData = CreateWorkOrderRequest

type WorkOrderFormSource = Partial<WorkOrderDetail>

type WorkOrderFormValues = {
  number: string
  date: string
  date_install: string
  start_license: string
  client_id: string
  product_id: string
  version: string
  item_id: string
  status: string
  amount: string
  description: string
  item_count: string
  per_unit: string
  notes: string
  implementor_1_id: string
  implementor_2_id: string
  programmer_id: string
  system_analyst_id: string
  supervisor_id: string
  client_spv_id: string
}

function toDateInputValue(value?: string | null) {
  if (!value) return ''
  return value.includes('T') ? value.slice(0, 10) : value
}

interface WorkOrderFormProps {
  workOrder?: WorkOrderFormSource
  onSubmit: (data: WorkOrderFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  clients?: Client[]
  products?: Product[]
  items?: Item[]
  teamMembers?: TeamMember[]
}

export function WorkOrderForm({
  workOrder,
  onSubmit,
  onCancel,
  loading = false,
  error,
  clients = [],
  products = [],
  items = [],
  teamMembers = [],
}: WorkOrderFormProps) {
  const getAssignedTeamId = (role: WorkOrderTeamMember['role'], aliases: string[] = []) =>
    String(
      workOrder?.team?.find(
        (teamMember) => teamMember.role === role || aliases.includes(teamMember.role)
      )?.team_member_id ?? ''
    )

  const [formData, setFormData] = useState<WorkOrderFormValues>({
    number: workOrder?.number || '',
    date: toDateInputValue(workOrder?.date) || new Date().toISOString().split('T')[0],
    date_install: toDateInputValue(workOrder?.date_install) || new Date().toISOString().split('T')[0],
    start_license: toDateInputValue(workOrder?.start_license) || new Date().toISOString().split('T')[0],
    client_id: String(workOrder?.client_id ?? ''),
    product_id: String(workOrder?.product_id ?? ''),
    version: workOrder?.version || '',
    item_id: String(workOrder?.item_id ?? ''),
    status: workOrder?.status || 'AKTIF',
    amount: String(workOrder?.amount ?? 0),
    description: workOrder?.description || '',
    item_count: String(workOrder?.item_count ?? 1),
    per_unit: workOrder?.per_unit || 'UNIT',
    notes: workOrder?.notes || '',
    implementor_1_id: getAssignedTeamId('implementor_1'),
    implementor_2_id: getAssignedTeamId('implementor_2'),
    programmer_id: getAssignedTeamId('programmer'),
    system_analyst_id: getAssignedTeamId('system_analyst'),
    supervisor_id: getAssignedTeamId('supervisor'),
    client_spv_id: getAssignedTeamId('client_spv', ['client_supervisor']),
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.number.trim()) errors.number = 'Nomor WO harus diisi'
    if (!formData.date) errors.date = 'Tanggal WO harus diisi'
    if (!formData.date_install) errors.date_install = 'Tanggal install harus diisi'
    if (!formData.start_license) errors.start_license = 'Tanggal mulai license harus diisi'
    if (!formData.client_id) errors.client_id = 'Klien harus dipilih'
    if (!formData.product_id) errors.product_id = 'Produk harus dipilih'
    if (!formData.item_id) errors.item_id = 'Item harus dipilih'
    if (!formData.status.trim()) errors.status = 'Status harus diisi'
    if (!formData.amount || Number.isNaN(Number(formData.amount))) errors.amount = 'Amount harus diisi'
    if (!formData.item_count || Number.isNaN(Number(formData.item_count))) {
      errors.item_count = 'Item count harus diisi'
    }
    if (!formData.per_unit.trim()) errors.per_unit = 'Per unit harus diisi'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildTeamPayload = () => {
    const team = [
      { team_member_id: formData.implementor_1_id, role: 'implementor_1' as const },
      { team_member_id: formData.implementor_2_id, role: 'implementor_2' as const },
      { team_member_id: formData.programmer_id, role: 'programmer' as const },
      { team_member_id: formData.system_analyst_id, role: 'system_analyst' as const },
      { team_member_id: formData.supervisor_id, role: 'supervisor' as const },
      { team_member_id: formData.client_spv_id, role: 'client_spv' as const },
    ].filter((assignment) => assignment.team_member_id)

    return team.map((assignment) => ({
      role: assignment.role,
      team_member_id: Number(assignment.team_member_id),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        number: formData.number,
        date: formData.date,
        date_install: formData.date_install,
        start_license: formData.start_license,
        client_id: Number(formData.client_id),
        product_id: Number(formData.product_id),
        version: formData.version || undefined,
        item_id: Number(formData.item_id),
        status: formData.status,
        amount: Number(formData.amount),
        description: formData.description || undefined,
        item_count: Number(formData.item_count),
        per_unit: formData.per_unit,
        notes: formData.notes || undefined,
        team: buildTeamPayload(),
      })
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informasi Work Order</CardTitle>
          <CardDescription>Data dasar work order sesuai backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Nomor WO *</Label>
              <Input
                id="number"
                placeholder="WO-032026-0003"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                disabled={loading}
              />
              {formErrors.number && <p className="text-xs text-red-500">{formErrors.number}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal WO *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={loading}
              />
              {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Input
                id="status"
                placeholder="AKTIF"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value.toUpperCase() })}
                disabled={loading}
              />
              {formErrors.status && <p className="text-xs text-red-500">{formErrors.status}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_install">Tanggal Install *</Label>
              <Input
                id="date_install"
                type="date"
                value={formData.date_install}
                onChange={(e) => setFormData({ ...formData, date_install: e.target.value })}
                disabled={loading}
              />
              {formErrors.date_install && (
                <p className="text-xs text-red-500">{formErrors.date_install}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_license">Start License *</Label>
              <Input
                id="start_license"
                type="date"
                value={formData.start_license}
                onChange={(e) => setFormData({ ...formData, start_license: e.target.value })}
                disabled={loading}
              />
              {formErrors.start_license && (
                <p className="text-xs text-red-500">{formErrors.start_license}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versi</Label>
              <Input
                id="version"
                placeholder="v1.0.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                disabled={loading}
              />
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
                  <SelectValue placeholder="-- Pilih Klien --" />
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
              <Label htmlFor="product_id">Produk *</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih Produk --" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.code} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.product_id && <p className="text-xs text-red-500">{formErrors.product_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_id">Item *</Label>
              <Select
                value={formData.item_id}
                onValueChange={(value) => setFormData({ ...formData, item_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih Item --" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.code} - {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.item_id && <p className="text-xs text-red-500">{formErrors.item_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="per_unit">Per Unit *</Label>
              <Input
                id="per_unit"
                placeholder="UNIT"
                value={formData.per_unit}
                onChange={(e) => setFormData({ ...formData, per_unit: e.target.value })}
                disabled={loading}
              />
              {formErrors.per_unit && <p className="text-xs text-red-500">{formErrors.per_unit}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                disabled={loading}
              />
              {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="item_count">Item Count *</Label>
              <Input
                id="item_count"
                type="number"
                value={formData.item_count}
                onChange={(e) => setFormData({ ...formData, item_count: e.target.value })}
                placeholder="1"
                disabled={loading}
              />
              {formErrors.item_count && <p className="text-xs text-red-500">{formErrors.item_count}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Project prioritas tinggi"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penugasan Tim</CardTitle>
          <CardDescription>Gunakan role sesuai payload backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="implementor_1">Implementor 1</Label>
              <Select
                value={formData.implementor_1_id}
                onValueChange={(value) => setFormData({ ...formData, implementor_1_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.code} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="implementor_2">Implementor 2</Label>
              <Select
                value={formData.implementor_2_id}
                onValueChange={(value) => setFormData({ ...formData, implementor_2_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.code} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="programmer">Programmer</Label>
              <Select
                value={formData.programmer_id}
                onValueChange={(value) => setFormData({ ...formData, programmer_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.code} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="system_analyst">System Analyst</Label>
              <Select
                value={formData.system_analyst_id}
                onValueChange={(value) => setFormData({ ...formData, system_analyst_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.code} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Select
                value={formData.supervisor_id}
                onValueChange={(value) => setFormData({ ...formData, supervisor_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.code} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_spv">Client SPV</Label>
              <Select
                value={formData.client_spv_id}
                onValueChange={(value) => setFormData({ ...formData, client_spv_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.code} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading} type="button">
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
