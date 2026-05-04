'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from '@/lib/api/hooks'
import { ItemForm } from '@/components/forms/item-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Item, CreateItemRequest } from '@/lib/api/types/items'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

export function ItemsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Fetch hooks
  const { data: itemsData, loading, error, refetch } = useItems()

  // Mutation hooks
  const { mutate: createItem, loading: createLoading, error: createError } = useCreateItem()
  const { mutate: updateItem, loading: updateLoading, error: updateError } = useUpdateItem(selectedItem?.id)
  const { mutate: deleteItem, loading: deleteLoading } = useDeleteItem()

  const { rows: items, setRows: setItems } = usePersistedRows<Item>('fitart_items_rows', itemsData)
  const displayedItems =
    searchTerm.trim().length >= 2
      ? items.filter((item) =>
          [item.code, item.name, item.acc_omzet, item.acc_piutang, item.cdf_omzet, item.cdf_piutang]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : items
  const isItemActive = (item: Item) => toBooleanFlag(item.is_active)

  const handleCreateItem = async (formData: CreateItemRequest) => {
    try {
      const createdItem = await createItem(formData)
      setItems((current) => upsertPersistedRow(current, createdItem))
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateItem = async (formData: CreateItemRequest) => {
    try {
      const updatedItem = await updateItem(formData)
      setItems((current) => upsertPersistedRow(current, updatedItem))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return
    try {
      await deleteItem(selectedItem.id)
      setItems((current) => softDeletePersistedRow(current, selectedItem.id))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
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

  // Empty state
  if (!items.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Tidak ada data item</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Item
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Manajemen Item</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Item
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Cari berdasarkan nama atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Acc Omzet</th>
                <th className="px-4 py-3 text-left font-semibold">Acc Piutang</th>
                <th className="px-4 py-3 text-left font-semibold">CDF Omzet</th>
                <th className="px-4 py-3 text-left font-semibold">CDF Piutang</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{item.code}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.acc_omzet_name || item.acc_omzet}</td>
                  <td className="px-4 py-3">{item.acc_piutang_name || item.acc_piutang}</td>
                  <td className="px-4 py-3">{item.cdf_omzet_name || item.cdf_omzet}</td>
                  <td className="px-4 py-3">{item.cdf_piutang_name || item.cdf_piutang}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isItemActive(item) ? 'default' : 'secondary'}>
                      {isItemActive(item) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item)
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
                          setSelectedItem(item)
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

        {displayedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada item ditemukan</div>
        )}

        {/* Total */}
        <div className="mt-4 text-sm text-foreground/75">Total: {displayedItems.length} item</div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Item Baru</DialogTitle>
          </DialogHeader>
          <ItemForm
            onSubmit={handleCreateItem}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <ItemForm
              item={selectedItem}
              onSubmit={handleUpdateItem}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Item?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus item: <strong>{selectedItem?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

