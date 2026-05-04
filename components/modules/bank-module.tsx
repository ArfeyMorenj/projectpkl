'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useBanks,
  useCreateBank,
  useUpdateBank,
  useDeleteBank,
} from '@/lib/api/hooks/use-banks'
import { BankForm } from '@/components/forms/bank-form'
import type { Bank, CreateBankRequest } from '@/lib/api/types/banks'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

function getTypeLabel(type: Bank['type']) {
  return type === 'M' ? 'Main' : 'Header'
}

export function BankModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: banks, loading, error: fetchError, refetch } = useBanks()
  const { mutate: createBank, loading: createLoading, error: createError } = useCreateBank()
  const { mutate: updateBank, loading: updateLoading, error: updateError } = useUpdateBank(
    selectedBank?.id ?? null
  )
  const { mutate: deleteBank, loading: deleteLoading } = useDeleteBank()

  const { rows: displayBanks, setRows: setDisplayBanks } = usePersistedRows<Bank>(
    'fitart_banks_rows',
    banks
  )
  const isSearching = searchTerm.trim().length >= 2
  const displayLoading = loading
  const isBankActive = (bank: Bank) => toBooleanFlag(bank.is_active)

  const summary = useMemo(() => {
    return displayBanks.reduce(
      (acc, bank) => {
        acc.total += 1
        if (isBankActive(bank)) acc.active += 1
        if (bank.type === 'M') acc.main += 1
        if (bank.type === 'H') acc.header += 1
        return acc
      },
      {
        total: 0,
        active: 0,
        main: 0,
        header: 0,
      }
    )
  }, [displayBanks])

  const handleAddBank = () => {
    setSelectedBank(null)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleEditBank = (bank: Bank) => {
    setSelectedBank(bank)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDeleteBank = async () => {
    if (!selectedBank) return

    try {
      await deleteBank(selectedBank.id)
      setDisplayBanks((current) => softDeletePersistedRow(current, selectedBank.id))
      setIsDeleteDialogOpen(false)
      setSelectedBank(null)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleSubmitForm = async (formData: CreateBankRequest) => {
    try {
      if (isEditing && selectedBank) {
        const updatedBank = await updateBank(formData)
        setDisplayBanks((current) => upsertPersistedRow(current, updatedBank))
      } else {
        const createdBank = await createBank(formData)
        setDisplayBanks((current) => upsertPersistedRow(current, createdBank))
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Submit failed:', err)
    }
  }

  if (displayLoading && !displayBanks.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (fetchError && !isSearching) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">Gagal memuat data bank: {fetchError.message}</div>
          <Button className="ml-2" onClick={refetch} size="sm">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Bank</h1>
          <p className="text-muted-foreground">Kelola data bank untuk kebutuhan rekening, kas, dan mapping akun.</p>
        </div>
        <Button onClick={handleAddBank} disabled={createLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Total Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua data yang tampil</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Main</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.main}</div>
            <p className="text-xs text-muted-foreground mt-1">Tipe M</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Header</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.header}</div>
            <p className="text-xs text-muted-foreground mt-1">Tipe H</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/75">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Status aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Daftar Bank</h2>
            <p className="text-sm text-muted-foreground">Cari, tambah, edit, atau hapus bank dari satu layar.</p>
          </div>
          <Badge variant="outline" className="w-fit">
            {isSearching ? `Hasil pencarian: ${displayBanks.length}` : `Data: ${displayBanks.length}`}
          </Badge>
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Cari bank (kode, nama, nomor rekening)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/70 border-b">
                <TableHead>Kode</TableHead>
                <TableHead>Nama Bank</TableHead>
                <TableHead>Nomor Rekening</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kode ACC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayBanks
                .filter((bank) =>
                  !isSearching
                    ? true
                    : [bank.code, bank.name, bank.account_number, bank.acc_code, bank.cdf_code]
                        .join(' ')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
                .map((bank, index) => (
                <TableRow key={bank.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <TableCell className="font-mono text-sm font-semibold">{bank.code}</TableCell>
                  <TableCell className="font-medium">{bank.name}</TableCell>
                  <TableCell>{bank.account_number || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getTypeLabel(bank.type)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{bank.acc_code}</TableCell>
                  <TableCell>
                    <Badge variant={isBankActive(bank) ? 'default' : 'secondary'}>
                      {isBankActive(bank) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBank(bank)}
                        disabled={updateLoading || deleteLoading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedBank(bank)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={deleteLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!displayBanks.length && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada data bank ditemukan</div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Bank' : 'Tambah Bank'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update informasi bank yang dipilih.' : 'Isi data bank baru untuk disimpan.'}
            </DialogDescription>
          </DialogHeader>
          <BankForm
            bank={selectedBank}
            onSubmit={handleSubmitForm}
            onCancel={() => setIsDialogOpen(false)}
            loading={isEditing ? updateLoading : createLoading}
            error={isEditing ? updateError : createError}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Bank?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus bank <strong>{selectedBank?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBank}
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
