"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Minus, Plus } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Bank } from "@/lib/api/types/banks"
import type { Client } from "@/lib/api/types/clients"
import type { Invoice } from "@/lib/api/types/invoices"
import type {
  CreatePostingPaymentRequest,
  CreatePostingPaymentCostItem,
  CreatePostingPaymentInvoiceItem,
} from "@/lib/api/types/posting-payments"

export type PostingPaymentFormSubmitData = CreatePostingPaymentRequest

interface PostingPaymentFormProps {
  banks?: Bank[]
  clients?: Client[]
  invoices?: Invoice[]
  onSubmit: (data: PostingPaymentFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

type InvoiceDraft = {
  invoice_id: string
  amount: string
  ppn: string
}

type CostDraft = {
  description: string
  amount: string
}

function formatDateInput(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function generatePostingNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `BP-${year}${month}-0001`
}

function getInvoiceLabel(invoice: Invoice) {
  return invoice.number ?? invoice.invoice_number ?? invoice.no_invoice ?? `INV #${invoice.id}`
}

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function PostingPaymentForm({
  banks = [],
  clients = [],
  invoices = [],
  onSubmit,
  onCancel,
  loading = false,
  error,
}: PostingPaymentFormProps) {
  const invoiceMap = useMemo(() => new Map(invoices.map((invoice) => [invoice.id, invoice])), [invoices])

  const [number, setNumber] = useState(generatePostingNumber)
  const [date, setDate] = useState(formatDateInput())
  const [bankId, setBankId] = useState("")
  const [clientId, setClientId] = useState("")
  const [description, setDescription] = useState("")
  const [printReceipt, setPrintReceipt] = useState(true)
  const [autoJournal, setAutoJournal] = useState(true)
  const [withoutStamp, setWithoutStamp] = useState(false)
  const [invoiceRows, setInvoiceRows] = useState<InvoiceDraft[]>([
    { invoice_id: "", amount: "", ppn: "" },
  ])
  const [costRows, setCostRows] = useState<CostDraft[]>([
    { description: "", amount: "" },
  ])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInvoiceChange = (index: number, invoiceId: string) => {
    const selected = invoiceMap.get(Number(invoiceId))
    setInvoiceRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row
        return {
          invoice_id: invoiceId,
          amount: String(
            selected?.subtotal ??
              selected?.total_amount ??
              selected?.outstanding_amount ??
              selected?.tax_amount ??
              0
          ),
          ppn: String(selected?.tax_amount ?? 0),
        }
      })
    )

    if (selected?.client_id) {
      setClientId(String(selected.client_id))
    }
  }

  const addInvoiceRow = () => {
    setInvoiceRows((prev) => [...prev, { invoice_id: "", amount: "", ppn: "" }])
  }

  const removeInvoiceRow = (index: number) => {
    setInvoiceRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
  }

  const addCostRow = () => {
    setCostRows((prev) => [...prev, { description: "", amount: "" }])
  }

  const removeCostRow = (index: number) => {
    setCostRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!number.trim()) errors.number = "Nomor posting harus diisi"
    if (!date) errors.date = "Tanggal harus diisi"
    if (!bankId) errors.bank_id = "Bank harus dipilih"
    if (!clientId) errors.client_id = "Klien harus dipilih"

    const validInvoices = invoiceRows.filter((row) => row.invoice_id || row.amount || row.ppn)
    if (validInvoices.length === 0) {
      errors.invoices = "Minimal 1 invoice harus dipilih"
    } else {
      validInvoices.forEach((row, index) => {
        if (!row.invoice_id) errors[`invoice_id_${index}`] = "Invoice harus dipilih"
        if (!row.amount || Number.isNaN(Number(row.amount))) errors[`amount_${index}`] = "Amount harus diisi"
        if (!row.ppn || Number.isNaN(Number(row.ppn))) errors[`ppn_${index}`] = "PPN harus diisi"
      })
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const invoicesPayload: CreatePostingPaymentInvoiceItem[] = invoiceRows
      .filter((row) => row.invoice_id)
      .map((row) => ({
        invoice_id: Number(row.invoice_id),
        amount: toNumber(row.amount),
        ppn: toNumber(row.ppn),
      }))

    const costsPayload: CreatePostingPaymentCostItem[] = costRows
      .filter((row) => row.description.trim() || row.amount)
      .map((row) => ({
        description: row.description.trim(),
        amount: toNumber(row.amount),
      }))

    await onSubmit({
      number: number.trim(),
      date,
      bank_id: Number(bankId),
      client_id: Number(clientId),
      description: description.trim() || undefined,
      print_receipt: printReceipt,
      auto_journal: autoJournal,
      without_stamp: withoutStamp,
      invoices: invoicesPayload,
      costs: costsPayload,
    })
  }

  const totalInvoice = invoiceRows.reduce((sum, row) => sum + toNumber(row.amount) + toNumber(row.ppn), 0)
  const totalCost = costRows.reduce((sum, row) => sum + toNumber(row.amount), 0)
  const netTotal = totalInvoice - totalCost

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
        </Alert>
      )}

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Header Posting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="number">Nomor Posting *</Label>
              <Input
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                disabled={loading}
              />
              {formErrors.number && <p className="text-xs text-red-500">{formErrors.number}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
              />
              {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank">Bank *</Label>
              <Select value={bankId} onValueChange={setBankId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={String(bank.id)}>
                      {bank.code} - {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.bank_id && <p className="text-xs text-red-500">{formErrors.bank_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Klien *</Label>
              <Select value={clientId} onValueChange={setClientId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.code} - {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.client_id && <p className="text-xs text-red-500">{formErrors.client_id}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Batch posting pembayaran invoice"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/40 p-4">
              <Checkbox checked={printReceipt} onCheckedChange={(checked) => setPrintReceipt(Boolean(checked))} />
              <span className="text-sm">Print receipt</span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/40 p-4">
              <Checkbox checked={autoJournal} onCheckedChange={(checked) => setAutoJournal(Boolean(checked))} />
              <span className="text-sm">Auto journal</span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/40 p-4">
              <Checkbox checked={withoutStamp} onCheckedChange={(checked) => setWithoutStamp(Boolean(checked))} />
              <span className="text-sm">Without stamp</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Detail Invoice</CardTitle>
          <Button type="button" variant="outline" onClick={addInvoiceRow} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Invoice
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formErrors.invoices && <p className="text-sm text-red-500">{formErrors.invoices}</p>}
          {invoiceRows.map((row, index) => (
            <div key={`invoice-row-${index}`} className="grid gap-3 rounded-2xl border border-border/70 bg-background/40 p-4 md:grid-cols-[1.3fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <Label>Invoice *</Label>
                <Select value={row.invoice_id} onValueChange={(value) => handleInvoiceChange(index, value)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={String(invoice.id)}>
                        {getInvoiceLabel(invoice)} - {invoice.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors[`invoice_id_${index}`] && (
                  <p className="text-xs text-red-500">{formErrors[`invoice_id_${index}`]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={row.amount}
                  onChange={(e) =>
                    setInvoiceRows((prev) =>
                      prev.map((item, rowIndex) => (rowIndex === index ? { ...item, amount: e.target.value } : item))
                    )
                  }
                  disabled={loading}
                />
                {formErrors[`amount_${index}`] && <p className="text-xs text-red-500">{formErrors[`amount_${index}`]}</p>}
              </div>
              <div className="space-y-2">
                <Label>PPN *</Label>
                <Input
                  type="number"
                  value={row.ppn}
                  onChange={(e) =>
                    setInvoiceRows((prev) =>
                      prev.map((item, rowIndex) => (rowIndex === index ? { ...item, ppn: e.target.value } : item))
                    )
                  }
                  disabled={loading}
                />
                {formErrors[`ppn_${index}`] && <p className="text-xs text-red-500">{formErrors[`ppn_${index}`]}</p>}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeInvoiceRow(index)}
                  disabled={loading || invoiceRows.length === 1}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Detail Biaya</CardTitle>
          <Button type="button" variant="outline" onClick={addCostRow} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Biaya
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {costRows.map((row, index) => (
            <div key={`cost-row-${index}`} className="grid gap-3 rounded-2xl border border-border/70 bg-background/40 p-4 md:grid-cols-[1fr_220px_auto]">
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  value={row.description}
                  onChange={(e) =>
                    setCostRows((prev) =>
                      prev.map((item, rowIndex) =>
                        rowIndex === index ? { ...item, description: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Biaya admin bank"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  value={row.amount}
                  onChange={(e) =>
                    setCostRows((prev) =>
                      prev.map((item, rowIndex) => (rowIndex === index ? { ...item, amount: e.target.value } : item))
                    )
                  }
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeCostRow(index)}
                  disabled={loading || costRows.length === 1}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Invoice</p>
            <p className="mt-1 text-xl font-semibold">Rp {totalInvoice.toLocaleString("id-ID")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Biaya</p>
            <p className="mt-1 text-xl font-semibold">Rp {totalCost.toLocaleString("id-ID")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Perkiraan Bersih</p>
            <p className="mt-1 text-xl font-semibold">Rp {netTotal.toLocaleString("id-ID")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={loading} type="button">
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          {loading ? "Menyimpan..." : "Simpan Posting"}
        </Button>
      </div>
    </form>
  )
}
