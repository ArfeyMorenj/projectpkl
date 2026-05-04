"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

type ItemDetailFormData = {
  kodeItem: string
  namaItem: string
  satuan: string
  harga: number
  accOmzet: string
  accPutang: string
  csfPutang: string
}

type ItemDetailRecord = Partial<ItemDetailFormData> & {
  id?: string | number
  name?: string
}

interface ItemDetailViewProps {
  itemId?: string
  onClose: () => void
  onSave: (formData: ItemDetailFormData) => void
  onDelete?: (itemId: string) => void
  item?: ItemDetailRecord
}

export function ItemDetailView({ itemId, onClose, onSave, onDelete, item }: ItemDetailViewProps) {
  const [formData, setFormData] = useState<ItemDetailFormData>({
    kodeItem: "",
    namaItem: "",
    satuan: "",
    harga: 0,
    accOmzet: "",
    accPutang: "",
    csfPutang: "",
  })

  useEffect(() => {
    if (itemId && item) {
      setFormData({
        kodeItem: String(item.id ?? item.kodeItem ?? ""),
        namaItem: String(item.namaItem ?? item.name ?? ""),
        satuan: String(item.satuan ?? ""),
        harga: Number(item.harga ?? 0),
        accOmzet: String(item.accOmzet ?? ""),
        accPutang: String(item.accPutang ?? ""),
        csfPutang: String(item.csfPutang ?? ""),
      })
    } else {
      setFormData({
        kodeItem: "",
        namaItem: "",
        satuan: "",
        harga: 0,
        accOmzet: "",
        accPutang: "",
        csfPutang: "",
      })
    }
  }, [itemId, item])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const finalValue = name === "harga" ? (value ? Number(value) : 0) : value
    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleSave = () => {
    if (!formData.namaItem.trim()) {
      alert("Please enter item name")
      return
    }
    onSave(formData)
  }

  const handleNew = () => {
    setFormData({
      kodeItem: "",
      namaItem: "",
      satuan: "",
      harga: 0,
      accOmzet: "",
      accPutang: "",
      csfPutang: "",
    })
  }

  const handleDelete = () => {
    if (itemId && onDelete) {
      if (confirm("Are you sure you want to delete this item?")) {
        onDelete(itemId)
      }
    }
  }

  return (
    <div className={`${shellClass} max-w-2xl w-full space-y-6`}>
      <h2 className="text-2xl font-bold text-foreground">ITEM PRODUK</h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Kode Item</label>
            <input
              type="text"
              name="kodeItem"
              value={formData.kodeItem}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter item code"
              disabled={!!itemId}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Nama Item</label>
            <input
              type="text"
              name="namaItem"
              value={formData.namaItem}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter item name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Satuan</label>
            <input
              type="text"
              name="satuan"
              value={formData.satuan}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter unit"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Harga</label>
            <input
              type="number"
              name="harga"
              value={formData.harga}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter price"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Acc Omzet</label>
            <input
              type="text"
              name="accOmzet"
              value={formData.accOmzet}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter Acc Omzet"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Acc Putang</label>
            <input
              type="text"
              name="accPutang"
              value={formData.accPutang}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter Acc Putang"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Csf Putang</label>
          <input
            type="text"
            name="csfPutang"
            value={formData.csfPutang}
            onChange={handleInputChange}
            className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
            placeholder="Enter Csf Putang"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700 text-white px-8">
          Baru
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Simpan
        </Button>
        {itemId && (
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-8">
            Hapus
          </Button>
        )}
        <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-8">
          Keluar
        </Button>
      </div>
    </div>
  )
}

