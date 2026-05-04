"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

const clientsMaster = [
  { code: "00049", name: "PT. CENDANA TEKNOLOGI", address: "" },
  { code: "00054", name: "FITNESS PLUS INDONESIA", address: "" },
]

const productsMaster = [
  { code: "P01", name: "PRODUK UTAMA" },
  { code: "P02", name: "PRODUK LAINNYA" },
]

const installationItemsMaster = [
  { code: "1", name: "HARDWARE" },
  { code: "2", name: "LICENSE" },
  { code: "3", name: "SOFTWARE" },
  { code: "4", name: "SERVICE" },
]

const teamMaster = [
  { code: "T01", name: "IMPLEMENTATOR 1" },
  { code: "T02", name: "IMPLEMENTATOR 2" },
  { code: "T03", name: "PROGRAMMER" },
  { code: "T04", name: "SYSTEM ANALYST" },
  { code: "T05", name: "SUPERVISOR" },
  { code: "T06", name: "CLIENT SUPERVISOR" },
]

function findClientByCode(code: string) {
  return clientsMaster.find((client) => client.code === code)
}

function findProductByCode(code: string) {
  return productsMaster.find((product) => product.code === code)
}

function findInstallationItemByCode(code: string) {
  return installationItemsMaster.find((item) => item.code === code)
}

function findTeamByCode(code: string) {
  return teamMaster.find((team) => team.code === code)
}

export interface WorkOrderFormData {
  nomor: string
  tanggal: string
  klienCode: string
  klienName: string
  produkCode: string
  produkName: string
  versi: string
  tglInstall: string
  jenisItemCode: string
  jenisItemName: string
  perBulan: boolean
  biaya: number
  startLicense: string
  implementator1Code: string
  implementator1Name: string
  implementator2Code: string
  implementator2Name: string
  programmerCode: string
  programmerName: string
  systemAnalystCode: string
  systemAnalystName: string
  supervisorCode: string
  supervisorName: string
  klienSpvCode: string
  klienSpvName: string
  keterangan: string
}

export interface WorkOrderRecord extends WorkOrderFormData {
  id: string
}

export interface WorkOrderDetailViewProps {
  woId?: string
  onClose: () => void
  onSave: (formData: WorkOrderFormData) => void
  onDelete: (woId: string) => void
  workOrder?: WorkOrderRecord
  defaultNomor: string
}

const emptyForm: WorkOrderFormData = {
  nomor: "",
  tanggal: "",
  klienCode: "",
  klienName: "",
  produkCode: "",
  produkName: "",
  versi: "",
  tglInstall: "",
  jenisItemCode: "",
  jenisItemName: "",
  perBulan: true,
  biaya: 0,
  startLicense: "",
  implementator1Code: "",
  implementator1Name: "",
  implementator2Code: "",
  implementator2Name: "",
  programmerCode: "",
  programmerName: "",
  systemAnalystCode: "",
  systemAnalystName: "",
  supervisorCode: "",
  supervisorName: "",
  klienSpvCode: "",
  klienSpvName: "",
  keterangan: "",
}

export function WorkOrderDetailView({ woId, onClose, onSave, onDelete, workOrder, defaultNomor }: WorkOrderDetailViewProps) {
  const [formData, setFormData] = useState<WorkOrderFormData>(emptyForm)

  useEffect(() => {
    if (workOrder) {
      setFormData(workOrder)
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setFormData({ ...emptyForm, nomor: defaultNomor, tanggal: today, tglInstall: today, startLicense: today.slice(0, 8) + "01" })
    }
  }, [defaultNomor, workOrder])

  const setTeam = (field: "implementator1" | "implementator2" | "programmer" | "systemAnalyst" | "supervisor" | "klienSpv", code: string) => {
    const teamName = findTeamByCode(code)?.name ?? ""
    setFormData((prev) => {
      if (field === "implementator1") return { ...prev, implementator1Code: code, implementator1Name: teamName }
      if (field === "implementator2") return { ...prev, implementator2Code: code, implementator2Name: teamName }
      if (field === "programmer") return { ...prev, programmerCode: code, programmerName: teamName }
      if (field === "systemAnalyst") return { ...prev, systemAnalystCode: code, systemAnalystName: teamName }
      if (field === "supervisor") return { ...prev, supervisorCode: code, supervisorName: teamName }
      return { ...prev, klienSpvCode: code, klienSpvName: teamName }
    })
  }

  const handleSave = () => {
    if (!formData.nomor.trim()) return alert("Nomor Work Order harus diisi.")
    if (!formData.klienCode.trim()) return alert("Kode klien harus diisi.")
    if (!formData.produkCode.trim()) return alert("Kode produk harus diisi.")
    onSave(formData)
  }

  const handleNew = () => {
    const today = new Date().toISOString().slice(0, 10)
    setFormData({ ...emptyForm, nomor: defaultNomor, tanggal: today, tglInstall: today, startLicense: today.slice(0, 8) + "01" })
  }

  return (
    <Card className={`${shellClass} w-full`}>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-foreground mb-4">WORK ORDER</h2>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nomor</label>
              <Input value={formData.nomor} onChange={(e) => setFormData((p) => ({ ...p, nomor: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <Input type="date" value={formData.tanggal} onChange={(e) => setFormData((p) => ({ ...p, tanggal: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tgl Install</label>
              <Input type="date" value={formData.tglInstall} onChange={(e) => setFormData((p) => ({ ...p, tglInstall: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Klien</label>
              <Input
                value={formData.klienCode}
                onChange={(e) => {
                  const code = e.target.value
                  const client = findClientByCode(code)
                  setFormData((p) => ({ ...p, klienCode: code, klienName: client?.name ?? "" }))
                }}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Nama Klien</label>
              <Input value={formData.klienName} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Produk</label>
              <Input
                value={formData.produkCode}
                onChange={(e) => {
                  const code = e.target.value
                  const product = findProductByCode(code)
                  setFormData((p) => ({ ...p, produkCode: code, produkName: product?.name ?? "" }))
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Produk</label>
              <Input value={formData.produkName} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Versi</label>
              <Input value={formData.versi} onChange={(e) => setFormData((p) => ({ ...p, versi: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Item</label>
              <Input
                value={formData.jenisItemCode}
                onChange={(e) => {
                  const code = e.target.value
                  const item = findInstallationItemByCode(code)
                  setFormData((p) => ({ ...p, jenisItemCode: code, jenisItemName: item?.name ?? "" }))
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Jenis Item</label>
              <Input value={formData.jenisItemName} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Biaya</label>
              <Input
                type="number"
                value={formData.biaya || 0}
                onChange={(e) => setFormData((p) => ({ ...p, biaya: Number(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start License</label>
              <Input type="date" value={formData.startLicense} onChange={(e) => setFormData((p) => ({ ...p, startLicense: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              id="per-bulan"
              type="checkbox"
              checked={formData.perBulan}
              onChange={(e) => setFormData((p) => ({ ...p, perBulan: e.target.checked }))}
            />
            <label htmlFor="per-bulan" className="text-sm font-medium">Jenis Item (Per Bulan)</label>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Implementator 1</label>
              <Input value={formData.implementator1Code} onChange={(e) => setTeam("implementator1", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Implementator 2</label>
              <Input value={formData.implementator2Code} onChange={(e) => setTeam("implementator2", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Programmer</label>
              <Input value={formData.programmerCode} onChange={(e) => setTeam("programmer", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">System Analyst</label>
              <Input value={formData.systemAnalystCode} onChange={(e) => setTeam("systemAnalyst", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Supervisor</label>
              <Input value={formData.supervisorCode} onChange={(e) => setTeam("supervisor", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Klien Spv</label>
              <Input value={formData.klienSpvCode} onChange={(e) => setTeam("klienSpv", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
          </div>
        </div>

        <div className="border-t pt-4 flex gap-2 justify-end">
          <Button onClick={handleNew} variant="outline" className="text-sm">Baru</Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">Simpan</Button>
          {woId && <Button onClick={() => onDelete(woId)} variant="destructive" className="text-sm">Hapus</Button>}
          <Button onClick={onClose} variant="outline" className="text-sm">Keluar</Button>
        </div>
      </div>
    </Card>
  )
}
