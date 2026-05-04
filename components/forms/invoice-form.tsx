// Invoice Form Component
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bank } from '@/lib/api/types/banks'
import { InvoiceDetail, CreateInvoiceRequest, InvoiceItem } from '@/lib/api/types/invoices'
import { InvoiceType } from '@/lib/api/types/invoice-types'
import { WorkOrder } from '@/lib/api/types/work-orders'
import { Plus, Trash2 } from 'lucide-react'
import { useGenerateInvoiceNumber } from '@/lib/api/hooks'

export type InvoiceFormSubmitData = CreateInvoiceRequest

type InvoiceFormSource = Partial<InvoiceDetail> & {
  items?: InvoiceDetail['items']
  number?: string
  no_invoice?: string
  date?: string
}

interface InvoiceFormProps {
  invoice?: InvoiceFormSource
  onSubmit: (data: InvoiceFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  clients?: Array<{ id: number; code: string; name: string }>
  items?: Array<{ id: number; code: string; name: string; unit: string }>
  invoiceTypes?: InvoiceType[]
  banks?: Bank[]
  workOrders?: WorkOrder[]
}

type InvoiceFormState = {
  invoice_number: string
  invoice_type_id: string
  bank_id: string
  work_order_id: string
  period: string
  invoice_date: string
  due_date: string
  client_id: string
  description: string
  invoice_category: string
  invoice_mode: string
  include_ppn: boolean
  auto_journal: boolean
  is_paid: boolean
  terms_days: string
  items: Array<{
    item_id: number
    quantity: number
    unit_price: number
    discount_percent: number
  }>
}

const shellCard =
  'overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

const sectionHeader =
  'border-b border-border/70 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5'

const sectionBody = 'space-y-5 px-6 py-6'

const infoCard = 'rounded-2xl border border-border/70 bg-background/35 p-4'

const darkTextarea =
  'w-full min-h-24 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'

const invoiceTableWrap = 'overflow-hidden rounded-2xl border border-border/70 bg-background/40'

const invoiceTableHeader =
  'bg-muted/70 text-left text-xs font-semibold uppercase tracking-wide text-foreground/80'

const invoiceTableRow = 'border-b border-border/60 transition-colors hover:bg-muted/40'

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayDateInput() {
  return toDateInputValue(new Date())
}

function addDaysToDateInput(dateInput: string, days: number) {
  const [year, month, day] = dateInput.split('-').map(Number)
  if (!year || !month || !day) {
    return todayDateInput()
  }

  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toDateInputValue(date)
}

function getDefaultDueDate(invoiceDate?: string, termsDays = 30) {
  return addDaysToDateInput(invoiceDate || todayDateInput(), termsDays)
}

function getInvoiceDatePeriod(invoiceDate: string) {
  return invoiceDate.slice(0, 7)
}

function getInvoiceDisplayNumber(invoice?: InvoiceFormSource | null) {
  if (!invoice) return ''
  return invoice.invoice_number || invoice.number || invoice.no_invoice || ''
}

function getInvoiceDisplayDate(invoice?: InvoiceFormSource | null) {
  if (!invoice) return ''
  return invoice.invoice_date || invoice.date || todayDateInput()
}

function toNumber(value: string | number | undefined | null) {
  const parsed = Number(value ?? 0)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function InvoiceForm({
  invoice,
  onSubmit,
  onCancel,
  loading = false,
  error,
  clients = [],
  items = [],
  invoiceTypes = [],
  banks = [],
  workOrders = [],
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormState>({
    invoice_number: getInvoiceDisplayNumber(invoice),
    invoice_type_id: String(invoice?.invoice_type_id ?? ''),
    bank_id: String(invoice?.bank_id ?? ''),
    work_order_id: String(invoice?.work_order_id ?? ''),
    period: invoice?.period || getInvoiceDatePeriod(getInvoiceDisplayDate(invoice)),
    invoice_date: getInvoiceDisplayDate(invoice),
    due_date: invoice?.due_date || getDefaultDueDate(getInvoiceDisplayDate(invoice), invoice?.terms_days || 30),
    client_id: String(invoice?.client_id ?? ''),
    description: invoice?.description || invoice?.notes || '',
    invoice_category: invoice?.invoice_category || 'LICENSE',
    invoice_mode: invoice?.invoice_mode || 'NORMAL',
    include_ppn: invoice?.include_ppn ?? true,
    auto_journal: invoice?.auto_journal ?? true,
    is_paid: invoice?.is_paid ?? false,
    terms_days: String(invoice?.terms_days ?? 30),
    items:
      invoice?.items?.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
      })) || [],
  })

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(invoice?.items || [])
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    item_id: 0,
    quantity: 1,
    unit_price: 0,
    discount_percent: 0,
  })
  const { mutate: generateInvoiceNumber, loading: generatingNumber } = useGenerateInvoiceNumber()

  const workOrderMap = useMemo(
    () => new Map(workOrders.map((wo) => [wo.id, wo])),
    [workOrders]
  )

  useEffect(() => {
    if (!invoice) return

    setFormData({
      invoice_number: getInvoiceDisplayNumber(invoice),
      invoice_type_id: String(invoice.invoice_type_id ?? ''),
      bank_id: String(invoice.bank_id ?? ''),
      work_order_id: String(invoice.work_order_id ?? ''),
      period: invoice.period || getInvoiceDatePeriod(getInvoiceDisplayDate(invoice)),
      invoice_date: getInvoiceDisplayDate(invoice),
      due_date: invoice.due_date || getDefaultDueDate(getInvoiceDisplayDate(invoice), invoice.terms_days || 30),
      client_id: String(invoice.client_id ?? ''),
      description: invoice.description || invoice.notes || '',
      invoice_category: invoice.invoice_category || 'LICENSE',
      invoice_mode: invoice.invoice_mode || 'NORMAL',
      include_ppn: invoice.include_ppn ?? true,
      auto_journal: invoice.auto_journal ?? true,
      is_paid: invoice.is_paid ?? false,
      terms_days: String(invoice.terms_days ?? 30),
      items:
        invoice.items?.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
        })) || [],
    })

    setInvoiceItems(invoice.items || [])
  }, [invoice])

  useEffect(() => {
    if (invoice) return

    setFormData((current) => {
      const next = { ...current }
      let changed = false

      if (!next.period) {
        next.period = getInvoiceDatePeriod(next.invoice_date)
        changed = true
      }

      if (!next.invoice_type_id && invoiceTypes.length === 1) {
        next.invoice_type_id = String(invoiceTypes[0].id)
        changed = true
      }

      if (!next.bank_id && banks.length === 1) {
        next.bank_id = String(banks[0].id)
        changed = true
      }

      if (!next.work_order_id && workOrders.length === 1) {
        next.work_order_id = String(workOrders[0].id)
        next.client_id = String(workOrders[0].client_id || next.client_id || '')
        changed = true
      }

      return changed ? next : current
    })
  }, [banks, invoice, invoiceTypes, workOrders])

  const totals = invoiceItems.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + (item.subtotal || 0),
      discount: acc.discount + (item.discount_amount || 0),
      tax: acc.tax + (item.tax_amount || 0),
      total: acc.total + (item.total || 0),
    }),
    { subtotal: 0, discount: 0, tax: 0, total: 0 }
  )

  const handleInputChange = (
    field: keyof Omit<InvoiceFormState, 'items'>,
    value: string | number | boolean | null | undefined
  ) => {
    setFormData((current) => {
      const next = {
        ...current,
        [field]: value,
      } as InvoiceFormState

      if (field === 'invoice_date' || field === 'terms_days') {
        const rawValue = value as string | number | null | undefined
        const invoiceDate = field === 'invoice_date' ? String(rawValue ?? '') : next.invoice_date
        const termsDays = field === 'terms_days' ? toNumber(rawValue) : toNumber(next.terms_days)
        next.due_date = getDefaultDueDate(invoiceDate, termsDays)
        next.period = getInvoiceDatePeriod(invoiceDate)
      }

      if (field === 'work_order_id') {
        const selectedWorkOrder = workOrderMap.get(Number(value))
        if (selectedWorkOrder?.client_id) {
          next.client_id = String(selectedWorkOrder.client_id)
        }
      }

      return next
    })
  }

  const handleAddItem = () => {
    if (!newItem.item_id || newItem.quantity === undefined || newItem.unit_price === undefined) {
      alert('Pastikan item, quantity, dan harga sudah diisi')
      return
    }

    const item = items.find((i) => i.id === newItem.item_id)
    if (!item) return

    const subtotal = (newItem.quantity || 0) * (newItem.unit_price || 0)
    const discountAmount = subtotal * ((newItem.discount_percent || 0) / 100)
    const taxAmount = (subtotal - discountAmount) * 0.1
    const total = subtotal - discountAmount + taxAmount

    const lineItem: InvoiceItem = {
      item_id: newItem.item_id,
      item_code: item.code,
      item_name: item.name,
      unit: item.unit,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      discount_percent: Number(newItem.discount_percent || 0),
      discount_amount: discountAmount,
      subtotal,
      tax_percent: 10,
      tax_amount: taxAmount,
      total,
    }

    setInvoiceItems([...invoiceItems, lineItem])
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          item_id: newItem.item_id,
          quantity: newItem.quantity,
          unit_price: newItem.unit_price,
          discount_percent: Number(newItem.discount_percent || 0),
        },
      ],
    })
    setNewItem({ item_id: 0, quantity: 1, unit_price: 0, discount_percent: 0 })
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index)
    const updatedFormItems = formData.items.filter((_, i) => i !== index)
    setInvoiceItems(updatedItems)
    setFormData({ ...formData, items: updatedFormItems })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.invoice_type_id) {
      alert('Invoice type harus dipilih')
      return
    }

    if (!formData.bank_id) {
      alert('Bank harus dipilih')
      return
    }

    if (!formData.work_order_id) {
      alert('Work order harus dipilih')
      return
    }

    if (!formData.client_id) {
      alert('Klien harus dipilih')
      return
    }

    if (!formData.period) {
      alert('Periode harus diisi')
      return
    }

    let invoiceNumber = formData.invoice_number.trim()
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(undefined)
    }

    await onSubmit({
      number: invoiceNumber || undefined,
      invoice_number: invoiceNumber || undefined,
      invoice_type_id: Number(formData.invoice_type_id),
      bank_id: Number(formData.bank_id),
      work_order_id: Number(formData.work_order_id),
      period: formData.period,
      date: formData.invoice_date,
      invoice_date: formData.invoice_date,
      due_date: formData.due_date,
      client_id: Number(formData.client_id),
      description: formData.description || undefined,
      invoice_category: formData.invoice_category,
      invoice_mode: formData.invoice_mode,
      include_ppn: formData.include_ppn,
      auto_journal: formData.auto_journal,
      is_paid: formData.is_paid,
      items: formData.items,
      notes: formData.description || undefined,
      terms_days: toNumber(formData.terms_days),
    })
  }

  return (
    <div className="w-full max-w-none space-y-6 text-card-foreground">
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={shellCard}>
          <div className={sectionHeader}>
            <h3 className="text-lg font-semibold text-white">Informasi Invoice</h3>
            <p className="mt-1 text-sm text-slate-300">
              Header invoice, relasi master, dan periode penagihan.
            </p>
          </div>

          <div className={sectionBody}>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Nomor Invoice</Label>
                <Input
                  id="invoice_number"
                  placeholder="Kosongkan untuk auto-generate"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Jika kosong, sistem akan mengambil nomor otomatis dari backend sebelum menyimpan.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_date">Tanggal Invoice *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Tanggal Jatuh Tempo *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Otomatis mengikuti tanggal invoice dan jangka waktu kredit.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="period">Periode *</Label>
                <Input
                  id="period"
                  type="month"
                  value={formData.period}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_type_id">Invoice Type *</Label>
                <Select
                  value={formData.invoice_type_id}
                  onValueChange={(value) => handleInputChange('invoice_type_id', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih Invoice Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoiceTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.code} - {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_id">Bank *</Label>
                <Select
                  value={formData.bank_id}
                  onValueChange={(value) => handleInputChange('bank_id', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih Bank --" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={String(bank.id)}>
                        {bank.code} - {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_id">Klien *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => handleInputChange('client_id', value)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_order_id">Work Order *</Label>
                <Select
                  value={formData.work_order_id}
                  onValueChange={(value) => handleInputChange('work_order_id', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih Work Order --" />
                  </SelectTrigger>
                  <SelectContent>
                    {workOrders.map((wo) => (
                      <SelectItem key={wo.id} value={String(wo.id)}>
                        {wo.number} - {wo.client?.name || wo.client_name || '-'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="invoice_category">Kategori Invoice *</Label>
                <Select
                  value={formData.invoice_category}
                  onValueChange={(value) => handleInputChange('invoice_category', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LICENSE">LICENSE</SelectItem>
                    <SelectItem value="PRODUCT">PRODUCT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_mode">Mode Invoice *</Label>
                <Input
                  id="invoice_mode"
                  placeholder="NORMAL"
                  value={formData.invoice_mode}
                  onChange={(e) => handleInputChange('invoice_mode', e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms_days">Jangka Waktu Kredit (Hari)</Label>
                <Input
                  id="terms_days"
                  type="number"
                  min="0"
                  value={formData.terms_days}
                  onChange={(e) => handleInputChange('terms_days', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/70 bg-background/35 p-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={formData.include_ppn}
                  onCheckedChange={(checked) => handleInputChange('include_ppn', checked === true)}
                />
                <span>Include PPN</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={formData.auto_journal}
                  onCheckedChange={(checked) => handleInputChange('auto_journal', checked === true)}
                />
                <span>Auto Journal</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => handleInputChange('is_paid', checked === true)}
                />
                <span>Sudah Lunas</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi / Catatan</Label>
              <textarea
                id="description"
                className={darkTextarea}
                placeholder="Deskripsi invoice..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Nilai ini akan dikirim sebagai `description` dan tetap kompatibel dengan field `notes`.
              </p>
            </div>
          </div>
        </Card>

        <Card className={shellCard}>
          <div className={sectionHeader}>
            <h3 className="text-lg font-semibold text-white">Item Invoice</h3>
            <p className="mt-1 text-sm text-slate-300">
              Item invoice sekarang dikelola di menu terpisah, supaya header invoice bisa disimpan dulu tanpa kehilangan data.
            </p>
          </div>

          <div className={sectionBody}>
            <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Alur yang aman</h4>
                  <p className="mt-1 text-sm text-slate-300">
                    Simpan invoice dari menu <span className="font-semibold text-white">Invoices</span>, lalu buka
                    <span className="font-semibold text-white"> Invoice Items</span> untuk menambahkan detail item-nya.
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Tidak wajib di form ini
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading || generatingNumber}>
            {loading || generatingNumber ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
