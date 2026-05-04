'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, Edit2, FileText, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle as CardTitleUI } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Invoice, InvoiceDetail, CreateInvoiceRequest, UpdateInvoiceRequest } from '@/lib/api/types/invoices'
import { useClients, useItems, useInvoiceDetail, useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useBanks, useInvoiceTypes, useWorkOrders } from '@/lib/api/hooks'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { cn } from '@/lib/utils'

interface InvoiceFilters {
  status?: string
  from_date?: string
  to_date?: string
}

function formatNumber(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString('id-ID')
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleDateString('id-ID')
}

function normalizeStatus(status?: string | null) {
  return (status || 'draft').toLowerCase()
}

function getInvoiceDisplayNumber(
  invoice?: Partial<InvoiceDetail> & {
    number?: string
    no_invoice?: string
  }
) {
  return invoice?.invoice_number || invoice?.number || invoice?.no_invoice || `INV-${invoice?.id ?? '-'}`
}

function getInvoiceDisplayDate(
  invoice?: Partial<InvoiceDetail> & {
    date?: string
  }
) {
  return invoice?.invoice_date || invoice?.date || null
}

function getStatusBadge(status?: string | null) {
  switch (normalizeStatus(status)) {
    case 'draft':
      return <Badge className="bg-gray-600">Draft</Badge>
    case 'posted':
      return <Badge className="bg-blue-600">Posted</Badge>
    case 'paid':
      return <Badge className="bg-green-600">Lunas</Badge>
    case 'partial':
      return <Badge className="bg-yellow-600">Sebagian</Badge>
    case 'cancelled':
      return <Badge className="bg-red-600">Batal</Badge>
    default:
      return <Badge>{status || '-'}</Badge>
  }
}

export function InvoiceModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | InvoiceDetail | null>(null)

  const filters: InvoiceFilters = statusFilter === 'all' ? {} : { status: statusFilter }
  if (dateFromFilter) filters.from_date = dateFromFilter
  if (dateToFilter) filters.to_date = dateToFilter

  const { data: invoicesData, loading, error, refetch } = useInvoices(filters)
  const { data: detailData } = useInvoiceDetail(selectedInvoice?.id)
  const { data: clientsData } = useClients()
  const { data: itemsData } = useItems()
  const { data: banksData } = useBanks()
  const { data: invoiceTypesData } = useInvoiceTypes()
  const { data: workOrdersData } = useWorkOrders()

  const { mutate: createInvoice, loading: createLoading, error: createError } = useCreateInvoice()
  const { mutate: updateInvoice, loading: updateLoading, error: updateError } = useUpdateInvoice(
    selectedInvoice?.id
  )
  const { mutate: deleteInvoice, loading: deleteLoading } = useDeleteInvoice()

  const invoices = invoicesData ?? []
  const clients = clientsData ?? []
  const items = itemsData ?? []
  const banks = (banksData ?? []).filter((bank) => bank.is_active)
  const invoiceTypes = (invoiceTypesData ?? []).filter((type) => type.is_active)
  const workOrders = (workOrdersData ?? []).filter((workOrder) => String(workOrder.status ?? '').toUpperCase() === 'AKTIF')
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])
  const bankMap = useMemo(() => new Map(banks.map((bank) => [bank.id, bank])), [banks])
  const invoiceTypeMap = useMemo(
    () => new Map(invoiceTypes.map((type) => [type.id, type])),
    [invoiceTypes]
  )
  const workOrderMap = useMemo(
    () => new Map(workOrders.map((workOrder) => [workOrder.id, workOrder])),
    [workOrders]
  )
  const invoiceItemsCatalog = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        unit: item.cdf_piutang_name || '-',
      })),
    [items]
  )

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const timeA = new Date(a.created_at || a.invoice_date || 0).getTime()
      const timeB = new Date(b.created_at || b.invoice_date || 0).getTime()
      return timeB - timeA
    })
  }, [invoices])

  const displayedInvoices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return sortedInvoices

    return sortedInvoices.filter((invoice) => {
      const status = normalizeStatus(invoice.status)
      return (
        getInvoiceDisplayNumber(invoice).toLowerCase().includes(query) ||
        String(invoice.client_name || clientMap.get(invoice.client_id)?.name || '').toLowerCase().includes(query) ||
        status.includes(query)
      )
    })
  }, [clientMap, searchTerm, sortedInvoices])

  const recentInvoice = displayedInvoices[0] || sortedInvoices[0] || null

  const summary = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.total_invoices += 1
        acc.total_amount += Number(invoice.total_amount || 0)
        acc.total_paid += Number(invoice.paid_amount || 0)
        acc.total_outstanding += Number(invoice.outstanding_amount || 0)
        const status = normalizeStatus(invoice.status)
        if (status in acc.by_status) {
          acc.by_status[status as keyof typeof acc.by_status] =
            (acc.by_status[status as keyof typeof acc.by_status] || 0) + 1
        }
        return acc
      },
      {
        total_invoices: 0,
        total_amount: 0,
        total_paid: 0,
        total_outstanding: 0,
        by_status: { draft: 0, posted: 0, paid: 0, partial: 0, cancelled: 0 },
      }
    )
  }, [invoices])

  const getClientName = (invoice: Partial<InvoiceDetail>) =>
    invoice.client_name || clientMap.get(invoice.client_id || 0)?.name || '-'

  const getWorkOrderNumber = (workOrderId?: number) =>
    (workOrderId ? workOrderMap.get(workOrderId)?.number : '') || '-'

  const getBankName = (bankId?: number) =>
    (bankId ? bankMap.get(bankId)?.name : '') || '-'

  const getInvoiceTypeName = (invoiceTypeId?: number) =>
    (invoiceTypeId ? invoiceTypeMap.get(invoiceTypeId)?.name : '') || '-'

  const normalizeInvoicePayload = (
    formData: CreateInvoiceRequest | UpdateInvoiceRequest
  ): CreateInvoiceRequest | UpdateInvoiceRequest => ({
    ...formData,
    number:
      'number' in formData
        ? formData.number || formData.invoice_number || undefined
        : formData.invoice_number || undefined,
    invoice_number: formData.invoice_number || undefined,
    date: 'date' in formData ? formData.date || formData.invoice_date || undefined : formData.invoice_date || undefined,
    invoice_date: formData.invoice_date || undefined,
    description: 'description' in formData ? formData.description || undefined : undefined,
    notes: formData.notes || undefined,
    terms_days: formData.terms_days || undefined,
    tax_series_id: 'tax_series_id' in formData ? formData.tax_series_id || undefined : undefined,
  })

  const handleCreateInvoice = async (formData: CreateInvoiceRequest) => {
    try {
      await createInvoice(normalizeInvoicePayload(formData) as CreateInvoiceRequest)
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateInvoice = async (formData: CreateInvoiceRequest | UpdateInvoiceRequest) => {
    try {
      await updateInvoice(normalizeInvoicePayload(formData) as UpdateInvoiceRequest)
      setIsEditDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return
    try {
      await deleteInvoice(selectedInvoice.id)
      setIsDeleteDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total Invoice</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_invoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Rp {(summary.total_amount || 0).toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Lunas</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.by_status.paid}</div>
            <p className="text-xs text-muted-foreground mt-1">Rp {(summary.total_paid || 0).toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Belum Lunas</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.by_status.posted + summary.by_status.partial}</div>
            <p className="text-xs text-muted-foreground mt-1">Rp {(summary.total_outstanding || 0).toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Draft</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.by_status.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">Belum diproses</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="border border-border/70 bg-background/40 p-1 shadow-inner">
            <TabsTrigger
              value="list"
              className="data-[state=active]:border-border/70 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Daftar Invoice
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="data-[state=active]:border-border/70 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Ringkasan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-4">
            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Manajemen Invoice</h3>
                    <p className="text-sm text-muted-foreground">
                      Invoice terbaru tampil paling atas. Row yang baru dibuat akan langsung terlihat lebih jelas.
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Invoice Baru
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Input
                    placeholder="Cari nomor invoice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="partial">Sebagian Bayar</SelectItem>
                      <SelectItem value="paid">Lunas</SelectItem>
                      <SelectItem value="cancelled">Batal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />
                  <Input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/40 overflow-hidden shadow-[0_18px_55px_-35px_rgba(0,0,0,0.4)]">
                  <div className="border-b border-border/70 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Invoice Terbaru</p>
                        <h4 className="mt-1 text-base font-semibold text-white">
                          {recentInvoice ? getInvoiceDisplayNumber(recentInvoice) : 'Belum ada invoice'}
                        </h4>
                      </div>
                      {recentInvoice && getStatusBadge(recentInvoice.status)}
                    </div>
                  </div>

                  {recentInvoice ? (
                    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-border/70 bg-background/30 p-4">
                        <p className="text-xs text-muted-foreground">Klien</p>
                        <p className="mt-1 font-semibold">{getClientName(recentInvoice)}</p>
                        <p className="text-xs text-muted-foreground">{recentInvoice.client_id ? `ID ${recentInvoice.client_id}` : '-'}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/30 p-4">
                        <p className="text-xs text-muted-foreground">Invoice Type</p>
                        <p className="mt-1 font-semibold">{getInvoiceTypeName(recentInvoice.invoice_type_id)}</p>
                        <p className="text-xs text-muted-foreground">{getWorkOrderNumber(recentInvoice.work_order_id)}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/30 p-4">
                        <p className="text-xs text-muted-foreground">Tanggal</p>
                        <p className="mt-1 font-semibold">{formatDate(getInvoiceDisplayDate(recentInvoice))}</p>
                        <p className="text-xs text-muted-foreground">Jatuh tempo {formatDate(recentInvoice.due_date)}</p>
                      </div>
                      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                        <p className="text-xs text-primary/80">Total</p>
                        <p className="mt-1 text-xl font-bold text-primary">Rp {formatNumber(recentInvoice.total_amount)}</p>
                        <p className="text-xs text-primary/70">Dibayar Rp {formatNumber(recentInvoice.paid_amount)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-8 text-sm text-muted-foreground">
                      Data invoice akan muncul di sini setelah berhasil dibuat.
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/40 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.4)]">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/70 bg-muted/80">
                          <TableHead>Invoice</TableHead>
                          <TableHead>Klien</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-right">Dibayar</TableHead>
                          <TableHead className="text-right">Belum</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedInvoices.map((invoice, idx) => {
                          const displayNumber = getInvoiceDisplayNumber(invoice)
                          const clientName = getClientName(invoice)
                          const isNewest = idx === 0
                          return (
                            <TableRow
                              key={invoice.id}
                              className={cn(
                                'transition-colors',
                                idx % 2 === 0 ? 'bg-muted/20' : 'bg-background/20',
                                isNewest && 'ring-1 ring-cyan-400/20 bg-cyan-400/5'
                              )}
                            >
                              <TableCell className="font-semibold">
                                <div className="flex flex-col gap-1">
                                  <span className="font-mono text-sm text-white">{displayNumber}</span>
                                  <span className="text-xs text-muted-foreground">ID {invoice.id}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">{clientName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getWorkOrderNumber(invoice.work_order_id)} · {getInvoiceTypeName(invoice.invoice_type_id)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex flex-col">
                                  <span>{formatDate(getInvoiceDisplayDate(invoice))}</span>
                                  <span className="text-xs text-muted-foreground">Jatuh tempo {formatDate(invoice.due_date)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">Rp {formatNumber(invoice.total_amount)}</TableCell>
                              <TableCell className="text-right text-green-500">Rp {formatNumber(invoice.paid_amount)}</TableCell>
                              <TableCell className="text-right text-red-500 font-semibold">
                                Rp {formatNumber(invoice.outstanding_amount)}
                              </TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedInvoice(invoice)}
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                  {normalizeStatus(invoice.status) === 'draft' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedInvoice(invoice)
                                          setIsEditDialogOpen(true)
                                        }}
                                        disabled={updateLoading}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          setSelectedInvoice(invoice)
                                          setIsDeleteDialogOpen(true)
                                        }}
                                        disabled={deleteLoading}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {displayedInvoices.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/20 px-6 py-8 text-center text-muted-foreground">
                    Tidak ada invoice ditemukan. Coba longgarkan filter atau buat invoice baru.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Card className="border-border/70 bg-card/75 sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitleUI className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">Panduan Singkat</CardTitleUI>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Data invoice yang baru dibuat akan langsung muncul di panel kiri dan diprioritaskan di baris paling atas.
                    </p>
                    <p>
                      Jika nomor invoice masih kosong, biasanya backend mengirim key berbeda seperti `number` atau `no_invoice`.
                      UI sekarang sudah punya fallback untuk itu.
                    </p>
                    <p>
                      Setelah header invoice selesai, detail item dipindahkan ke menu <span className="font-semibold text-foreground">Invoice Items</span> di sidebar.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/75">
                  <CardHeader className="pb-3">
                    <CardTitleUI className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">Status Cepat</CardTitleUI>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      ['Draft', summary.by_status.draft, 'bg-slate-500/20 text-slate-200'],
                      ['Posted', summary.by_status.posted, 'bg-blue-500/20 text-blue-200'],
                      ['Lunas', summary.by_status.paid, 'bg-emerald-500/20 text-emerald-200'],
                      ['Partial', summary.by_status.partial, 'bg-amber-500/20 text-amber-200'],
                    ].map(([label, count, cls]) => (
                      <div
                        key={String(label)}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 px-4 py-3"
                      >
                        <span className="text-sm font-medium">{label as string}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{count as number}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitleUI>Ringkasan by Status</CardTitleUI>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(summary.by_status).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitleUI>Total Performa</CardTitleUI>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="text-foreground/75">Total:</span>
                      <span className="ml-2 font-semibold">Rp {formatNumber(summary.total_amount)}</span>
                    </div>
                    <div className="text-sm text-green-600">
                      <span>Terbayar:</span>
                      <span className="ml-2 font-semibold">
                        {summary.total_amount ? ((summary.total_paid / summary.total_amount) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[96vw] max-w-6xl max-h-[90vh] overflow-y-auto border-border/70 bg-card/95 text-card-foreground shadow-[0_24px_80px_-45px_rgba(15,23,42,0.4)]">
          <DialogHeader>
            <DialogTitle>Buat Invoice Baru</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            onSubmit={handleCreateInvoice}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
            clients={clients}
            items={invoiceItemsCatalog}
            invoiceTypes={invoiceTypes}
            banks={banks}
            workOrders={workOrders}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[96vw] max-w-6xl max-h-[90vh] overflow-y-auto border-border/70 bg-card/95 text-card-foreground shadow-[0_24px_80px_-45px_rgba(15,23,42,0.4)]">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceForm
              invoice={detailData ?? selectedInvoice}
              onSubmit={handleUpdateInvoice}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
              clients={clients}
              items={invoiceItemsCatalog}
              invoiceTypes={invoiceTypes}
              banks={banks}
              workOrders={workOrders}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Invoice?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus invoice: <strong>{selectedInvoice?.invoice_number}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

