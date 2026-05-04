'use client'

import { useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { AlertCircle, Edit2, FlipHorizontal2, Plus, Search, Trash2 } from 'lucide-react'
import { InvoiceTypeForm } from '@/components/forms/invoice-type-form'
import {
  useCreateInvoiceType,
  useDeleteInvoiceType,
  useInvoiceTypes,
  useToggleInvoiceTypeStatus,
  useUpdateInvoiceType,
} from '@/lib/api/hooks'
import type { InvoiceType, CreateInvoiceTypeRequest } from '@/lib/api/types/invoice-types'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

export function InvoiceTypesModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<InvoiceType | null>(null)

  const { data: invoiceTypes, loading, error, refetch } = useInvoiceTypes()
  const { mutate: createInvoiceType, loading: createLoading, error: createError } = useCreateInvoiceType()
  const { mutate: updateInvoiceType, loading: updateLoading, error: updateError } = useUpdateInvoiceType(
    selectedType?.id ?? null
  )
  const { mutate: deleteInvoiceType, loading: deleteLoading } = useDeleteInvoiceType()
  const { mutate: toggleStatus, loading: toggleLoading } = useToggleInvoiceTypeStatus()

  const { rows: invoiceTypeRows, setRows: setInvoiceTypeRows } = usePersistedRows<InvoiceType>(
    'fitart_invoice_types_rows',
    invoiceTypes
  )
  const displayedTypes =
    searchTerm.trim().length >= 2
      ? invoiceTypeRows.filter((item) =>
          [item.code, item.name, item.is_license ? 'license' : 'non license', item.auto_create_number ? 'auto number' : 'manual number']
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : invoiceTypeRows
  const isInvoiceTypeActive = (item: InvoiceType) => toBooleanFlag(item.is_active)

  const totalCount = invoiceTypeRows.length
  const activeCount = useMemo(
    () => invoiceTypeRows.filter((item) => isInvoiceTypeActive(item)).length,
    [invoiceTypeRows]
  )

  const handleCreate = async (formData: CreateInvoiceTypeRequest) => {
    try {
      const createdType = await createInvoiceType(formData)
      setInvoiceTypeRows((current) => upsertPersistedRow(current, createdType))
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdate = async (formData: CreateInvoiceTypeRequest) => {
    try {
      const updatedType = await updateInvoiceType(formData)
      setInvoiceTypeRows((current) => upsertPersistedRow(current, updatedType))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedType) return

    try {
      await deleteInvoiceType(selectedType.id)
      setInvoiceTypeRows((current) => softDeletePersistedRow(current, selectedType.id))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleToggleStatus = async (invoiceType: InvoiceType) => {
    try {
      const updatedType = await toggleStatus(invoiceType.id)
      setInvoiceTypeRows((current) => upsertPersistedRow(current, updatedType))
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Jenis Invoice</h1>
          <p className="text-muted-foreground">Kelola kode, nama, dan tipe license untuk invoice.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jenis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="text-sm text-muted-foreground">Total Jenis</div>
          <div className="mt-2 text-3xl font-bold">{totalCount}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="text-sm text-muted-foreground">Aktif</div>
          <div className="mt-2 text-3xl font-bold">{activeCount}</div>
        </div>
      </div>

      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Daftar Invoice Type</h2>
            <p className="text-sm text-muted-foreground">
              Data yang dipakai backend untuk transaksi invoice.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode atau nama..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Tipe</th>
                <th className="px-4 py-3 text-left font-semibold">Auto Number</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedTypes.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{item.code}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.is_license ? 'License' : 'Non License'}</td>
                  <td className="px-4 py-3">{item.auto_create_number ? 'Ya' : 'Tidak'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isInvoiceTypeActive(item) ? 'default' : 'secondary'}>
                      {isInvoiceTypeActive(item) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedType(item)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading || deleteLoading || toggleLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(item)}
                        disabled={toggleLoading || updateLoading || deleteLoading}
                      >
                        <FlipHorizontal2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedType(item)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={deleteLoading || updateLoading || toggleLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedTypes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada invoice type ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Invoice Type</DialogTitle>
          </DialogHeader>
          <InvoiceTypeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice Type</DialogTitle>
          </DialogHeader>
          {selectedType && (
            <InvoiceTypeForm
              invoiceType={selectedType}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Invoice Type?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus tipe invoice <strong>{selectedType?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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


