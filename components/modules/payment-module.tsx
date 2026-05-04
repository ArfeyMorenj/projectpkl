'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle as CardTitleUI } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Payment, PaymentDetail, CreatePaymentRequest, UpdatePaymentRequest } from '@/lib/api/types/payments'
import type { Client } from '@/lib/api/types/clients'
import type { Invoice } from '@/lib/api/types/invoices'
import { useClients, useInvoices, usePayments, usePaymentDetail, useCreatePayment, useDeletePayment, useUpdatePayment } from '@/lib/api/hooks'
import { PaymentForm } from '@/components/forms/payment-form'
import { toBooleanFlag } from '@/lib/utils/boolean'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function getStatusBadge(isPosted: boolean) {
  return isPosted ? <Badge className="bg-blue-600">Posted</Badge> : <Badge className="bg-gray-600">Draft</Badge>
}

function isPaymentPosted(payment: Payment | PaymentDetail) {
  return toBooleanFlag(payment.is_posted)
}

function getPaymentInvoiceLabel(payment: Payment | PaymentDetail) {
  return payment.invoice?.number ?? payment.invoice_number ?? `INV #${payment.invoice_id}`
}

export function PaymentModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | PaymentDetail | null>(null)

  const { data: paymentsData, loading, error, refetch } = usePayments()
  const { data: detailData } = usePaymentDetail(selectedPayment?.id)
  const { data: clientsData } = useClients()
  const { data: invoicesData } = useInvoices()

  const { mutate: createPayment, loading: createLoading, error: createError } = useCreatePayment()
  const { mutate: updatePayment, loading: updateLoading, error: updateError } = useUpdatePayment(
    selectedPayment?.id
  )
  const { mutate: deletePayment, loading: deleteLoading } = useDeletePayment()

  const payments = paymentsData ?? []
  const clients: Client[] = clientsData ?? []
  const invoices: Invoice[] = invoicesData ?? []

  const displayedPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesSearch =
        payment.number.toLowerCase().includes(query) ||
        payment.client?.name?.toLowerCase().includes(query) ||
        getPaymentInvoiceLabel(payment).toLowerCase().includes(query) ||
        (payment.description || '').toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'posted' && isPaymentPosted(payment)) ||
        (statusFilter === 'draft' && !isPaymentPosted(payment))
      return matchesSearch && matchesStatus
    })
  }, [payments, searchTerm, statusFilter])

  const summary = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        acc.total_payments += 1
        acc.total_amount += Number(payment.amount || 0)
        if (isPaymentPosted(payment)) acc.posted_count += 1
        else acc.draft_count += 1
        return acc
      },
      {
        total_payments: 0,
        posted_count: 0,
        draft_count: 0,
        total_amount: 0,
        average_amount: 0,
      }
    )
  }, [payments])

  summary.average_amount = summary.total_payments ? summary.total_amount / summary.total_payments : 0

  const handleCreatePayment = async (formData: CreatePaymentRequest) => {
    try {
      await createPayment(formData)
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdatePayment = async (formData: CreatePaymentRequest | UpdatePaymentRequest) => {
    try {
      await updatePayment(formData)
      setIsEditDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeletePayment = async () => {
    if (!selectedPayment) return
    try {
      await deletePayment(selectedPayment.id)
      setIsDeleteDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total Pembayaran</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_payments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rp {(summary.total_amount || 0).toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Posted</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.posted_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Sudah diposting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Draft</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.draft_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Belum diposting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Rata-rata</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rp {(summary.average_amount || 0).toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Per pembayaran</p>
          </CardContent>
        </Card>
      </div>

      <div className={shellClass}>
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-cyan-500/15 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Manajemen Pembayaran</h3>
            <p className="text-sm text-muted-foreground">
              Buat, edit, dan kelola pembayaran invoice dari sini.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusFilter('all')}
              className="border-border/70"
            >
              Semua Status
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Pembayaran Baru
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
          <Input
            placeholder="Cari nomor pembayaran, invoice, atau klien..."
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
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Data mengikuti `number`, `date`, `invoice_id`, `client_id`, `description`, `amount`
            </div>
            <div className="hidden h-6 w-px bg-border/70 md:block" />
            <div className="text-xs uppercase tracking-[0.16em] text-cyan-500/80">
              Tombol create hanya di header
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/70 border-b">
                <TableHead>Pembayaran</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedPayments.map((payment, idx) => (
                <TableRow key={payment.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <TableCell className="font-semibold">{payment.number}</TableCell>
                  <TableCell className="text-sm">{new Date(payment.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{getPaymentInvoiceLabel(payment)}</TableCell>
                  <TableCell>{payment.client?.name || `Client #${payment.client_id}`}</TableCell>
                  <TableCell className="text-right font-semibold">
                    Rp {Number(payment.amount || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>{getStatusBadge(isPaymentPosted(payment))}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!isPaymentPosted(payment) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayment(payment)
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
                              setSelectedPayment(payment)
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
              ))}
            </TableBody>
          </Table>
        </div>

        {displayedPayments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada pembayaran ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Buat Pembayaran Baru</DialogTitle>
          </DialogHeader>
          <PaymentForm
            onSubmit={handleCreatePayment}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
            clients={clients}
            invoices={invoices}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <PaymentForm
              payment={detailData ?? selectedPayment}
              onSubmit={handleUpdatePayment}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
              clients={clients}
              invoices={invoices}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Pembayaran?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pembayaran:{' '}
            <strong>{selectedPayment?.number}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
