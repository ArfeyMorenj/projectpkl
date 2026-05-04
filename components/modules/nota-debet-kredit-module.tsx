"use client"

import { type ReactNode, useMemo, useState } from "react"
import { Eye, Edit2, Plus, Printer, RefreshCcw, Search, Trash2 } from "lucide-react"
import { DebitCreditNoteForm } from "@/components/forms/debit-credit-note-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useClients,
  useCreateDebitCreditNote,
  useDeleteDebitCreditNote,
  useDebitCreditNoteDetail,
  useDebitCreditNoteSummary,
  useDebitCreditNotes,
  useInvoices,
  useUpdateDebitCreditNote,
} from "@/lib/api/hooks"
import type {
  CreateDebitCreditNoteRequest,
  UpdateDebitCreditNoteRequest,
} from "@/lib/api/types/debit-credit-notes"
import type { DebitCreditNoteFormSubmitData } from "@/components/forms/debit-credit-note-form"

type NoteRecord = Record<string, unknown> & {
  header?: Record<string, unknown>
  items?: Array<Record<string, unknown>>
}

type LookupClient = {
  id: number | string
  code?: string
  client_code?: string
  name?: string
  client_name?: string
}

type LookupInvoice = {
  id: number | string
  no_invoice?: string
  number?: string
  noInvoice?: string
  invoice_number?: string
}

function extractRows(reportData: unknown): NoteRecord[] {
  if (Array.isArray(reportData)) return reportData as NoteRecord[]
  if (reportData && typeof reportData === "object") {
    const rows = (reportData as { rows?: unknown }).rows
    const data = (reportData as { data?: unknown }).data
    if (Array.isArray(rows)) return rows as NoteRecord[]
    if (Array.isArray(data)) return data as NoteRecord[]
  }
  return []
}

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData)) return {}
  if (reportData && typeof reportData === "object") {
    const data = (reportData as { data?: unknown }).data
    if (data && !Array.isArray(data) && typeof data === "object") {
      return data as NoteRecord
    }
  }
  return reportData as NoteRecord
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function formatCurrency(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`
}

function getString(row: Record<string, unknown> | null | undefined, keys: string[], fallback = "") {
  if (!row) return fallback
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return fallback
}

function getNumber(row: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!row) return 0
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && value !== "") {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

function getTypeLabel(type: string) {
  return type === "D" ? "Debit" : "Kredit"
}

function getTypeBadge(type: string) {
  const isDebit = type === "D"
  return (
    <Badge
      variant="outline"
      className={[
        "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        isDebit
          ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      ].join(" ")}
    >
      {isDebit ? "Debit" : "Kredit"}
    </Badge>
  )
}

function MetaField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="min-h-11 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground">
        {value}
      </div>
    </div>
  )
}

type FormNote = {
  type: "D" | "K"
  number: string
  date: string
  invoice_id?: string
  client_id?: string
  description: string
  dpp_amount: string
  ppn_amount: string
  auto_journal: boolean
  items?: Array<{
    item_code: string
    item_name: string
    dpp_amount: number
    ppn_amount: number
  }>
}

const emptyFormNote: FormNote = {
  type: "D",
  number: "",
  date: new Date().toISOString().slice(0, 10),
  invoice_id: "",
  client_id: "",
  description: "",
  dpp_amount: "",
  ppn_amount: "",
  auto_journal: true,
  items: [],
}

const shellClass =
  "rounded-3xl border border-border/70 bg-card/80 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm"

export function NotaDebetKreditModule() {
  const [tabActive, setTabActive] = useState("detail")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formKey, setFormKey] = useState("new")

  const { data: notesData, loading, error, refetch } = useDebitCreditNotes()
  const { data: noteDetail, loading: detailLoading, refetch: refetchDetail } = useDebitCreditNoteDetail(selectedNoteId ?? undefined)
  const { data: noteSummary, loading: summaryLoading } = useDebitCreditNoteSummary(selectedNoteId ?? undefined)
  const { data: clientsData } = useClients()
  const { data: invoicesData } = useInvoices()

  const { mutate: createNote, loading: creating, error: createError } = useCreateDebitCreditNote()
  const { mutate: updateNote, loading: updating, error: updateError } = useUpdateDebitCreditNote(selectedNoteId ?? undefined)
  const { mutate: deleteNote, loading: deleting } = useDeleteDebitCreditNote()

  const notes = useMemo(() => extractRows(notesData), [notesData])
  const clients = (clientsData ?? []) as unknown as LookupClient[]
  const invoices = (invoicesData ?? []) as unknown as LookupInvoice[]
  const selectedNote = useMemo(() => extractObject(noteDetail), [noteDetail])
  const selectedHeader = (selectedNote?.header ?? {}) as Record<string, unknown>
  const summaryRows = useMemo(() => extractRows(noteSummary), [noteSummary])

  const totals = useMemo(() => {
    return notes.reduce(
      (acc: { dpp: number; ppn: number; total: number }, note) => ({
        dpp: acc.dpp + getNumber(note, ["nominal_dpp", "dpp_amount"]),
        ppn: acc.ppn + getNumber(note, ["nominal_ppn", "ppn_amount"]),
        total: acc.total + getNumber(note, ["nominal_dpp", "dpp_amount"]) + getNumber(note, ["nominal_ppn", "ppn_amount"]),
      }),
      { dpp: 0, ppn: 0, total: 0 }
    )
  }, [notes])

  const filteredNotes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return notes

    return notes.filter((note) => {
      return (
        getString(note, ["number"]).toLowerCase().includes(q) ||
        getString(note, ["client_name"]).toLowerCase().includes(q) ||
        getString(note, ["client_code"]).toLowerCase().includes(q)
      )
    })
  }, [notes, searchTerm])

  const openCreateForm = () => {
    setFormMode("create")
    setSelectedNoteId(null)
    setFormKey(`new-${Date.now()}`)
    setFormOpen(true)
  }

  const openEditForm = (noteId: number) => {
    setFormMode("edit")
    setSelectedNoteId(noteId)
    setFormKey(`edit-${noteId}`)
    setFormOpen(true)
  }

  const openDetailFromList = (noteId: number) => {
    setSelectedNoteId(noteId)
    setTabActive("detail")
  }

  const handleListDelete = async (noteId: number) => {
    if (!noteId) return

    const ok = window.confirm("Apakah Anda yakin ingin menghapus nota ini?")
    if (!ok) return

    await deleteNote(noteId)
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null)
    }
    await refetch()
    if (selectedNoteId === noteId) {
      await refetchDetail()
    }
  }

  const buildFormNote = (mode: "create" | "edit"): FormNote => {
    if (mode === "create") return emptyFormNote

    const header = selectedHeader
    const matchedClient = clients.find((client) => String(client.code ?? client.client_code ?? client.id) === String(header.client_code ?? ""))
    const matchedInvoice = invoices.find((invoice) => String(invoice.no_invoice ?? invoice.number ?? invoice.noInvoice ?? invoice.id) === String(header.detail_invoice ?? ""))

    return {
      type: (header.jenis ?? "D") === "K" ? "K" : "D",
      number: String(header.number ?? ""),
      date: String(header.date ?? new Date().toISOString().slice(0, 10)),
      invoice_id: matchedInvoice ? String(matchedInvoice.id) : "",
      client_id: matchedClient ? String(matchedClient.id) : "",
      description: String(header.description ?? ""),
      dpp_amount: String(header.total_dpp ?? 0),
      ppn_amount: String(header.total_ppn ?? 0),
      auto_journal: Boolean(header.auto_journal ?? true),
      items: [],
    }
  }

  const handleSubmit = async (data: DebitCreditNoteFormSubmitData) => {
    const payload: CreateDebitCreditNoteRequest = {
      ...data,
      invoice_id: Number(data.invoice_id ?? 0),
      client_id: Number(data.client_id ?? 0),
      dpp_amount: Number(data.dpp_amount ?? 0),
      ppn_amount: Number(data.ppn_amount ?? 0),
      total_amount: Number(data.dpp_amount ?? 0) + Number(data.ppn_amount ?? 0),
      auto_journal: Boolean(data.auto_journal ?? true),
      is_posted: false,
      ...(data.items && data.items.length > 0 ? { items: data.items } : {}),
    }

    if (formMode === "create") {
      const result = await createNote(payload)
      const newId = result?.header?.id ?? null
      if (newId) {
        setSelectedNoteId(newId)
        setTabActive("detail")
      }
    } else if (selectedNoteId) {
      await updateNote(payload as UpdateDebitCreditNoteRequest)
    }

    setFormOpen(false)
    await refetch()
    if (selectedNoteId) {
      await refetchDetail()
    }
  }

  const handlePrint = () => {
    if (!selectedNoteId || !selectedHeader) return

    const noteType = getTypeLabel(String(selectedHeader.jenis ?? "D"))
    const titleNumber = escapeHtml(getString(selectedHeader, ["number"], "-"))
    const titleDate = escapeHtml(getString(selectedHeader, ["date"], "-"))
    const titleClient = escapeHtml(getString(selectedHeader, ["client_name"], "-"))
    const titleCode = escapeHtml(getString(selectedHeader, ["client_code"], "-"))
    const titleDescription = escapeHtml(getString(selectedHeader, ["description"], "-"))

    const rowsHtml =
      summaryRows.length > 0
        ? summaryRows
            .map(
              (row) => `
                <tr>
                  <td>${escapeHtml(getString(row, ["no_bukti"], "-"))}</td>
                  <td>${escapeHtml(getString(row, ["tgl"], "-"))}</td>
                  <td>${escapeHtml(getString(row, ["kode_acc"], "-"))}</td>
                  <td>${escapeHtml(getString(row, ["keterangan"], "-"))}</td>
                  <td class="right">${escapeHtml(formatCurrency(getNumber(row, ["debet"])))}</td>
                  <td class="right">${escapeHtml(formatCurrency(getNumber(row, ["kredit"])))}</td>
                </tr>
              `
            )
            .join("")
        : `
            <tr>
              <td colspan="6" style="text-align:center;color:#64748b;padding:18px;">Tidak ada jurnal ringkas untuk nota ini.</td>
            </tr>
          `

    const printWindow = window.open("", "", "width=980,height=720")
    if (!printWindow) return

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Nota ${noteType} ${titleNumber}</title>
          <style>
            :root { color-scheme: light; }
            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, Helvetica, sans-serif;
              background: #f8fafc;
              color: #0f172a;
            }
            .sheet {
              max-width: 920px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              padding: 32px;
              box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
            }
            .header {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 1px solid #e2e8f0;
              margin-bottom: 24px;
            }
            .eyebrow {
              display: inline-flex;
              padding: 6px 10px;
              border-radius: 999px;
              background: #ecfeff;
              color: #155e75;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            h1 {
              margin: 12px 0 8px;
              font-size: 28px;
              line-height: 1.2;
            }
            .muted {
              color: #64748b;
              font-size: 13px;
              line-height: 1.6;
            }
            .meta {
              min-width: 220px;
              padding: 16px;
              border: 1px solid #e2e8f0;
              border-radius: 18px;
              background: #f8fafc;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 12px;
              margin-bottom: 24px;
            }
            .field {
              border: 1px solid #e2e8f0;
              border-radius: 18px;
              padding: 14px 16px;
              background: #f8fafc;
            }
            .field span {
              display: block;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f8fafc;
              font-size: 11px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #475569;
            }
            .right {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div>
                <span class="eyebrow">Nota ${noteType}</span>
                <h1>${noteType} ${titleNumber}</h1>
                <div class="muted">Ringkasan nota yang lebih bersih untuk kebutuhan preview atau cetak cepat.</div>
              </div>
              <div class="meta">
                <div class="muted">Nomor</div>
                <strong>${titleNumber}</strong>
                <div style="height:10px"></div>
                <div class="muted">Tanggal</div>
                <strong>${titleDate}</strong>
              </div>
            </div>

            <div class="grid">
              <div class="field">
                <span>Kode Mitra</span>
                <strong>${titleCode}</strong>
              </div>
              <div class="field">
                <span>Nama Mitra</span>
                <strong>${titleClient}</strong>
              </div>
              <div class="field">
                <span>Keterangan</span>
                <strong>${titleDescription}</strong>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>No. Bukti</th>
                  <th>Tanggal</th>
                  <th>Kode Akun</th>
                  <th>Keterangan</th>
                  <th class="right">Debit</th>
                  <th class="right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className={shellClass}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Card className={shellClass}>
          <div className="space-y-4">
            <div className="text-red-500 font-semibold">Gagal memuat nota debit/kredit: {error.message}</div>
            <Button onClick={refetch} className="bg-cyan-600 text-white hover:bg-cyan-700">
              Coba Lagi
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Card className="overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] shadow-[0_30px_100px_-45px_rgba(15,23,42,0.6)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-cyan-500/20 bg-cyan-500/10 text-cyan-200">
              Finance Journal
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Nota Debit/Kredit</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Tampilan yang lebih tenang, modern, dan fokus untuk mengelola nota debit dan kredit tanpa terasa
                ramai. Detail, daftar, dan jurnal ringkas tetap tersedia dalam satu layar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full bg-white/10 text-slate-200">
                Terhubung ke backend
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-white/10 text-slate-200">
                Create, edit, delete
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-white/10 text-slate-200">
                Cetak cepat
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Total Nota</p>
              <div className="mt-2 text-2xl font-semibold text-foreground">{notes.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Total DPP</p>
              <div className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(totals.dpp)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Total PPN</p>
              <div className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(totals.ppn)}</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={tabActive} onValueChange={setTabActive} className="space-y-5">
        <div className="rounded-3xl border border-border/70 bg-card/70 p-2 shadow-sm">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-muted/70 p-1">
            <TabsTrigger value="detail" className="rounded-xl py-2.5">
              Detail
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-xl py-2.5">
              Daftar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="detail" className="space-y-6">
          <Card className="border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Aksi cepat</p>
                <p className="text-sm text-muted-foreground">Buat nota baru atau cetak detail nota yang sedang dipilih.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={openCreateForm} className="bg-cyan-600 text-white hover:bg-cyan-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nota Baru
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="border-border/70 bg-background/70"
                  disabled={!selectedNoteId || detailLoading}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak
                </Button>
                <Button
                  onClick={async () => {
                    await refetch()
                    if (selectedNoteId) {
                      await refetchDetail()
                    }
                  }}
                  variant="ghost"
                  className="border border-border/70 bg-background/60"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Muat Ulang
                </Button>
              </div>
            </div>
          </Card>

          {selectedNoteId ? (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-border/70 bg-card/80 p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">Detail Nota</h2>
                    <p className="text-sm text-muted-foreground">Informasi utama nota yang sedang dipilih.</p>
                  </div>
                  {getTypeBadge(getString(selectedHeader, ["jenis"], "D"))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <MetaField label="Nomor Nota" value={getString(selectedHeader, ["number"], "-")} />
                  <MetaField label="Tanggal" value={getString(selectedHeader, ["date"], "-")} />
                  <MetaField
                    label="Jenis"
                    value={getTypeBadge(getString(selectedHeader, ["jenis"], "D"))}
                  />
                  <MetaField label="Kode Mitra" value={getString(selectedHeader, ["client_code"], "-")} />
                </div>

                <div className="mt-4 space-y-4">
                  <MetaField label="Nama Mitra" value={getString(selectedHeader, ["client_name"], "-")} />
                  <MetaField label="Keterangan" value={getString(selectedHeader, ["description"], "-")} />
                </div>
              </Card>

              <Card className="border-border/70 bg-card/80 p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">Ringkasan Jurnal</h2>
                    <p className="text-sm text-muted-foreground">Data yang dikirim dari endpoint summary-journal.</p>
                  </div>
                  {summaryLoading && <span className="text-sm text-muted-foreground">Memuat...</span>}
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/70">
                        <TableHead>No. Bukti</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kode Akun</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                            Belum ada jurnal ringkas untuk nota terpilih.
                          </TableCell>
                        </TableRow>
                      ) : (
                        summaryRows.map((row, index) => (
                          <TableRow key={`${getString(row, ["no_bukti"], "row")}-${index}`} className="hover:bg-muted/40">
                            <TableCell className="font-mono text-sm">{getString(row, ["no_bukti"], "-")}</TableCell>
                            <TableCell className="font-mono text-sm">{getString(row, ["tgl"], "-")}</TableCell>
                            <TableCell className="font-mono text-sm">{getString(row, ["kode_acc"], "-")}</TableCell>
                            <TableCell className="text-sm">{getString(row, ["keterangan"], "-")}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatCurrency(getNumber(row, ["debet"]))}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatCurrency(getNumber(row, ["kredit"]))}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="border-border/70 bg-card/80 p-8 text-sm text-muted-foreground shadow-sm">
              Pilih satu nota dari daftar untuk melihat detailnya.
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card className="border-border/70 bg-card/80 p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label htmlFor="search-nota" className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Cari nomor, kode, atau nama
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-nota"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nota debit / kredit"
                    className="bg-background/70 pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="border-border/70 bg-background/70"
                >
                  Bersihkan
                </Button>
                <Button onClick={() => setTabActive("detail")} className="bg-cyan-600 text-white hover:bg-cyan-700">
                  Lihat Detail
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/70">
                    <TableHead>Nomor Nota</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kode Mitra</TableHead>
                    <TableHead>Nama Mitra</TableHead>
                    <TableHead className="text-right">Total DPP</TableHead>
                    <TableHead className="text-right">Total PPN</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        Belum ada nota debit/kredit untuk filter yang dipilih.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotes.map((note, idx) => {
                      const noteId = Number(note.note_id ?? note.id ?? 0)
                      const isActive = selectedNoteId === noteId

                      return (
                        <TableRow
                          key={String(note.id ?? idx)}
                          className={[
                            "transition-colors hover:bg-muted/40",
                            isActive ? "bg-cyan-500/5" : idx % 2 === 0 ? "bg-muted/20" : "bg-background/40",
                          ].join(" ")}
                        >
                          <TableCell className="text-sm font-medium">
                            {getString(note, ["number", "no_note"], "-")}
                          </TableCell>
                          <TableCell className="text-sm">{getString(note, ["date"], "-")}</TableCell>
                          <TableCell className="text-sm">{getTypeBadge(getString(note, ["type"], "D"))}</TableCell>
                          <TableCell className="text-sm">{getString(note, ["client_code"], "-")}</TableCell>
                          <TableCell className="text-sm">{getString(note, ["client_name"], "-")}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(getNumber(note, ["nominal_dpp", "dpp_amount"]))}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(getNumber(note, ["nominal_ppn", "ppn_amount"]))}</TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                                onClick={() => openDetailFromList(noteId)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Detail</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                onClick={() => openEditForm(noteId)}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Ubah</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => handleListDelete(noteId)}
                                disabled={deleting}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-border/70 bg-card text-card-foreground shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-border/60 pb-4">
            <DialogTitle className="text-2xl">
              {formMode === "create" ? "Buat Nota Debit/Kredit" : "Ubah Nota Debit/Kredit"}
            </DialogTitle>
            <DialogDescription>
              Form yang lebih bersih untuk mencatat nota debit/kredit dengan alur input yang lebih nyaman.
            </DialogDescription>
          </DialogHeader>
          <DebitCreditNoteForm
            key={formKey}
            note={buildFormNote(formMode)}
            clients={clients}
            invoices={invoices}
            error={formMode === "create" ? createError : updateError}
            loading={creating || updating}
            onCancel={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
