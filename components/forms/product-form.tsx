// Product Form Component
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Product, CreateProductRequest } from '@/lib/api/types/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProductGroups } from '@/lib/api/hooks'
import { toBooleanFlag } from '@/lib/utils/boolean'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function ProductForm({ product, onSubmit, onCancel, loading = false, error }: ProductFormProps) {
  const { data: productGroupsData, loading: groupsLoading } = useProductGroups()
  const productGroups = productGroupsData ?? []
  const [formData, setFormData] = useState<CreateProductRequest>({
    code: product?.code || '',
    name: product?.name || '',
    specification: product?.specification || '',
    author_code: product?.author_code || '',
    description: product?.description || '',
    compiler: product?.compiler || '',
    year: product?.year ? String(product.year) : '',
    product_group_id: product?.product_group_id ?? null,
    is_active: product?.is_active === undefined ? true : toBooleanFlag(product.is_active),
  })

  useEffect(() => {
    setFormData({
      code: product?.code || '',
      name: product?.name || '',
      specification: product?.specification || '',
      author_code: product?.author_code || '',
      description: product?.description || '',
      compiler: product?.compiler || '',
      year: product?.year ? String(product.year) : '',
      product_group_id: product?.product_group_id ?? null,
      is_active: product?.is_active === undefined ? true : toBooleanFlag(product.is_active),
    })
  }, [product])

  const handleInputChange = <K extends keyof CreateProductRequest>(
    field: K,
    value: CreateProductRequest[K]
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const selectedGroup = useMemo(
    () => productGroups.find((group) => group.id === Number(formData.product_group_id ?? 0)),
    [formData.product_group_id, productGroups]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card className="p-6 max-w-2xl">
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Code & Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Produk *</Label>
            <Input
              id="code"
              placeholder="PRD001"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              placeholder="Nama Produk"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Specification & Product Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="specification">Spesifikasi *</Label>
            <Input
              id="specification"
              placeholder="ACCOUNTING DAN KEUANGAN"
              value={formData.specification || ''}
              onChange={(e) => handleInputChange('specification', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_group_id">Product Group *</Label>
            <Select
              value={formData.product_group_id ? String(formData.product_group_id) : ''}
              onValueChange={(value) =>
                handleInputChange('product_group_id', value ? Number(value) : null)
              }
              disabled={loading || groupsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih grup produk" />
              </SelectTrigger>
              <SelectContent>
                {productGroups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.code} - {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGroup && (
              <p className="text-xs text-muted-foreground">
                Terpilih: {selectedGroup.code} - {selectedGroup.name}
              </p>
            )}
          </div>
        </div>

        {/* Author & Compiler */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="author_code">Kode Penulis *</Label>
            <Input
              id="author_code"
              placeholder="AUTH001"
              value={formData.author_code || ''}
              onChange={(e) => handleInputChange('author_code', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compiler">Compiler *</Label>
            <Input
              id="compiler"
              placeholder="Delphi 6"
              value={formData.compiler || ''}
              onChange={(e) => handleInputChange('compiler', e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Year */}
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="year">Tahun *</Label>
          <Input
            id="year"
            placeholder="2026"
            value={formData.year || ''}
            onChange={(e) => handleInputChange('year', e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Keterangan *</Label>
          <textarea
            id="description"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Keterangan produk..."
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={loading}
            rows={3}
            required
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', Boolean(checked))}
            disabled={loading}
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Aktif
          </Label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
