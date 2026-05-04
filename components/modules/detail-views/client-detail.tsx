"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

type ClientDetailFormData = {
  kode: string
  status: string
  nama: string
  alamat: string
  telepon: string
  fax: string
  npwp: string
  namaPK: string
  alamatPK: string
}

type ClientDetailRecord = Partial<ClientDetailFormData>

interface ClientDetailViewProps {
  clientId?: string
  onClose: () => void
  onSave: (formData: ClientDetailFormData) => void
  onDelete?: (clientId: string) => void
  client?: ClientDetailRecord
}

export function ClientDetailView({ clientId, onClose, onSave, onDelete, client }: ClientDetailViewProps) {
  const [formData, setFormData] = useState<ClientDetailFormData>({
    kode: "",
    status: "ACTIVE",
    nama: "",
    alamat: "",
    telepon: "",
    fax: "",
    npwp: "",
    namaPK: "",
    alamatPK: "",
  })

  useEffect(() => {
    if (clientId && client) {
      setFormData({
        kode: client.kode ?? "",
        status: client.status || "ACTIVE",
        nama: client.nama ?? "",
        alamat: client.alamat ?? "",
        telepon: client.telepon ?? "",
        fax: client.fax ?? "",
        npwp: client.npwp ?? "",
        namaPK: client.namaPK || "",
        alamatPK: client.alamatPK || "",
      })
    } else {
      setFormData({
        kode: "",
        status: "ACTIVE",
        nama: "",
        alamat: "",
        telepon: "",
        fax: "",
        npwp: "",
        namaPK: "",
        alamatPK: "",
      })
    }
  }, [clientId, client])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!formData.nama.trim()) {
      alert("Please enter client name")
      return
    }
    onSave(formData)
  }

  const handleNew = () => {
    setFormData({
      kode: "",
      status: "ACTIVE",
      nama: "",
      alamat: "",
      telepon: "",
      fax: "",
      npwp: "",
      namaPK: "",
      alamatPK: "",
    })
  }

  const handleDelete = () => {
    if (clientId && onDelete) {
      if (confirm("Are you sure you want to delete this client?")) {
        onDelete(clientId)
      }
    }
  }

  return (
    <div className={`${shellClass} max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6`}>
      <h2 className="text-2xl font-bold text-foreground">CLIENTS</h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Kode</label>
            <input
              type="text"
              name="kode"
              value={formData.kode}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter client code"
              disabled={!!clientId}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Nama</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter client name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Alamat</label>
          <textarea
            name="alamat"
            value={formData.alamat}
            onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground h-20"
            placeholder="Enter client address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Telepon</label>
            <input
              type="text"
              name="telepon"
              value={formData.telepon}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Fax</label>
            <input
              type="text"
              name="fax"
              value={formData.fax}
              onChange={handleInputChange}
              className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
              placeholder="Enter fax number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">NPWP</label>
          <input
            type="text"
            name="npwp"
            value={formData.npwp}
            onChange={handleInputChange}
            className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
            placeholder="Enter NPWP"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-foreground mb-3">Nama Contact Person</h3>
          <input
            type="text"
            name="namaPK"
            value={formData.namaPK}
            onChange={handleInputChange}
            className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
            placeholder="Enter contact person name"
          />
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Alamat Contact Person</h3>
          <textarea
            name="alamatPK"
            value={formData.alamatPK}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded h-20"
            placeholder="Enter contact person address"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Save
        </Button>
        <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700 text-white px-8">
          New
        </Button>
        {clientId && (
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-8">
            Delete
          </Button>
        )}
        <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-8">
          Close
        </Button>
      </div>
    </div>
  )
}

