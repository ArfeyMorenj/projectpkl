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
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/api/hooks'
import { ProductForm } from '@/components/forms/product-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Product, CreateProductRequest } from '@/lib/api/types/products'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function ProductsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Fetch hooks
  const { data: productsData, loading, error, refetch } = useProducts()

  // Mutation hooks
  const { mutate: createProduct, loading: createLoading, error: createError } = useCreateProduct()
  const { mutate: updateProduct, loading: updateLoading, error: updateError } = useUpdateProduct(selectedProduct?.id)
  const { mutate: deleteProduct, loading: deleteLoading } = useDeleteProduct()

  const { rows: products, setRows: setProducts } = usePersistedRows<Product>(
    'fitart_products_rows',
    productsData
  )
  const displayedProducts =
    searchTerm.trim().length >= 2
      ? products.filter((product) =>
          [product.code, product.name, product.specification, product.product_group?.code, product.product_group?.name]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : products
  const isProductActive = (product: Product) => toBooleanFlag(product.is_active)

  const handleCreateProduct = async (formData: CreateProductRequest) => {
    try {
      const createdProduct = await createProduct(formData)
      setProducts((current) => upsertPersistedRow(current, createdProduct))
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateProduct = async (formData: CreateProductRequest) => {
    try {
      const updatedProduct = await updateProduct(formData)
      setProducts((current) => upsertPersistedRow(current, updatedProduct))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    try {
      await deleteProduct(selectedProduct.id)
      setProducts((current) => softDeletePersistedRow(current, selectedProduct.id))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
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
  if (!products.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Tidak ada data produk</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={shellClass}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Manajemen Produk</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
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
        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Spesifikasi</th>
                <th className="px-4 py-3 text-left font-semibold">Grup</th>
                <th className="px-4 py-3 text-left font-semibold">Penulis</th>
                <th className="px-4 py-3 text-left font-semibold">Compiler</th>
                <th className="px-4 py-3 text-left font-semibold">Tahun</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product, idx) => (
                <tr key={product.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{product.code}</td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.specification || '-'}</td>
                  <td className="px-4 py-3">{product.product_group?.code ? `${product.product_group.code} - ${product.product_group.name}` : '-'}</td>
                  <td className="px-4 py-3">{product.author?.name || product.author_name || product.author_code || '-'}</td>
                  <td className="px-4 py-3">{product.compiler || '-'}</td>
                  <td className="px-4 py-3">{product.year || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isProductActive(product) ? 'default' : 'secondary'}>
                      {isProductActive(product) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(product)
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
                          setSelectedProduct(product)
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

        {displayedProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada produk ditemukan</div>
        )}

        {/* Total */}
        <div className="mt-4 text-sm text-foreground/75">Total: {displayedProducts.length} produk</div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreateProduct}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSubmit={handleUpdateProduct}
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
          <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus produk: <strong>{selectedProduct?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

