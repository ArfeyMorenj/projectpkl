'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { DebitCreditNoteListRow } from '@/lib/api/types/debit-credit-notes'

type DebitCreditNoteFormItem = {
  sequence?: number
  item_code: string
  item_name: string
  dpp_amount: number
  ppn_amount: number
}

type DebitCreditNoteLookupInvoice = {
  id: number | string
  invoice_number?: string
  no_invoice?: string
  number?: string
}

type DebitCreditNoteLookupClient = {
  id: number | string
  code?: string
  client_code?: string
  name?: string
  client_name?: string
}

type DebitCreditNoteItemSource = Partial<DebitCreditNoteFormItem> & {
  dpp_nota?: number | string
  ppn_nota?: number | string
}

type DebitCreditNoteFormNote = Partial<DebitCreditNoteListRow> & {
  id?: number
  invoice_id?: number | string
  client_id?: number | string
  description?: string
  dpp_amount?: number | string
  ppn_amount?: number | string
  auto_journal?: boolean
  items?: DebitCreditNoteItemSource[]
}

type DebitCreditNoteFormValues = {
  type: 'D' | 'K'
  number: string
  date: string
  invoice_id: string
  client_id: string
  description: string
  dpp_amount: number
  ppn_amount: number
  auto_journal: boolean
}

export type DebitCreditNoteFormSubmitData = {
  type: 'D' | 'K'
  number: string
  date: string
  invoice_id?: number
  client_id?: number
  description: string
  dpp_amount: number
  ppn_amount: number
  total_amount: number
  auto_journal: boolean
  items?: DebitCreditNoteFormItem[]
}

function normalizeDebitCreditNoteItem(item: DebitCreditNoteItemSource): DebitCreditNoteFormItem {
  return {
    sequence: item.sequence,
    item_code: item.item_code ?? '',
    item_name: item.item_name ?? '',
    dpp_amount: Number(item.dpp_amount ?? item.dpp_nota ?? 0),
    ppn_amount: Number(item.ppn_amount ?? item.ppn_nota ?? 0),
  }
}

interface DebitCreditNoteFormProps {
  note?: DebitCreditNoteFormNote
  onSubmit: (data: DebitCreditNoteFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
  invoices?: DebitCreditNoteLookupInvoice[]
  clients?: DebitCreditNoteLookupClient[]
}

export function DebitCreditNoteForm({
  note,
  onSubmit,
  onCancel,
  loading,
  error,
  invoices = [],
  clients = [],
}: DebitCreditNoteFormProps) {
  const getInvoiceLabel = (invoiceId: string) => {
    const invoice = invoices.find((item) => String(item.id) === invoiceId)
    if (!invoice) return '-'
    return invoice.invoice_number ?? invoice.no_invoice ?? invoice.number ?? String(invoice.id)
  }

  const getClientLabel = (clientId: string) => {
    const client = clients.find((item) => String(item.id) === clientId)
    if (!client) return '-'
    const code = client.code ?? client.client_code ?? client.id
    const name = client.name ?? client.client_name ?? client.id
    return `${code} - ${name}`
  }

  const [formData, setFormData] = useState<DebitCreditNoteFormValues>({
    type: note?.type || 'D',
    number: note?.number || '',
    date: note?.date || new Date().toISOString().split('T')[0],
    invoice_id: String(note?.invoice_id ?? ''),
    client_id: String(note?.client_id ?? ''),
    description: note?.description || '',
    dpp_amount: Number(note?.dpp_amount ?? 0),
    ppn_amount: Number(note?.ppn_amount ?? 0),
    auto_journal: note?.auto_journal ?? false,
  })

  const [items, setItems] = useState<DebitCreditNoteFormItem[]>(
    () => note?.items?.map((item) => normalizeDebitCreditNoteItem(item)) || []
  )
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const isEditing = Boolean(note)
  const canEditItems = isEditing

  useEffect(() => {
    setFormData({
      type: note?.type || 'D',
      number: note?.number || '',
      date: note?.date || new Date().toISOString().split('T')[0],
      invoice_id: String(note?.invoice_id ?? ''),
      client_id: String(note?.client_id ?? ''),
      description: note?.description || '',
      dpp_amount: Number(note?.dpp_amount ?? 0),
      ppn_amount: Number(note?.ppn_amount ?? 0),
      auto_journal: note?.auto_journal ?? false,
    })
    setItems(note?.items?.map((item) => normalizeDebitCreditNoteItem(item)) || [])
  }, [note])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.number.trim()) {
      errors.number = 'Nomor nota harus diisi'
    }
    if (!formData.date) {
      errors.date = 'Tanggal harus diisi'
    }
    if (!formData.invoice_id && !isEditing) {
      errors.invoice_id = 'Invoice wajib dipilih'
    }
    if (!formData.description.trim()) {
      errors.description = 'Keterangan harus diisi'
    }
    if (!formData.dpp_amount || Number(formData.dpp_amount) <= 0) {
      errors.dpp_amount = 'Total DPP harus lebih besar dari 0'
    }
    if (Number(formData.ppn_amount) < 0) {
      errors.ppn_amount = 'Total PPN tidak boleh negatif'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_code: '',
        item_name: '',
        dpp_amount: 0,
        ppn_amount: 0,
      },
    ])
  }

  const handleUpdateItem = <K extends keyof DebitCreditNoteFormItem>(
    idx: number,
    field: K,
    value: DebitCreditNoteFormItem[K]
  ) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const totalDPP = items.reduce((sum, item) => sum + (Number(item.dpp_amount) || 0), 0)
  const totalPPN = items.reduce((sum, item) => sum + (Number(item.ppn_amount) || 0), 0)
  const totalAmount = totalDPP + totalPPN

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        type: formData.type,
        number: formData.number,
        date: formData.date,
        invoice_id: formData.invoice_id ? parseInt(formData.invoice_id) : undefined,
        client_id: formData.client_id ? parseInt(formData.client_id) : undefined,
        description: formData.description,
        dpp_amount: Number(formData.dpp_amount),
        ppn_amount: Number(formData.ppn_amount),
        total_amount: Number(formData.dpp_amount) + Number(formData.ppn_amount),
        auto_journal: formData.auto_journal,
        items: canEditItems && items.length > 0 ? items : undefined,
      })
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  const noteTypeLabel = formData.type === 'D' ? 'Debit' : 'Kredit'
  const selectedInvoiceLabel = getInvoiceLabel(formData.invoice_id)
  const selectedClientLabel = getClientLabel(formData.client_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-100">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
        </Alert>
      )}

      <div className="rounded-3xl border border-cyan-500/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
            >
              {isEditing ? 'Mode edit' : 'Nota baru'}
            </Badge>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Informasi Nota Debit/Kredit</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Isikan header utama terlebih dahulu. Detail item bisa dilengkapi saat mode edit supaya alurnya tetap
                rapi dan aman.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Jenis aktif</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={[
                  'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
                  formData.type === 'D'
                    ? 'border-sky-500/20 bg-sky-500/10 text-sky-300'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
                ].join(' ')}
              >
                {noteTypeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base">Identitas Nota</CardTitle>
          <p className="text-sm text-muted-foreground">Data dasar untuk nomor, tanggal, dan jenis nota.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Jenis *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'D' | 'K' })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D">Debit</SelectItem>
                  <SelectItem value="K">Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Nomor Nota *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="DCN-202604-0001"
                disabled={loading}
                className="bg-background/70"
              />
              {formErrors.number && <p className="text-xs text-red-500">{formErrors.number}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={loading}
                className="bg-background/70"
              />
              {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base">Relasi Transaksi</CardTitle>
          <p className="text-sm text-muted-foreground">Hubungkan nota dengan invoice dan klien yang sesuai.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_id">Invoice Terkait *</Label>
              <Select
                value={formData.invoice_id}
                onValueChange={(value) => setFormData({ ...formData, invoice_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={String(inv.id)}>
                      {inv.invoice_number ?? inv.no_invoice ?? inv.number ?? inv.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.invoice_id && <p className="text-xs text-red-500">{formErrors.invoice_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Klien *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {(client.code ?? client.client_code ?? client.id)} - {(client.name ?? client.client_name ?? client.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.client_id && <p className="text-xs text-red-500">{formErrors.client_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Invoice terpilih</p>
              <p className="mt-2 truncate text-sm font-medium text-foreground">{selectedInvoiceLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Klien terpilih</p>
              <p className="mt-2 truncate text-sm font-medium text-foreground">{selectedClientLabel}</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-200/80">Total nilai</p>
              <p className="mt-2 text-lg font-semibold text-cyan-100">Rp {totalAmount.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base">Nilai Nota</CardTitle>
          <p className="text-sm text-muted-foreground">Nominal DPP dan PPN disimpan sebagai total header nota.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dpp_amount">Total DPP (Rp) *</Label>
              <Input
                id="dpp_amount"
                type="number"
                value={formData.dpp_amount}
                onChange={(e) => setFormData({ ...formData, dpp_amount: Number(e.target.value) || 0 })}
                placeholder="0"
                disabled={loading}
                min="0"
                className="bg-background/70"
              />
              {formErrors.dpp_amount && <p className="text-xs text-red-500">{formErrors.dpp_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ppn_amount">Total PPN (Rp)</Label>
              <Input
                id="ppn_amount"
                type="number"
                value={formData.ppn_amount}
                onChange={(e) => setFormData({ ...formData, ppn_amount: Number(e.target.value) || 0 })}
                placeholder="0"
                disabled={loading}
                min="0"
                className="bg-background/70"
              />
              {formErrors.ppn_amount && <p className="text-xs text-red-500">{formErrors.ppn_amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">DPP terhitung</p>
              <p className="mt-2 font-semibold text-foreground">Rp {formData.dpp_amount.toLocaleString('id-ID')}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">PPN terhitung</p>
              <p className="mt-2 font-semibold text-foreground">Rp {formData.ppn_amount.toLocaleString('id-ID')}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-200/80">Grand total</p>
              <p className="mt-2 text-lg font-semibold text-emerald-100">Rp {totalAmount.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base">Keterangan & Jurnal Otomatis</CardTitle>
          <p className="text-sm text-muted-foreground">Tambahkan konteks singkat agar nota lebih mudah ditelusuri.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Masukkan keterangan singkat..."
              disabled={loading}
              className="min-h-24 bg-background/70"
            />
            {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
          </div>

          <Separator className="bg-border/70" />

          <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
            <input
              id="auto_journal"
              type="checkbox"
              checked={formData.auto_journal}
              onChange={(e) => setFormData({ ...formData, auto_journal: e.target.checked })}
              disabled={loading}
              className="h-4 w-4 rounded border-border"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium text-foreground">Posting otomatis ke jurnal</span>
              <span className="block text-xs text-muted-foreground">
                Aktifkan agar backend langsung membuat jurnal ringkas ketika nota disimpan.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Item Nota</CardTitle>
            <p className="text-sm text-muted-foreground">Detail item mengikuti alur edit supaya data tetap rapi.</p>
          </div>
          {canEditItems ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={loading}
              className="border-border/70 bg-background/70"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          ) : (
            <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
              Item dilengkapi saat edit
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {canEditItems ? (
            items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Item {idx + 1}</p>
                        <p className="text-xs text-muted-foreground">Kode, nama, dan nominal item nota.</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={loading}
                        className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Kode Item</Label>
                        <Input
                          value={item.item_code || ''}
                          onChange={(e) => handleUpdateItem(idx, 'item_code', e.target.value)}
                          placeholder="Kode item"
                          className="bg-background/70"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nama Item</Label>
                        <Input
                          value={item.item_name || ''}
                          onChange={(e) => handleUpdateItem(idx, 'item_name', e.target.value)}
                          placeholder="Nama item"
                          className="bg-background/70"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">DPP (Rp)</Label>
                        <Input
                          type="number"
                          value={item.dpp_amount || 0}
                          onChange={(e) => handleUpdateItem(idx, 'dpp_amount', Number(e.target.value) || 0)}
                          placeholder="0"
                          className="bg-background/70"
                          disabled={loading}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">PPN (Rp)</Label>
                        <Input
                          type="number"
                          value={item.ppn_amount || 0}
                          onChange={(e) => handleUpdateItem(idx, 'ppn_amount', Number(e.target.value) || 0)}
                          placeholder="0"
                          className="bg-background/70"
                          disabled={loading}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Total DPP item</p>
                    <p className="mt-2 font-semibold text-foreground">Rp {totalDPP.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Total PPN item</p>
                    <p className="mt-2 font-semibold text-foreground">Rp {totalPPN.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-200/80">Total item</p>
                    <p className="mt-2 font-semibold text-emerald-100">Rp {totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-4 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-card/80">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">Belum ada item pada nota ini</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Klik tombol tambah item untuk melengkapi detail nota.
                </p>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-4 py-8 text-sm text-muted-foreground">
              Saat membuat nota baru, simpan header terlebih dahulu. Item akan tersedia setelah masuk mode edit, sehingga
              alurnya tetap ringan dan aman.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="border-border/70">
          Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 text-white hover:bg-cyan-700"
        >
          {loading ? 'Memproses...' : note ? 'Perbarui Nota' : 'Simpan Nota'}
        </Button>
      </div>
    </form>
  )
}
