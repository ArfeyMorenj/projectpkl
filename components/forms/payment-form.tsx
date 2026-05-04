'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PaymentDetail, CreatePaymentRequest } from '@/lib/api/types/payments'
import type { Client } from '@/lib/api/types/clients'
import type { Invoice } from '@/lib/api/types/invoices'

export type PaymentFormSubmitData = CreatePaymentRequest

type PaymentFormSource = Partial<PaymentDetail>

interface PaymentFormProps {
  payment?: PaymentFormSource
  onSubmit: (data: PaymentFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  clients?: Client[]
  invoices?: Invoice[]
}

export function PaymentForm({
  payment,
  onSubmit,
  onCancel,
  loading = false,
  error,
  clients = [],
  invoices = [],
}: PaymentFormProps) {
  const getInvoiceLabel = (invoice: Invoice) =>
    invoice.number ?? invoice.invoice_number ?? invoice.no_invoice ?? `INV #${invoice.id}`

  const invoiceMap = useMemo(() => new Map(invoices.map((invoice) => [invoice.id, invoice])), [invoices])

  const [formData, setFormData] = useState({
    number: payment?.number || '',
    date: payment?.date || new Date().toISOString().split('T')[0],
    invoice_id: String(payment?.invoice_id ?? ''),
    client_id: String(payment?.client_id ?? ''),
    description: payment?.description || '',
    amount: String(payment?.amount ?? ''),
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.number.trim()) errors.number = 'Nomor pembayaran harus diisi'
    if (!formData.date) errors.date = 'Tanggal pembayaran harus diisi'
    if (!formData.invoice_id) errors.invoice_id = 'Invoice harus dipilih'
    if (!formData.client_id) errors.client_id = 'Klien harus dipilih'
    if (!formData.amount || Number.isNaN(Number(formData.amount))) errors.amount = 'Jumlah harus diisi'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInvoiceChange = (invoiceId: string) => {
    const selected = invoiceMap.get(Number(invoiceId))
    setFormData({
      ...formData,
      invoice_id: invoiceId,
      client_id: selected?.client_id ? String(selected.client_id) : formData.client_id,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit({
        number: formData.number,
        date: formData.date,
        invoice_id: Number(formData.invoice_id),
        client_id: Number(formData.client_id),
        description: formData.description || undefined,
        amount: Number(formData.amount),
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
          <CardTitle>Informasi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Nomor *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="PAY-202603-0001"
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
              <Label htmlFor="invoice_id">Invoice *</Label>
              <Select
                value={formData.invoice_id}
                onValueChange={(value) => handleInvoiceChange(value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Invoice" />
                </SelectTrigger>
                  <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={String(invoice.id)}>
                      {getInvoiceLabel(invoice)} - {invoice.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.invoice_id && <p className="text-xs text-red-500">{formErrors.invoice_id}</p>}
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
            <Label htmlFor="amount">Jumlah Pembayaran (Rp) *</Label>
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
            <Label htmlFor="description">Keterangan</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="Pembayaran transfer BCA"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading} type="button">
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
        </Button>
      </div>
    </form>
  )
}
