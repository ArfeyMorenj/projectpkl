'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useClients,
  useInvoiceItems,
  useInvoices,
  useMasterItemProducts,
  useCreateInvoiceItem,
  useUpdateInvoiceItem,
  useDeleteInvoiceItem,
} from '@/lib/api/hooks'
import type { Invoice } from '@/lib/api/types/invoices'
import type { InvoiceItemRecord } from '@/lib/api/types/invoice-items'
import type { MasterItemProduct } from '@/lib/api/types/master-item-products'
import { usePersistedRows } from '@/lib/utils/persisted-rows'

type InvoiceItemFormState = {
  invoice_id: string
  master_item_product_id: string
  item_code: string
  item_name: string
  unit: string
  qty: string
  price: string
  months: string
  description: string
}

function formatCurrency(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString('id-ID')
}

function parseNumber(value?: string | number | null) {
  const parsed = Number(value ?? 0)
  return Number.isNaN(parsed) ? 0 : parsed
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID')
}

function isTruthyFlag(value: boolean | number | string | null | undefined) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return ['1', 'true', 'yes', 'active', 'aktif'].includes(String(value || '').toLowerCase())
}

function getInvoiceNumber(
  invoice?: Partial<Invoice> & {
    number?: string
    no_invoice?: string
  }
) {
  return invoice?.invoice_number || invoice?.number || invoice?.no_invoice || `INV-${invoice?.id ?? '-'}`
}

function getInvoiceDate(
  invoice?: Partial<Invoice> & {
    date?: string
  }
) {
  return invoice?.invoice_date || invoice?.date || null
}

function getInvoiceLabel(invoice: Partial<Invoice>) {
  const parts = [
    getInvoiceNumber(invoice),
    invoice.client_name || `Client ${invoice.client_id ?? '-'}`,
    getInvoiceDate(invoice) ? formatDate(getInvoiceDate(invoice)) : '-',
  ]
  return parts.join(' | ')
}

function getMasterItemLabel(item: MasterItemProduct) {
  return `${item.code} - ${item.name} (${item.unit})`
}

export function InvoiceItemsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [masterItemSearch, setMasterItemSearch] = useState('')
  const [itemInputMode, setItemInputMode] = useState<'master' | 'manual'>('master')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDetailRow, setSelectedDetailRow] = useState<InvoiceItemRecord | null>(null)
  const emptyFormState: InvoiceItemFormState = {
    invoice_id: '',
    master_item_product_id: '',
    item_code: '',
    item_name: '',
    unit: 'UNIT',
    qty: '1',
    price: '',
    months: '1',
    description: '',
  }
  const [formData, setFormData] = useState<InvoiceItemFormState>({
    ...emptyFormState,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingRow, setEditingRow] = useState<InvoiceItemRecord | null>(null)

  const { data: invoiceItemsData, loading, error, refetch } = useInvoiceItems()
  const { data: invoicesData, refetch: refetchInvoices } = useInvoices()
  const { data: clientsData } = useClients()
  const { data: masterItemProductsData, loading: masterItemProductsLoading } = useMasterItemProducts()
  const { rows: persistedMasterItemProducts } = usePersistedRows<MasterItemProduct>(
    'fitart_master_item_products_rows',
    masterItemProductsData
  )

  const { mutate: createInvoiceItem, loading: createLoading } = useCreateInvoiceItem()
  const { mutate: updateInvoiceItem, loading: updateLoading } = useUpdateInvoiceItem(editingId ?? undefined)
  const { mutate: deleteInvoiceItem, loading: deleteLoading } = useDeleteInvoiceItem()

  const invoiceItems = invoiceItemsData ?? []
  const invoices = invoicesData ?? []
  const clients = clientsData ?? []
  const masterItemProducts = persistedMasterItemProducts

  const invoiceMap = useMemo(() => new Map(invoices.map((invoice) => [invoice.id, invoice])), [invoices])
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])
  const masterItemMap = useMemo(
    () => new Map(masterItemProducts.map((item) => [item.id, item])),
    [masterItemProducts]
  )
  const isMasterItemLoading = masterItemProductsLoading && masterItemProducts.length === 0

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const timeA = new Date(a.created_at || a.invoice_date || 0).getTime()
      const timeB = new Date(b.created_at || b.invoice_date || 0).getTime()
      return timeB - timeA
    })
  }, [invoices])

  const filteredInvoices = useMemo(() => {
    const query = invoiceSearch.trim().toLowerCase()
    if (!query) return sortedInvoices

    return sortedInvoices.filter((invoice) =>
      [
        getInvoiceNumber(invoice),
        invoice.client_name || clientMap.get(invoice.client_id)?.name || '',
        String(invoice.status || ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [clientMap, invoiceSearch, sortedInvoices])

  const filteredMasterItems = useMemo(() => {
    const query = masterItemSearch.trim().toLowerCase()
    const sorted = [...masterItemProducts].sort((a, b) => {
      const activeA = isTruthyFlag(a.is_active) ? 1 : 0
      const activeB = isTruthyFlag(b.is_active) ? 1 : 0
      if (activeA !== activeB) return activeB - activeA
      return a.code.localeCompare(b.code)
    })

    if (!query) return sorted

    return sorted.filter((item) =>
      `${item.code} ${item.name} ${item.unit}`.toLowerCase().includes(query)
    )
  }, [masterItemProducts, masterItemSearch])

  const selectedInvoice = useMemo(
    () => invoiceMap.get(Number(formData.invoice_id)) || null,
    [formData.invoice_id, invoiceMap]
  )

  const selectedMasterItem = useMemo(
    () => masterItemMap.get(Number(formData.master_item_product_id)) || null,
    [formData.master_item_product_id, masterItemMap]
  )

  const previewQty = parseNumber(formData.qty)
  const previewPrice = parseNumber(formData.price)
  const previewBruto = previewQty * previewPrice

  const displayedItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return [...invoiceItems]
      .sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime()
        const timeB = new Date(b.created_at || 0).getTime()
        return timeB - timeA
      })
      .filter((row) => {
        const invoice = row.invoice || invoiceMap.get(row.invoice_id)
        const masterItem = row.master_item_product || masterItemMap.get(row.master_item_product_id ?? 0)

        if (!query) return true

        return (
          String(row.id).includes(query) ||
          String(row.invoice_id).includes(query) ||
          String(row.master_item_product_id).includes(query) ||
          String(row.item_code || masterItem?.code || '').toLowerCase().includes(query) ||
          String(row.item_name || masterItem?.name || '').toLowerCase().includes(query) ||
          String(invoice?.invoice_number || invoice?.number || invoice?.no_invoice || '').toLowerCase().includes(query) ||
          String(invoice?.client_name || clientMap.get(invoice?.client_id || 0)?.name || '').toLowerCase().includes(query) ||
          String(row.description || '').toLowerCase().includes(query)
        )
      })
  }, [clientMap, invoiceItems, invoiceMap, masterItemMap, searchTerm])

  const summary = useMemo(
    () => ({
      total_items: displayedItems.length,
      total_qty: displayedItems.reduce((acc, row) => acc + Number(row.qty || 0), 0),
      total_value: displayedItems.reduce((acc, row) => acc + Number(row.bruto || row.total || 0), 0),
    }),
    [displayedItems]
  )

  const resetForm = () => {
    setFormData({ ...emptyFormState })
    setItemInputMode('master')
    setEditingId(null)
    setEditingRow(null)
    setInvoiceSearch('')
    setMasterItemSearch('')
    setIsFormOpen(false)
  }

  const handleToggleForm = () => {
    if (isFormOpen) {
      setIsFormOpen(false)
      return
    }

    setEditingId(null)
    setEditingRow(null)
    setFormData({ ...emptyFormState })
    setItemInputMode('master')
    setInvoiceSearch('')
    setMasterItemSearch('')
    setIsFormOpen(true)
  }

  const openDetail = (row: InvoiceItemRecord) => {
    setSelectedDetailRow(row)
  }

  const handlePickMasterItem = (value: string) => {
    const selected = masterItemMap.get(Number(value))
    setItemInputMode('master')
    setFormData((current) => ({
      ...current,
      master_item_product_id: value,
      item_code: selected?.code ?? current.item_code,
      item_name: selected?.name ?? current.item_name,
      unit: selected?.unit ?? current.unit,
      price: selected ? String(selected.price ?? '') : current.price,
    }))
  }

  const handleSwitchToManual = () => {
    setItemInputMode('manual')
    setFormData((current) => ({
      ...current,
      master_item_product_id: '',
      item_code: current.item_code || selectedMasterItem?.code || '',
      item_name: current.item_name || selectedMasterItem?.name || '',
      unit: current.unit || selectedMasterItem?.unit || 'UNIT',
      price: current.price || String(selectedMasterItem?.price ?? ''),
    }))
  }

  const handleEdit = (row: InvoiceItemRecord) => {
    setEditingId(row.id)
    setEditingRow(row)
    setIsFormOpen(true)
    setItemInputMode(row.master_item_product_id ? 'master' : 'manual')
    setFormData({
      invoice_id: String(row.invoice_id),
      master_item_product_id: row.master_item_product_id ? String(row.master_item_product_id) : '',
      item_code: row.item_code || row.master_item_product?.code || '',
      item_name: row.item_name || row.master_item_product?.name || '',
      unit: row.unit || row.master_item_product?.unit || 'UNIT',
      qty: String(row.qty ?? 1),
      price: String(row.price ?? 0),
      months: String(row.months ?? 1),
      description: row.description || '',
    })
    if (row.invoice?.number) {
      setInvoiceSearch(row.invoice.number)
    }
    if (row.master_item_product?.code) {
      setMasterItemSearch(row.master_item_product.code)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.invoice_id) {
      alert('Invoice harus dipilih')
      return
    }

    if (!formData.master_item_product_id) {
      if (itemInputMode === 'master') {
        alert('Master item product harus dipilih')
        return
      }
    }

    if (itemInputMode === 'manual') {
      if (!formData.item_code.trim()) {
        alert('Kode item harus diisi')
        return
      }
      if (!formData.item_name.trim()) {
        alert('Nama item harus diisi')
        return
      }
      if (!formData.unit.trim()) {
        alert('Unit harus diisi')
        return
      }
    }

    if (itemInputMode === 'master' && !formData.master_item_product_id) {
      alert('Master item product harus dipilih')
      return
    }

    try {
      if (editingId) {
        const payload = {
          invoice_id: Number(formData.invoice_id),
          master_item_product_id:
            itemInputMode === 'master' && formData.master_item_product_id
              ? Number(formData.master_item_product_id)
              : null,
          item_code: formData.item_code.trim() || selectedMasterItem?.code || editingRow?.item_code || undefined,
          item_name: formData.item_name.trim() || selectedMasterItem?.name || editingRow?.item_name || undefined,
          unit: formData.unit.trim() || selectedMasterItem?.unit || editingRow?.unit || 'UNIT',
          qty: Number(formData.qty || 0),
          price: Number(formData.price || 0),
          months: Number(formData.months || 0),
          description: formData.description || undefined,
          bruto: previewBruto,
        }
        await updateInvoiceItem(payload)
      } else {
        const payload = {
          invoice_id: Number(formData.invoice_id),
          master_item_product_id:
            itemInputMode === 'master' && formData.master_item_product_id
              ? Number(formData.master_item_product_id)
              : null,
          item_code: formData.item_code.trim() || selectedMasterItem?.code || undefined,
          item_name: formData.item_name.trim() || selectedMasterItem?.name || undefined,
          unit: formData.unit.trim() || selectedMasterItem?.unit || 'UNIT',
          qty: Number(formData.qty || 0),
          price: Number(formData.price || 0),
          months: Number(formData.months || 0),
          description: formData.description || undefined,
          bruto: previewBruto,
        }
        await createInvoiceItem(payload)
      }
      resetForm()
      await Promise.all([refetch(), refetchInvoices()])
    } catch (err) {
      console.error('Invoice item save failed:', err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoiceItem(id)
      await Promise.all([refetch(), refetchInvoices()])
    } catch (err) {
      console.error('Invoice item delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
          <Button className="ml-2" onClick={refetch} size="sm">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Total Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_items}</div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Total Qty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_qty}</div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Nilai Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {formatCurrency(summary.total_value)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/85 text-card-foreground shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Invoice Items</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Form ini mengikuti response API invoice item. Field utamanya adalah `invoice_id`, `master_item_product_id`, `qty`, `price`, `months`, dan `description`.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Form API-aligned
              </Badge>
              <Button type="button" onClick={handleToggleForm}>
                <Plus className="mr-2 h-4 w-4" />
                Invoice Item +
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/35 p-5 text-sm text-muted-foreground">
            Klik tombol <span className="font-semibold text-foreground">Invoice Item +</span> untuk membuka form create/update invoice item.
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/35">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-muted/70">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Months</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedItems.map((row, index) => {
                    const invoice = row.invoice || invoiceMap.get(row.invoice_id)
                    const masterItem = row.master_item_product || masterItemMap.get(row.master_item_product_id ?? 0)
                    const displayNumber = getInvoiceNumber(invoice)
                    return (
                      <TableRow
                        key={row.id}
                        className={index % 2 === 0 ? 'bg-muted/20' : 'bg-background/20'}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-sm font-semibold">{displayNumber}</span>
                            <span className="text-xs text-muted-foreground">
                              {invoice?.client_name || clientMap.get(invoice?.client_id || 0)?.name || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{row.item_name || masterItem?.name || '-'}</span>
                            <span className="text-xs text-muted-foreground">
                              {row.item_code || masterItem?.code || '-'} - {row.unit || masterItem?.unit || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.qty}</TableCell>
                        <TableCell className="text-right">Rp {formatCurrency(row.price)}</TableCell>
                        <TableCell className="text-right">{row.months ?? '-'}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          Rp {formatCurrency(row.bruto ?? Number(row.qty || 0) * Number(row.price || 0))}
                        </TableCell>
                        <TableCell>{row.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openDetail(row)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(row)}
                              disabled={createLoading || updateLoading || deleteLoading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(row.id)}
                              disabled={createLoading || updateLoading || deleteLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {displayedItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
              Belum ada invoice item. Pilih invoice dan master item product lalu simpan melalui form di atas.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              placeholder="Cari invoice / item / klien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="rounded-2xl border border-border/70 bg-background/35 px-4 py-3 text-sm text-muted-foreground">
              Filter tabel mengikuti pencarian di sini.
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/35 px-4 py-3 text-sm text-muted-foreground">
              {editingId ? 'Sedang edit item invoice.' : 'Sedang tambah item invoice baru.'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm()
          return
        }
        setIsFormOpen(true)
      }}>
        <DialogContent className="max-w-6xl border-border/70 bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Update Invoice Item' : 'Tambah Invoice Item'}</DialogTitle>
            <DialogDescription>
              Form ini terpisah dari daftar supaya input data lebih nyaman dan fokus.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/35 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Invoice *</Label>
                  <Input
                    placeholder="Cari invoice, klien, atau status..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                  />
                  <Select
                    value={formData.invoice_id}
                    onValueChange={(value) => setFormData({ ...formData, invoice_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={String(invoice.id)}>
                          {getInvoiceLabel(invoice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Master Item Product *</Label>
                  <Input
                    placeholder="Cari code / name / unit..."
                    value={masterItemSearch}
                    onChange={(e) => setMasterItemSearch(e.target.value)}
                  />
                  {isMasterItemLoading && (
                    <p className="text-xs text-muted-foreground">
                      Memuat master item product dari backend...
                    </p>
                  )}
                  <Select
                    value={formData.master_item_product_id}
                    onValueChange={handlePickMasterItem}
                    disabled={itemInputMode === 'manual' || (isMasterItemLoading && masterItemProducts.length === 0)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih master item product" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMasterItems.length > 0 ? (
                        filteredMasterItems.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {getMasterItemLabel(item)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__empty" disabled>
                          {isMasterItemLoading
                            ? 'Data belum siap...'
                            : 'Tidak ada master item product yang cocok.'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
                    <div>
                      <p className="text-xs font-medium">Mode input item</p>
                      <p className="text-xs text-muted-foreground">
                        Pilih dari master item atau isi manual untuk kode, nama, dan unit.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={itemInputMode === 'master' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setItemInputMode('master')}
                      >
                        Dropdown
                      </Button>
                      <Button
                        type="button"
                        variant={itemInputMode === 'manual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={handleSwitchToManual}
                      >
                        Manual
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Kode Item</Label>
                      <Input
                        value={formData.item_code}
                        onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                        placeholder="Contoh: ITM001"
                        disabled={itemInputMode === 'master' && !formData.master_item_product_id}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Nama Item</Label>
                      <Input
                        value={formData.item_name}
                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                        placeholder="Contoh: License Service"
                        disabled={itemInputMode === 'master' && !formData.master_item_product_id}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="UNIT"
                        disabled={itemInputMode === 'master' && !formData.master_item_product_id}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        {itemInputMode === 'master'
                          ? 'Saat dropdown dipilih, kode/nama/unit bisa terisi otomatis dari master item product.'
                          : 'Mode manual dipakai jika item belum ada di master item product.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Qty *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Months</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.months}
                    onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bruto Preview</Label>
                  <Input value={previewBruto.toLocaleString('id-ID')} readOnly />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Contoh: Biaya lisensi bulanan Maret 2026"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={createLoading || updateLoading}>
                    Batal Edit
                  </Button>
                )}
                <Button type="submit" disabled={createLoading || updateLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Item' : 'Simpan Item'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-border/70 bg-background/35">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preview Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-2xl border border-border/70 bg-background/35 p-3">
                    <p className="text-xs text-muted-foreground">Invoice</p>
                    <p className="mt-1 font-semibold">{selectedInvoice ? getInvoiceLabel(selectedInvoice) : 'Belum dipilih'}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/35 p-3">
                    <p className="text-xs text-muted-foreground">Master Item Product</p>
                    <p className="mt-1 font-semibold">
                      {selectedMasterItem ? getMasterItemLabel(selectedMasterItem) : 'Belum dipilih'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMasterItem ? (isTruthyFlag(selectedMasterItem.is_active) ? 'Aktif' : 'Nonaktif') : '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/70 bg-background/35 p-3">
                      <p className="text-xs text-muted-foreground">Qty</p>
                      <p className="mt-1 font-semibold">{previewQty}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/35 p-3">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="mt-1 font-semibold">Rp {formatCurrency(previewPrice)}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/35 p-3">
                      <p className="text-xs text-muted-foreground">Months</p>
                      <p className="mt-1 font-semibold">{parseNumber(formData.months)}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3">
                      <p className="text-xs text-primary/80">Bruto</p>
                      <p className="mt-1 font-semibold text-primary">Rp {formatCurrency(previewBruto)}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/35 p-3">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm">{formData.description || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-background/35">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Catatan API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Request yang dikirim menyesuaikan response backend:
                    <span className="font-semibold text-foreground"> invoice_id, master_item_product_id, qty, price, months, description</span>.
                  </p>
                  <p>
                    Field tambahan seperti `unit`, `item_code`, `item_name`, dan `bruto` ikut dikirim sebagai data pendukung agar tampilan dan response tetap konsisten.
                  </p>
                </CardContent>
              </Card>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedDetailRow)} onOpenChange={(open) => !open && setSelectedDetailRow(null)}>
        <DialogContent className="max-w-3xl border-border/70 bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Detail Invoice Item</DialogTitle>
            <DialogDescription>Informasi lengkap item invoice yang dipilih dari daftar.</DialogDescription>
          </DialogHeader>
          {selectedDetailRow && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Invoice</p>
                <p className="mt-2 font-semibold">
                  {getInvoiceLabel(selectedDetailRow.invoice || invoiceMap.get(selectedDetailRow.invoice_id) || ({ id: selectedDetailRow.invoice_id } as Invoice))}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Item</p>
                <p className="mt-2 font-semibold">
                  {selectedDetailRow.item_code || selectedDetailRow.master_item_product?.code || '-'} - {selectedDetailRow.item_name || selectedDetailRow.master_item_product?.name || '-'}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Qty</p>
                <p className="mt-2 font-semibold">{selectedDetailRow.qty}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Unit</p>
                <p className="mt-2 font-semibold">{selectedDetailRow.unit || selectedDetailRow.master_item_product?.unit || '-'}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                <p className="mt-2 font-semibold">Rp {formatCurrency(selectedDetailRow.price)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Bruto</p>
                <p className="mt-2 font-semibold">Rp {formatCurrency(selectedDetailRow.bruto)}</p>
              </div>
              <div className="md:col-span-2 rounded-2xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Description</p>
                <p className="mt-2 font-semibold">{selectedDetailRow.description || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
