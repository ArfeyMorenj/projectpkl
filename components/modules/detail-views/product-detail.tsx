"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

interface ProductDetailViewProps {
  productId?: string
  onClose: () => void
  onSave: (formData: ProductDetailFormData) => void
  onDelete: (productId: string) => void
  product?: ProductDetailItem
}

interface ProductDetailFormData {
  code: string
  name: string
  identifier: string
  category: string
  author: string
  productionYear: string
  sellGroup: string
}

interface ProductDetailItem {
  id: string
  nama: string
  identifier?: string
  category?: string
  author?: string
  tahun?: string
  sellGroup?: string
}

export function ProductDetailView({ productId, onClose, onSave, onDelete, product }: ProductDetailViewProps) {
  const [formData, setFormData] = useState<ProductDetailFormData>({
    code: "",
    name: "",
    identifier: "",
    category: "",
    author: "",
    productionYear: "",
    sellGroup: "",
  })

  useEffect(() => {
    if (productId && product) {
      setFormData({
        code: product.id,
        name: product.nama,
        identifier: product.identifier || "",
        category: product.category || "",
        author: product.author ?? "",
        productionYear: product.tahun ?? "",
        sellGroup: product.sellGroup ?? "",
      })
    } else {
      setFormData({
        code: "",
        name: "",
        identifier: "",
        category: "",
        author: "",
        productionYear: "",
        sellGroup: "",
      })
    }
  }, [productId, product])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Nama produk harus diisi!")
      return
    }
    onSave(formData)
  }

  const handleNew = () => {
    setFormData({
      code: "",
      name: "",
      identifier: "",
      category: "",
      author: "",
      productionYear: "",
      sellGroup: "",
    })
  }

  const handleDelete = () => {
    if (productId) {
      if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
        onDelete(productId)
      }
    }
  }

  return (
    <Card className={`${shellClass} w-full`}>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-foreground mb-4">PRODUK</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Kode:</label>
            <Input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Auto Generated"
              disabled
              className="w-full bg-muted text-muted-foreground"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1">Nama Produk:</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama produk..."
              className="w-full"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1">Identifier:</label>
            <Input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Masukkan identifier..."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category:</label>
              <Input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Category..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Author:</label>
              <Input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author..."
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tahun Produksi:</label>
              <Input
                type="text"
                name="productionYear"
                value={formData.productionYear}
                onChange={handleInputChange}
                placeholder="Tahun..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Sell Group:</label>
              <Input
                type="text"
                name="sellGroup"
                value={formData.sellGroup}
                onChange={handleInputChange}
                placeholder="Sell Group..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-4 flex gap-2 justify-end">
          <Button onClick={handleNew} variant="outline" className="text-sm">
            Baru
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
            Simpan
          </Button>
          {productId && (
            <Button onClick={handleDelete} variant="destructive" className="text-sm">
              Hapus
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="text-sm">
            Keluar
          </Button>
        </div>
      </div>
    </Card>
  )
}
