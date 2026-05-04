"use client"

import { useMemo, useState } from "react"
import { FileText, Plus, Printer, Search, Wallet, PencilLine, Trash2 } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBanks } from "@/lib/api/hooks"
import { useClients } from "@/lib/api/hooks"
import { useInvoices } from "@/lib/api/hooks"
import {
  useCreatePostingPayment,
  useCreatePostingPaymentCost,
  useDeletePostingPaymentCost,
  usePostPostingOmzet,
  usePostingPaymentCosts,
  usePostingPaymentDetail,
  usePostingPaymentSummaryJournal,
  usePostingPayments,
  usePostingPaymentsSearch,
  useUpdatePostingPaymentCost,
} from "@/lib/api/hooks"
import { PostingPaymentCostForm } from "@/components/forms/posting-payment-cost-form"
import { PostingPaymentForm } from "@/components/forms/posting-payment-form"
import type {
  CreatePostingPaymentRequest,
  PostingPaymentCostDetail,
  PostingPaymentDetailData,
  PostingPaymentListItem,
  PostingPaymentJournalLine,
} from "@/lib/api/types/posting-payments"

type PostingOmzetResult = {
  invoice_number: string
  invoice_date: string
  total?: number | string
  journals: Array<{
    document_number: string
    date: string
    sequence: string
    acc_code: string
    description: string
    debit: number | string
    credit: number | string
  }>
}

const shellClass =
  "bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm"

function formatCurrency(value: number | string) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`
}

function getPostingBadge(posting: PostingPaymentListItem) {
  return <Badge className="bg-blue-600">Posted</Badge>
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isNaN(parsed) ? 0 : parsed
}

function extractDetail(detail?: PostingPaymentDetailData | null) {
  return detail ?? null
}

export function PaymentPostingModule() {
  const [activeTab, setActiveTab] = useState("history")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPostingId, setSelectedPostingId] = useState<number | null>(null)
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<PostingPaymentCostDetail | null>(null)
  const [costDialogTitle, setCostDialogTitle] = useState("Tambah Biaya")
  const [omzetInvoiceId, setOmzetInvoiceId] = useState("")
  const [omzetResult, setOmzetResult] = useState<PostingOmzetResult | null>(null)

  const { data: postingPaymentsData, loading, error, refetch: refetchPostingPayments } = usePostingPayments()
  const { results: searchResults, loading: searchLoading } = usePostingPaymentsSearch(searchTerm)
  const { data: detailResponse, loading: detailLoading, refetch: refetchDetail } = usePostingPaymentDetail(selectedPostingId)
  const { data: summaryJournalResponse, loading: journalLoading, refetch: refetchJournal } =
    usePostingPaymentSummaryJournal(selectedPostingId)
  const { data: costsResponse, loading: costsLoading, refetch: refetchCosts } = usePostingPaymentCosts(selectedPostingId)
  const { data: banksData } = useBanks()
  const { data: clientsData } = useClients()
  const { data: invoicesData } = useInvoices()

  const { mutate: createPostingPayment, loading: createLoading, error: createError } = useCreatePostingPayment()
  const { mutate: createPostingPaymentCost, loading: createCostLoading, error: createCostError } = useCreatePostingPaymentCost()
  const { mutate: updatePostingPaymentCost, loading: updateCostLoading, error: updateCostError } = useUpdatePostingPaymentCost()
  const { mutate: deletePostingPaymentCost, loading: deleteCostLoading } = useDeletePostingPaymentCost()
  const { mutate: postPostingOmzet, loading: omzetLoading } = usePostPostingOmzet()

  const postingPayments = postingPaymentsData?.data ?? []
  const banks = banksData ?? []
  const clients = clientsData ?? []
  const invoices = invoicesData ?? []

  const displayedPayments = useMemo(() => {
    if (searchTerm.trim().length >= 2) return searchResults ?? []
    return postingPayments
  }, [postingPayments, searchResults, searchTerm])

  const summary = useMemo(() => {
    return postingPayments.reduce(
      (acc, payment) => {
        acc.total += 1
        acc.totalInvoice += toNumber(payment.total_invoice)
        acc.totalBayar += toNumber(payment.total_bayar)
        acc.totalDebet += toNumber(payment.debet)
        acc.totalKredit += toNumber(payment.kredit)
        return acc
      },
      {
        total: 0,
        totalInvoice: 0,
        totalBayar: 0,
        totalDebet: 0,
        totalKredit: 0,
      }
    )
  }, [postingPayments])

  const selectedPostingDetail = extractDetail(detailResponse?.data)
  const detailHeader = selectedPostingDetail?.header
  const detailInvoices = selectedPostingDetail?.detail_invoice ?? []
  const detailCosts = selectedPostingDetail?.detail_biaya ?? []
  const detailJournals = selectedPostingDetail?.jurnal ?? []
  const summaryJournalLines = summaryJournalResponse?.data ?? detailJournals
  const costLines = costsResponse?.data ?? detailCosts

  const postingOmzetJournals = omzetResult?.journals ?? []

  const handleCreatePostingPayment = async (formData: CreatePostingPaymentRequest) => {
    try {
      const result = await createPostingPayment(formData)
      const postingId = (result.data?.header?.id ?? null) as number | null
      if (postingId) {
        setSelectedPostingId(postingId)
        setActiveTab("history")
        await Promise.all([refetchPostingPayments(), refetchDetail(), refetchJournal(), refetchCosts()])
      } else {
        await refetchPostingPayments()
      }
    } catch (error) {
      console.error("Create posting payment failed:", error)
    }
  }

  const handleOpenCostCreate = () => {
    setEditingCost(null)
    setCostDialogTitle("Tambah Biaya")
    setIsCostDialogOpen(true)
  }

  const handleOpenCostEdit = (cost: PostingPaymentCostDetail) => {
    setEditingCost(cost)
    setCostDialogTitle("Edit Biaya")
    setIsCostDialogOpen(true)
  }

  const handleSubmitCost = async (data: { description: string; amount: number }) => {
    if (!selectedPostingId) return

    if (editingCost?.id) {
      await updatePostingPaymentCost({
        postingPaymentId: selectedPostingId,
        costId: editingCost.id,
        data,
      })
    } else {
      await createPostingPaymentCost({
        postingPaymentId: selectedPostingId,
        data,
      })
    }

    setIsCostDialogOpen(false)
    setEditingCost(null)
    await Promise.all([refetchDetail(), refetchJournal(), refetchCosts(), refetchPostingPayments()])
  }

  const handleDeleteCost = async (costId: number) => {
    if (!selectedPostingId) return
    await deletePostingPaymentCost({ postingPaymentId: selectedPostingId, costId })
    await Promise.all([refetchDetail(), refetchJournal(), refetchCosts(), refetchPostingPayments()])
  }

  const handlePostOmzet = async () => {
    if (!omzetInvoiceId) return
    const result = await postPostingOmzet({ invoice_id: Number(omzetInvoiceId) })
    setOmzetResult({
      invoice_number: String(result.invoice?.number ?? result.invoice?.invoice_number ?? `INV #${result.invoice?.id ?? ""}`),
      invoice_date: String(result.invoice?.date ?? result.invoice?.invoice_date ?? ""),
      total: toNumber((result.invoice as { total?: number | string }).total ?? (result.invoice as { total_amount?: number | string }).total_amount),
      journals: result.journals.map((journal) => ({
        document_number: journal.document_number,
        date: journal.date,
        sequence: journal.sequence,
        acc_code: journal.acc_code,
        description: journal.description,
        debit: journal.debit,
        credit: journal.credit,
      })),
    })
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
        <Alert variant="destructive">
          <div>Gagal memuat posting pembayaran: {error.message}</div>
          <Button onClick={refetchPostingPayments} className="mt-2">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Posting Pembayaran Invoice</h1>
        <p className="text-muted-foreground">Riwayat posting pembayaran, create batch posting, biaya, dan posting omzet.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(summary.totalBayar)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalInvoice)}</div>
            <p className="text-xs text-muted-foreground mt-1">Akumulasi invoice</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Biaya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(summary.totalKredit)}</div>
            <p className="text-xs text-muted-foreground mt-1">Akumulasi biaya posting</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total ? summary.totalBayar / summary.total : 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per posting</p>
          </CardContent>
        </Card>
      </div>

      <div className={shellClass}>
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-cyan-500/15 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Posting Pembayaran Invoice</h3>
            <p className="text-sm text-muted-foreground">Kelola riwayat posting, buat batch posting baru, dan posting omzet.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setActiveTab("create")} className="border-border/70">
              <Plus className="mr-2 h-4 w-4" />
              Posting Baru
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("omzet")} className="border-border/70">
              <Wallet className="mr-2 h-4 w-4" />
              Posting Omzet
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Riwayat Posting</TabsTrigger>
            <TabsTrigger value="create">Buat Posting</TabsTrigger>
            <TabsTrigger value="omzet">Posting Omzet</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Daftar Posting Pembayaran</CardTitle>
                    <CardDescription>Data dari endpoint backend posting/payments.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Cari no posting atau klien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm.trim().length >= 2 && searchLoading && (
                  <div className="text-sm text-muted-foreground">Mencari posting pembayaran...</div>
                )}

                <div className="overflow-x-auto rounded-lg border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Posting</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Klien</TableHead>
                        <TableHead className="text-right">Total Invoice</TableHead>
                        <TableHead className="text-right">Total Bayar</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            Tidak ada posting pembayaran ditemukan.
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedPayments.map((payment, idx) => (
                          <TableRow key={payment.posting_id} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                            <TableCell className="font-mono text-sm">{payment.number}</TableCell>
                            <TableCell>{new Date(payment.posting_date).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell>{payment.client_name ?? "-"}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(payment.total_invoice)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(payment.total_bayar)}</TableCell>
                            <TableCell>{getPostingBadge(payment)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPostingId(payment.posting_id)
                                    setActiveTab("history")
                                  }}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">Detail Posting</CardTitle>
                <CardDescription>Ringkasan jurnal dan item biaya untuk posting pembayaran terpilih.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {!selectedPostingId ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Pilih salah satu posting pembayaran dari tab riwayat untuk melihat detail.
                  </div>
                ) : (
                  <>
                    {detailLoading && <div className="text-sm text-muted-foreground">Memuat detail posting...</div>}
                    {detailHeader && (
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-border/70 p-4">
                          <div className="text-sm text-muted-foreground">No Posting</div>
                          <div className="mt-1 font-mono font-medium">{detailHeader.number}</div>
                        </div>
                        <div className="rounded-lg border border-border/70 p-4">
                          <div className="text-sm text-muted-foreground">Tanggal</div>
                          <div className="mt-1 font-medium">{new Date(detailHeader.date).toLocaleDateString("id-ID")}</div>
                        </div>
                        <div className="rounded-lg border border-border/70 p-4">
                          <div className="text-sm text-muted-foreground">Bank</div>
                          <div className="mt-1 font-medium">{detailHeader.bank_code} - {detailHeader.bank_name}</div>
                        </div>
                        <div className="rounded-lg border border-border/70 p-4">
                          <div className="text-sm text-muted-foreground">Total Bayar</div>
                          <div className="mt-1 font-medium">{formatCurrency(detailHeader.total_bayar)}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Detail Invoice</h3>
                        <p className="text-sm text-muted-foreground">Data invoice yang ikut dalam posting.</p>
                      </div>
                      <Button variant="outline" onClick={() => setActiveTab("create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Posting Baru
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border/70">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No Invoice</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Klien</TableHead>
                            <TableHead className="text-right">Nilai</TableHead>
                            <TableHead className="text-right">PPN</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailInvoices.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                Tidak ada detail invoice.
                              </TableCell>
                            </TableRow>
                          ) : (
                            detailInvoices.map((item, index) => (
                              <TableRow key={`${item.no_invoice}-${index}`}>
                                <TableCell className="font-mono text-sm">{item.no_invoice}</TableCell>
                                <TableCell>{item.tgl_invoice}</TableCell>
                                <TableCell>{item.klien}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.nilai)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.ppn)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Detail Biaya</h3>
                        <p className="text-sm text-muted-foreground">Biaya posting yang bisa diubah dari sini.</p>
                      </div>
                      <Button onClick={handleOpenCostCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Biaya
                      </Button>
                    </div>
                    {costsLoading ? (
                      <div className="text-sm text-muted-foreground">Memuat detail biaya...</div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-border/70">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Deskripsi</TableHead>
                              <TableHead className="text-right">Jumlah</TableHead>
                              <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {costLines.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                  Belum ada biaya posting.
                                </TableCell>
                              </TableRow>
                            ) : (
                              costLines.map((item, index) => (
                                <TableRow key={`${item.id ?? "cost"}-${index}`}>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button size="sm" variant="outline" onClick={() => handleOpenCostEdit(item)}>
                                        <PencilLine className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => item.id && handleDeleteCost(item.id)}
                                        disabled={!item.id || deleteCostLoading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Jurnal</h3>
                        <p className="text-sm text-muted-foreground">Ringkasan jurnal dari backend.</p>
                      </div>
                      {journalLoading && <span className="text-sm text-muted-foreground">Memuat jurnal...</span>}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border/70">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No Bukti</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Acc</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Kredit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summaryJournalLines.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                Belum ada jurnal ringkasan untuk posting terpilih.
                              </TableCell>
                            </TableRow>
                          ) : (
                            summaryJournalLines.map((line: PostingPaymentJournalLine, index: number) => (
                              <TableRow key={`${line.no_bukti}-${index}`}>
                                <TableCell className="font-mono text-sm">{line.no_bukti}</TableCell>
                                <TableCell>{line.tanggal}</TableCell>
                                <TableCell className="font-mono">{line.acc}</TableCell>
                                <TableCell>{line.keterangan}</TableCell>
                                <TableCell className="text-right">{formatCurrency(line.debet)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(line.kredit)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">Buat Batch Posting Baru</CardTitle>
                <CardDescription>Form ini mengikuti body create dari endpoint /api/posting/payments.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <PostingPaymentForm
                  banks={banks}
                  clients={clients}
                  invoices={invoices}
                  loading={createLoading}
                  error={createError}
                  onCancel={() => setActiveTab("history")}
                  onSubmit={handleCreatePostingPayment}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="omzet" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">Posting Omzet</CardTitle>
                <CardDescription>Endpoint ini hanya membutuhkan `invoice_id`.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label>Pilih Invoice</Label>
                    <Select value={omzetInvoiceId} onValueChange={setOmzetInvoiceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={String(invoice.id)}>
                            {invoice.number ?? invoice.invoice_number ?? `INV #${invoice.id}`} - {invoice.client_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handlePostOmzet} disabled={!omzetInvoiceId || omzetLoading} className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="mr-2 h-4 w-4" />
                      {omzetLoading ? "Memposting..." : "Posting Omzet"}
                    </Button>
                  </div>
                </div>

                {omzetResult && (
                  <div className="space-y-4 rounded-2xl border border-border/70 bg-background/40 p-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-border/70 p-4">
                        <div className="text-sm text-muted-foreground">Invoice</div>
                        <div className="mt-1 font-semibold">{omzetResult.invoice_number}</div>
                      </div>
                      <div className="rounded-lg border border-border/70 p-4">
                        <div className="text-sm text-muted-foreground">Tanggal</div>
                        <div className="mt-1 font-semibold">{omzetResult.invoice_date}</div>
                      </div>
                      <div className="rounded-lg border border-border/70 p-4">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="mt-1 font-semibold">{formatCurrency(omzetResult.total ?? 0)}</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-border/70">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No Bukti</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Acc</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Kredit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {postingOmzetJournals.map((line, index) => (
                            <TableRow key={`${line.document_number}-${index}`}>
                              <TableCell className="font-mono text-sm">{line.document_number}</TableCell>
                              <TableCell>{line.date}</TableCell>
                              <TableCell className="font-mono">{line.acc_code}</TableCell>
                              <TableCell>{line.description}</TableCell>
                              <TableCell className="text-right">{formatCurrency(line.debit)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(line.credit)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
        <DialogContent className="max-w-xl bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>{costDialogTitle}</DialogTitle>
            <DialogDescription>Kelola biaya pada posting pembayaran terpilih.</DialogDescription>
          </DialogHeader>
          <PostingPaymentCostForm
            cost={editingCost ?? undefined}
            loading={createCostLoading || updateCostLoading}
            error={editingCost ? updateCostError : createCostError}
            onCancel={() => setIsCostDialogOpen(false)}
            onSubmit={handleSubmitCost}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
