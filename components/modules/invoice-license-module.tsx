"use client"

import { useMemo, useState } from "react"
import { Eye, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  useInvoiceLicenseDetail,
  useInvoiceLicenseSummaryJournal,
  useInvoicesLicense,
} from "@/lib/api/hooks"

type ReportRow = Record<string, unknown>

function extractRows(reportData: unknown): ReportRow[] {
  if (Array.isArray(reportData)) return reportData as ReportRow[]
  if (reportData && typeof reportData === "object") {
    const rows = (reportData as { rows?: unknown }).rows
    const data = (reportData as { data?: unknown }).data
    if (Array.isArray(rows)) return rows as ReportRow[]
    if (Array.isArray(data)) return data as ReportRow[]
  }
  return []
}

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData)) return {}
  if (reportData && typeof reportData === "object") {
    const data = (reportData as { data?: unknown }).data
    if (data && !Array.isArray(data) && typeof data === "object") {
      return data as Record<string, unknown>
    }
    const candidate = reportData as Record<string, unknown>
    const nestedInvoice = candidate.invoice
    if (nestedInvoice && !Array.isArray(nestedInvoice) && typeof nestedInvoice === "object") {
      return nestedInvoice as Record<string, unknown>
    }
    const nestedDetail = candidate.detail
    if (nestedDetail && !Array.isArray(nestedDetail) && typeof nestedDetail === "object") {
      return nestedDetail as Record<string, unknown>
    }
  }
  return reportData as Record<string, unknown>
}

function getString(row: ReportRow, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return fallback
}

function getNumber(row: ReportRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && value !== "") {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

function getValue(row: ReportRow, keys: string[], fallback = "-") {
  return getString(row, keys, fallback)
}

type InvoiceRow = {
  id: number
  noInvoice: string
  tanggal: string
  namaKlien: string
  kodeKlien: string
  total: number
}

const shellClass =
  "bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm"

export function InvoiceLicenseModule() {
  const [tabActive, setTabActive] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const { data: invoicesData, loading, error, refetch } = useInvoicesLicense()
  const { data: detailData, loading: detailLoading } = useInvoiceLicenseDetail(selectedInvoiceId)
  const { data: journalData, loading: journalLoading } = useInvoiceLicenseSummaryJournal(selectedInvoiceId)

  const invoices = useMemo<InvoiceRow[]>(() => {
    return extractRows(invoicesData).map((row) => ({
      id: Number(row.id ?? row.invoice_id ?? row.no ?? 0),
      noInvoice: getString(row, ["noInvoice", "no_invoice", "invoice_number", "no_bukti", "number"]),
      tanggal: getString(row, ["tanggal", "invoice_date", "date"], ""),
      namaKlien: getString(row, ["namaKlien", "client_name", "client"]),
      kodeKlien: getString(row, ["kodeKlien", "client_code"]),
      total: getNumber(row, ["total", "jumlah", "netto", "amount", "invoice_total"]),
    }))
  }, [invoicesData])

  const filteredInvoices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return invoices
    return invoices.filter((invoice) => {
      return (
        invoice.noInvoice.toLowerCase().includes(query) ||
        invoice.namaKlien.toLowerCase().includes(query) ||
        invoice.kodeKlien.toLowerCase().includes(query)
      )
    })
  }, [invoices, searchTerm])

  const summary = useMemo(() => {
    const totalInvoice = invoices.reduce((sum, item) => sum + item.total, 0)
    const average = invoices.length > 0 ? totalInvoice / invoices.length : 0
    return {
      totalInvoice,
      invoiceCount: invoices.length,
      average,
    }
  }, [invoices])

  const invoiceDetail = useMemo(() => extractObject(detailData), [detailData]) as Record<string, unknown>
  const journalRows = useMemo(() => extractRows(journalData), [journalData])
  const selectedHeader = (invoiceDetail.header && typeof invoiceDetail.header === "object"
    ? invoiceDetail.header
    : invoiceDetail) as Record<string, unknown>
  const selectedPajak = (invoiceDetail.pajak && typeof invoiceDetail.pajak === "object"
    ? invoiceDetail.pajak
    : {}) as Record<string, unknown>
  const detailItems = Array.isArray(invoiceDetail.detail_items)
    ? (invoiceDetail.detail_items as ReportRow[])
    : Array.isArray(invoiceDetail.items)
      ? (invoiceDetail.items as ReportRow[])
      : []
  const selectedInvoiceClient = selectedHeader.client && typeof selectedHeader.client === "object"
    ? (selectedHeader.client as Record<string, unknown>)
    : null
  const hasSelectedInvoice = selectedInvoiceId !== null

  const openDetail = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId)
    setIsDetailDialogOpen(true)
    setTabActive("detail")
  }

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false)
  }

  const clearSelectedInvoice = () => {
    setIsDetailDialogOpen(false)
    setSelectedInvoiceId(null)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
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
      <div className="p-6 max-w-7xl mx-auto">
        <Card className={shellClass}>
          <div className="text-red-600 font-semibold">Gagal memuat invoice license: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={shellClass}>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">INVOICE LICENSE</h1>
          <p className="text-sm text-muted-foreground">Data diambil dari endpoint invoice-license backend.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">Total Invoice</p>
            <div className="mt-2 text-2xl font-bold">{summary.invoiceCount}</div>
          </Card>
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">Total Nilai</p>
            <div className="mt-2 text-2xl font-bold">Rp {summary.totalInvoice.toLocaleString("id-ID")}</div>
          </Card>
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">Rata-rata</p>
            <div className="mt-2 text-2xl font-bold">Rp {summary.average.toLocaleString("id-ID")}</div>
          </Card>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-card/60 p-2">
          <Button variant={tabActive === "detail" ? "default" : "outline"} onClick={() => setTabActive("detail")}>
            Detail
          </Button>
          <Button variant={tabActive === "list" ? "default" : "outline"} onClick={() => setTabActive("list")}>
            List / Daftar
          </Button>
        </div>

        <div className="mt-6">
          {tabActive === "detail" && (
            <div className="space-y-6">
              {!hasSelectedInvoice ? (
                <Card className="border-border/70 bg-card/70 p-8 text-center">
                  <div className="mx-auto max-w-md space-y-3">
                    <div className="text-lg font-semibold text-foreground">Pilih invoice dulu</div>
                    <p className="text-sm text-muted-foreground">
                      Klik tombol detail pada salah satu baris di tab daftar untuk membuka detail invoice license dan summary journal-nya.
                    </p>
                    <Button variant="outline" onClick={() => setTabActive("list")}>
                      Kembali ke Daftar
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  <Card className="flex flex-wrap items-center justify-between gap-3 border-border/70 bg-card/70 p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Detail Aktif</h3>
                      <p className="text-sm text-muted-foreground">Detail tetap tersimpan walau dialog ditutup.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={clearSelectedInvoice}>
                        Tutup Detail
                      </Button>
                      <Button onClick={() => window.print()} className="bg-purple-600 hover:bg-purple-700">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </Card>

                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Header Invoice</h3>
                        <p className="text-sm text-muted-foreground">
                          Data lengkap dari response detail invoice license berdasarkan ID invoice.
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full border-cyan-500/20 bg-cyan-500/10 text-cyan-200">
                        {String(invoiceDetail.flow_hint ?? "license")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">No. Invoice</label>
                        <Input value={getValue(selectedHeader, ["number", "noInvoice", "no_invoice", "invoice_number"])} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Tanggal</label>
                        <Input value={getValue(selectedHeader, ["date", "invoice_date"])} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Kode Klien</label>
                        <Input value={getValue(selectedHeader, ["client_code"]) || getValue((selectedInvoiceClient ?? {}) as ReportRow, ["code"])} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Nama Klien</label>
                        <Input value={getValue(selectedHeader, ["client_name"]) || getValue((selectedInvoiceClient ?? {}) as ReportRow, ["name"])} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Jenis Invoice</label>
                        <Input value={getValue(selectedHeader, ["jenis_invoice_name", "invoice_type_name"], "-")} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Due Date</label>
                        <Input value={getValue(selectedHeader, ["due_date"], "-")} readOnly />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">Alamat</label>
                        <Input value={getValue(selectedHeader, ["address", "client_address"], "-")} readOnly />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">Keterangan</label>
                        <Input value={getValue(selectedHeader, ["description"], "-")} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Mode Invoice</label>
                        <Input value={getValue(selectedHeader, ["invoice_mode"], "-")} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Faktur Pajak</label>
                        <Input value={getValue(selectedHeader, ["jenis_faktur"], "-")} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Include PPN</label>
                        <Input value={String(Boolean(selectedHeader.include_ppn))} readOnly />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Auto Journal</label>
                        <Input value={String(Boolean(selectedHeader.auto_journal))} readOnly />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-border/70 bg-card/70 p-4">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-lg">Detail Item</CardTitle>
                      <CardDescription>Baris item invoice license dari response `detail_items`.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto rounded-lg border border-border/70">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kode Item</TableHead>
                              <TableHead>Nama Item</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead>Satuan</TableHead>
                              <TableHead className="text-right">Harga</TableHead>
                              <TableHead className="text-right">Bruto</TableHead>
                              <TableHead>Bulan</TableHead>
                              <TableHead>Keterangan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailItems.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                  Belum ada detail item pada invoice ini.
                                </TableCell>
                              </TableRow>
                            ) : (
                              detailItems.map((item, index) => (
                                <TableRow key={`${String(item.invoice_item_id ?? item.id ?? "item")}-${index}`}>
                                  <TableCell className="font-mono text-xs">{String(item.kd_item ?? item.item_code ?? "-")}</TableCell>
                                  <TableCell>{String(item.nama_item ?? item.item_name ?? "-")}</TableCell>
                                  <TableCell className="text-right">{Number(item.qty ?? 0)}</TableCell>
                                  <TableCell>{String(item.satuan ?? item.unit ?? "-")}</TableCell>
                                  <TableCell className="text-right">Rp {Number(item.harga ?? item.price ?? 0).toLocaleString("id-ID")}</TableCell>
                                  <TableCell className="text-right">Rp {Number(item.bruto ?? item.total ?? 0).toLocaleString("id-ID")}</TableCell>
                                  <TableCell>{String(item.bulan ?? item.months ?? "-")}</TableCell>
                                  <TableCell>{String(item.keterangan ?? item.description ?? "-")}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/70 bg-card/70 p-4">
                      <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg">Pajak</CardTitle>
                        <CardDescription>Data faktur pajak dari response detail invoice.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-foreground">No Faktur Pajak</label>
                            <Input value={getValue(selectedPajak, ["no_faktur_pajak"], "-")} readOnly />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-foreground">Tgl Faktur Pajak</label>
                            <Input value={getValue(selectedPajak, ["tgl_faktur_pajak"], "-")} readOnly />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-foreground">PPN</label>
                            <Input value={`Rp ${Number(selectedPajak.ppn ?? 0).toLocaleString("id-ID")}`} readOnly />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-foreground">PPN %</label>
                            <Input value={String(selectedPajak.ppn_percentage ?? selectedHeader.ppn_percentage ?? "-")} readOnly />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-card/70 p-4">
                      <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg">Summary</CardTitle>
                        <CardDescription>Ringkasan nilai dan jurnal yang dikirim backend.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-border/70 p-3">
                            <div className="text-xs text-muted-foreground">Jumlah</div>
                            <div className="mt-1 font-semibold">Rp {Number(selectedHeader.jumlah ?? 0).toLocaleString("id-ID")}</div>
                          </div>
                          <div className="rounded-lg border border-border/70 p-3">
                            <div className="text-xs text-muted-foreground">Discount</div>
                            <div className="mt-1 font-semibold">Rp {Number(selectedHeader.discount ?? 0).toLocaleString("id-ID")}</div>
                          </div>
                          <div className="rounded-lg border border-border/70 p-3">
                            <div className="text-xs text-muted-foreground">DPP</div>
                            <div className="mt-1 font-semibold">Rp {Number(selectedHeader.dpp ?? 0).toLocaleString("id-ID")}</div>
                          </div>
                          <div className="rounded-lg border border-border/70 p-3">
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="mt-1 font-semibold">Rp {Number(selectedHeader.total ?? 0).toLocaleString("id-ID")}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-border/70 p-3">
                            <div className="text-xs text-muted-foreground">Summary Debit</div>
                            <div className="mt-1 font-semibold">Rp {Number((invoiceDetail.summary_jurnal_totals as Record<string, unknown> | undefined)?.debet ?? 0).toLocaleString("id-ID")}</div>
                          </div>
                          <div className="rounded-lg border border-border/70 p-3">
                            <div className="text-xs text-muted-foreground">Summary Kredit</div>
                            <div className="mt-1 font-semibold">Rp {Number((invoiceDetail.summary_jurnal_totals as Record<string, unknown> | undefined)?.kredit ?? 0).toLocaleString("id-ID")}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-border/70 bg-card/70 p-4">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-lg">Summary Journal</CardTitle>
                      <CardDescription>Data dari endpoint summary-journal backend.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {journalLoading ? (
                        <div className="text-sm text-muted-foreground">Memuat jurnal...</div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-border/70">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Kode Akun</TableHead>
                                <TableHead>Nama Akun</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Kredit</TableHead>
                                <TableHead>Keterangan</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {journalRows.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                    Belum ada jurnal ringkasan untuk invoice terpilih.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                journalRows.map((line, index) => (
                                  <TableRow key={`${String(line.account_code ?? "line")}-${index}`}>
                                    <TableCell className="font-mono">{String(line.account_code ?? line.code ?? "-")}</TableCell>
                                    <TableCell>{String(line.account_name ?? line.name ?? "-")}</TableCell>
                                    <TableCell className="text-right">Rp {(Number(line.debit ?? line.debet ?? 0)).toLocaleString("id-ID")}</TableCell>
                                    <TableCell className="text-right">Rp {(Number(line.credit ?? line.kredit ?? 0)).toLocaleString("id-ID")}</TableCell>
                                    <TableCell>{String(line.description ?? line.notes ?? "-")}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {tabActive === "list" && (
            <div className="space-y-6">
              <Card className="border-border/70 bg-card/70 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Cari Invoice / Klien</label>
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari no invoice, kode, atau nama klien" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setTabActive("detail")}>
                      <Eye className="w-4 h-4 mr-2" />
                      Buka Detail
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="border-border/70 bg-card/70 p-4">
                <div className="border border-border/70 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/70">
                        <TableHead>No. Invoice</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama Klien</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                            Belum ada invoice license untuk filter yang dipilih.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice, idx) => (
                          <TableRow key={invoice.id} className={idx % 2 === 0 ? "bg-muted/30" : "bg-card/70"}>
                            <TableCell className="text-xs font-medium">{invoice.noInvoice}</TableCell>
                            <TableCell className="text-xs">{invoice.tanggal || "-"}</TableCell>
                            <TableCell className="text-xs">{invoice.namaKlien}</TableCell>
                            <TableCell className="text-xs text-right">Rp {invoice.total.toLocaleString("id-ID")}</TableCell>
                            <TableCell className="text-xs text-center">
                            <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1">
                              <button
                                onClick={() => openDetail(invoice.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-primary/15"
                              >
                                <Eye className="w-3 h-3 text-primary" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Detail Invoice License</DialogTitle>
            <DialogDescription>Ringkasan invoice dari backend.</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-sm text-muted-foreground">Memuat detail invoice...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 p-4">
                  <div className="text-sm text-muted-foreground">No Invoice</div>
                  <div className="mt-1 font-mono">{getValue(selectedHeader, ["number", "noInvoice", "no_invoice", "invoice_number"])}</div>
                </div>
                <div className="rounded-lg border border-border/70 p-4">
                  <div className="text-sm text-muted-foreground">Tanggal</div>
                  <div className="mt-1">{getValue(selectedHeader, ["date", "invoice_date", "tanggal"])}</div>
                </div>
                <div className="rounded-lg border border-border/70 p-4">
                  <div className="text-sm text-muted-foreground">Klien</div>
                  <div className="mt-1">{getValue(selectedHeader, ["client_name", "namaKlien"])}</div>
                </div>
                <div className="rounded-lg border border-border/70 p-4">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="mt-1 font-semibold">Rp {Number(selectedHeader.total ?? 0).toLocaleString("id-ID")}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" onClick={closeDetailDialog}>
                  Tutup
                </Button>
                <Button onClick={() => window.print()} className="bg-purple-600 hover:bg-purple-700">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
