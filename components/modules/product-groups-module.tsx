'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
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
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { ProductGroupForm } from '@/components/forms/product-group-form'
import {
  useCreateProductGroup,
  useDeleteProductGroup,
  useProductGroups,
  useUpdateProductGroup,
} from '@/lib/api/hooks'
import type { ProductGroup, CreateProductGroupRequest } from '@/lib/api/types/product-groups'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function ProductGroupsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null)

  const { data: groups, loading, error, refetch } = useProductGroups()
  const { mutate: createGroup, loading: createLoading, error: createError } = useCreateProductGroup()
  const { mutate: updateGroup, loading: updateLoading, error: updateError } = useUpdateProductGroup(
    selectedGroup?.id ?? null
  )
  const { mutate: deleteGroup, loading: deleteLoading } = useDeleteProductGroup()

  const { rows: groupsRows, setRows: setGroupsRows } = usePersistedRows<ProductGroup>(
    'fitart_product_groups_rows',
    groups
  )
  const displayedGroups =
    searchTerm.trim().length >= 2
      ? groupsRows.filter((group) =>
          [group.code, group.name, group.acc_omzet, group.cdf_piutang].join(' ').toLowerCase().includes(searchTerm.toLowerCase())
        )
      : groupsRows
  const isGroupActive = (group: ProductGroup) => toBooleanFlag(group.is_active)

  const handleCreateGroup = async (formData: CreateProductGroupRequest) => {
    try {
      const createdGroup = await createGroup(formData)
      setGroupsRows((current) => upsertPersistedRow(current, createdGroup))
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateGroup = async (formData: CreateProductGroupRequest) => {
    try {
      const updatedGroup = await updateGroup(formData)
      setGroupsRows((current) => upsertPersistedRow(current, updatedGroup))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return

    try {
      await deleteGroup(selectedGroup.id)
      setGroupsRows((current) => softDeletePersistedRow(current, selectedGroup.id))
      setIsDeleteDialogOpen(false)
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
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Product Groups</h1>
          <p className="text-muted-foreground">Kelola kelompok produk untuk mendukung master data produk.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Group
        </Button>
      </div>

      <div className={shellClass}>
        <Input
          placeholder="Cari kode, nama, atau COA grup..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">ACC Omzet</th>
                <th className="px-4 py-3 text-left font-semibold">CDF Piutang</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedGroups.map((group, index) => (
                <tr key={group.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{group.code}</td>
                  <td className="px-4 py-3">{group.name}</td>
                  <td className="px-4 py-3">{group.acc_omzet || '-'}</td>
                  <td className="px-4 py-3">{group.cdf_piutang || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isGroupActive(group) ? 'default' : 'secondary'}>
                      {isGroupActive(group) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGroup(group)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading || deleteLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedGroup(group)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={deleteLoading || updateLoading}
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

        {displayedGroups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada product group ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Tambah Product Group</DialogTitle>
          </DialogHeader>
          <ProductGroupForm
            onSubmit={handleCreateGroup}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Product Group</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <ProductGroupForm
              group={selectedGroup}
              onSubmit={handleUpdateGroup}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Product Group?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus group <strong>{selectedGroup?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
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

