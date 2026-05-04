'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, Edit2, Plus, Search, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUsers } from '@/lib/api/hooks'
import type { User } from '@/lib/api/types/users'
import type { CreateProtectionRequest, Protection } from '@/lib/api/types/protections'
import {
  useCreateProtection,
  useDeleteProtection,
  useProtections,
  useUpdateProtection,
} from '@/lib/api/hooks'

type ProtectionFormData = {
  period: string
  protected_at: string
  protected_by: string
  is_protected: boolean
}

const emptyForm = (): ProtectionFormData => ({
  period: '',
  protected_at: new Date().toISOString().slice(0, 10),
  protected_by: '',
  is_protected: true,
})

function formatPeriod(period: string) {
  return period
}

function badgeForState(isProtected: boolean) {
  return isProtected ? (
    <Badge className="bg-emerald-600 hover:bg-emerald-600">Terkunci</Badge>
  ) : (
    <Badge variant="outline">Terbuka</Badge>
  )
}

export function ProteksiModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProtectionId, setSelectedProtectionId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProtectionFormData>(emptyForm())
  const [formError, setFormError] = useState('')

  const { data: protectionsData, loading, error, refetch } = useProtections()
  const { data: usersData } = useUsers()
  const { mutate: createProtection, loading: createLoading, error: createError } = useCreateProtection()
  const { mutate: updateProtection, loading: updateLoading, error: updateError } = useUpdateProtection(
    selectedProtectionId
  )
  const { mutate: deleteProtection, loading: deleteLoading, error: deleteError } = useDeleteProtection()

  const protections = protectionsData ?? []
  const users = usersData ?? []

  const usersById = useMemo(() => {
    return new Map((users as User[]).map((user) => [user.id, user]))
  }, [users])

  const filteredProtections = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return protections

    return protections.filter((item) => {
      const period = item.period.toLowerCase()
      const periodAlt = item.period.split('-').reverse().join('-').toLowerCase()
      const protectedAt = item.protected_at.toLowerCase()
      const protectedBy = String(item.protected_by)
      const protectedByName = usersById.get(item.protected_by)?.name?.toLowerCase() ?? ''
      return (
        period.includes(query) ||
        periodAlt.includes(query) ||
        protectedAt.includes(query) ||
        protectedBy.includes(query) ||
        protectedByName.includes(query)
      )
    })
  }, [protections, searchTerm, usersById])

  const summary = useMemo(() => {
    return filteredProtections.reduce(
      (acc, item) => {
        acc.total += 1
        if (item.is_protected) acc.locked += 1
        else acc.open += 1
        return acc
      },
      { total: 0, locked: 0, open: 0 }
    )
  }, [filteredProtections])

  const openCreateDialog = () => {
    setSelectedProtectionId(null)
    setFormData(emptyForm())
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (protection: Protection) => {
    setSelectedProtectionId(protection.id)
    setFormData({
      period: protection.period,
      protected_at: protection.protected_at.slice(0, 10),
      protected_by: String(protection.protected_by),
      is_protected: protection.is_protected,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const openDeleteDialog = (protection: Protection) => {
    setSelectedProtectionId(protection.id)
    setDeleteDialogOpen(true)
  }

  const validateForm = () => {
    if (!/^\d{4}-\d{2}$/.test(formData.period)) {
      return 'Period harus format YYYY-MM, contoh 2026-03'
    }
    if (!formData.protected_at) {
      return 'Tanggal proteksi harus diisi'
    }
    if (!formData.protected_by || Number.isNaN(Number(formData.protected_by))) {
      return 'User pembuat proteksi harus dipilih'
    }
    return ''
  }

  const handleSave = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload: CreateProtectionRequest = {
      period: formData.period,
      protected_at: formData.protected_at,
      protected_by: Number(formData.protected_by),
      is_protected: formData.is_protected,
    }

    if (selectedProtectionId) {
      await updateProtection(payload)
    } else {
      await createProtection(payload)
    }

    setDialogOpen(false)
    setSelectedProtectionId(null)
    setFormData(emptyForm())
    setFormError('')
    await refetch()
  }

  const handleDelete = async () => {
    if (!selectedProtectionId) return
    await deleteProtection(selectedProtectionId)
    setDeleteDialogOpen(false)
    setSelectedProtectionId(null)
    await refetch()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proteksi</h1>
          <p className="text-muted-foreground">
            Kelola periode yang dikunci berdasarkan endpoint backend `/api/protections`.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Proteksi
        </Button>
      </div>

      {(error || createError || updateError || deleteError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            {error?.message || createError?.message || updateError?.message || deleteError?.message}
          </div>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Periode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terkunci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary.locked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terbuka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.open}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari periode, tanggal, atau user..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Proteksi</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProtections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada data proteksi.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProtections.map((item) => {
                    const protectedByName = usersById.get(item.protected_by)?.name || `User #${item.protected_by}`
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{formatPeriod(item.period)}</TableCell>
                        <TableCell>{badgeForState(item.is_protected)}</TableCell>
                        <TableCell>{item.protected_at.slice(0, 10)}</TableCell>
                        <TableCell>{protectedByName}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedProtectionId ? 'Edit Proteksi' : 'Tambah Proteksi'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <div className="ml-2">{formError}</div>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData((prev) => ({ ...prev, period: e.target.value }))}
                  placeholder="2026-03"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protected_at">Protected At *</Label>
                <Input
                  id="protected_at"
                  type="date"
                  value={formData.protected_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, protected_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protected_by">Protected By *</Label>
              <Select
                value={formData.protected_by}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, protected_by: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_protected"
                type="checkbox"
                checked={formData.is_protected}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_protected: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="is_protected" className="cursor-pointer">
                Kunci periode ini
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={createLoading || updateLoading}>
                {createLoading || updateLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Proteksi?</AlertDialogTitle>
          <AlertDialogDescription>
            Data proteksi periode ini akan dihapus. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
