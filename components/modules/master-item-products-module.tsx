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
import { AlertCircle, Edit2, Plus, Power, Trash2 } from 'lucide-react'
import { MasterItemProductForm } from '@/components/forms/master-item-product-form'
import {
  useCreateMasterItemProduct,
  useDeleteMasterItemProduct,
  useMasterItemProducts,
  useToggleMasterItemProductStatus,
  useUpdateMasterItemProduct,
} from '@/lib/api/hooks'
import type {
  MasterItemProduct,
  CreateMasterItemProductRequest,
} from '@/lib/api/types/master-item-products'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

export function MasterItemProductsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItemProduct, setSelectedItemProduct] = useState<MasterItemProduct | null>(null)

  const { data: itemProducts, loading, error, refetch } = useMasterItemProducts()

  const { mutate: createItemProduct, loading: createLoading, error: createError } =
    useCreateMasterItemProduct()
  const { mutate: updateItemProduct, loading: updateLoading, error: updateError } =
    useUpdateMasterItemProduct(selectedItemProduct?.id ?? null)
  const { mutate: deleteItemProduct, loading: deleteLoading } = useDeleteMasterItemProduct()
  const { mutate: toggleStatus, loading: toggleLoading } = useToggleMasterItemProductStatus()

  const { rows: persistedItemProducts, setRows: setPersistedItemProducts } = usePersistedRows<MasterItemProduct>(
    'fitart_master_item_products_rows',
    itemProducts
  )

  const displayedItemProducts = useMemo(
    () => {
      const query = searchTerm.trim().toLowerCase()
      if (!query) return persistedItemProducts

      return persistedItemProducts.filter((itemProduct) =>
        [
          itemProduct.code,
          itemProduct.name,
          itemProduct.unit,
          itemProduct.acc_omzet,
          itemProduct.acc_omzet_np || '',
          itemProduct.acc_piutang,
          itemProduct.cdf_piutang,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    },
    [persistedItemProducts, searchTerm]
  )

  const handleCreate = async (formData: CreateMasterItemProductRequest) => {
    const createdItemProduct = await createItemProduct({
      ...formData,
      price: Number(formData.price),
      acc_omzet_np: formData.acc_omzet_np || undefined,
      is_active: formData.is_active ?? true,
    })
    setPersistedItemProducts((current) => upsertPersistedRow(current, createdItemProduct))
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (formData: CreateMasterItemProductRequest) => {
    const updatedItemProduct = await updateItemProduct({
      ...formData,
      price: Number(formData.price),
      acc_omzet_np: formData.acc_omzet_np || undefined,
      is_active: formData.is_active ?? true,
    })
    setPersistedItemProducts((current) => upsertPersistedRow(current, updatedItemProduct))
    setIsEditDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedItemProduct) return
    await deleteItemProduct(selectedItemProduct.id)
    setPersistedItemProducts((current) => softDeletePersistedRow(current, selectedItemProduct.id))
    setIsDeleteDialogOpen(false)
  }

  const handleToggle = async (itemProduct: MasterItemProduct) => {
    const updatedItemProduct = await toggleStatus(itemProduct.id)
    setPersistedItemProducts((current) => upsertPersistedRow(current, updatedItemProduct))
  }

  const isItemProductActive = (itemProduct: MasterItemProduct) => toBooleanFlag(itemProduct.is_active)

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
          <h1 className="text-3xl font-bold">Master Item Products</h1>
          <p className="text-muted-foreground">Kelola kombinasi item dan product untuk invoice items.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Mapping
        </Button>
      </div>

      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm space-y-4">
        <Input
          placeholder="Cari kode atau nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Unit</th>
                <th className="px-4 py-3 text-left font-semibold">Price</th>
                <th className="px-4 py-3 text-left font-semibold">Acc Omzet</th>
                <th className="px-4 py-3 text-left font-semibold">Acc Omzet NP</th>
                <th className="px-4 py-3 text-left font-semibold">Acc Piutang</th>
                <th className="px-4 py-3 text-left font-semibold">CDF Piutang</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedItemProducts.map((itemProduct, index) => (
                <tr key={itemProduct.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{itemProduct.code}</td>
                  <td className="px-4 py-3">{itemProduct.name}</td>
                  <td className="px-4 py-3">{itemProduct.unit}</td>
                  <td className="px-4 py-3">Rp {Number(itemProduct.price || 0).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">{itemProduct.acc_omzet}</td>
                  <td className="px-4 py-3">{itemProduct.acc_omzet_np || '-'}</td>
                  <td className="px-4 py-3">{itemProduct.acc_piutang}</td>
                  <td className="px-4 py-3">{itemProduct.cdf_piutang}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isItemProductActive(itemProduct) ? 'default' : 'secondary'}>
                      {isItemProductActive(itemProduct) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItemProduct(itemProduct)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading || deleteLoading || toggleLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(itemProduct)}
                        disabled={toggleLoading || updateLoading || deleteLoading}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedItemProduct(itemProduct)
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

        {displayedItemProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada mapping ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Mapping</DialogTitle>
          </DialogHeader>
          <MasterItemProductForm
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
            <DialogTitle>Edit Mapping</DialogTitle>
          </DialogHeader>
          {selectedItemProduct && (
            <MasterItemProductForm
              itemProduct={selectedItemProduct}
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
          <AlertDialogTitle>Hapus Mapping?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus mapping <strong>{selectedItemProduct?.name}</strong>?
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
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

