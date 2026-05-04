'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Filter } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useReceivables, useReceivableDetail, useReceivablesSummary, useReceivableDataReport, useReceivableProcessDetailReport } from '@/lib/api/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle as CardTitleUI } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ReportRecord = Record<string, unknown>

type ReceivableDataTotals = {
  beginning_balance: number
  netto: number
  ppn: number
  biaya: number
  nota_debet: number
  payment: number
  ending_balance: number
}

function isRecord(value: unknown): value is ReportRecord {
  return typeof value === 'object' && value !== null
}

function getNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function formatCurrency(value: unknown, fallback = 0) {
  return getNumber(value, fallback).toLocaleString('id-ID')
}

function formatDate(value: unknown, fallback = '-') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleDateString('id-ID')
}

function getString(value: unknown, fallback = '-') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function getRecordArray(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function pickNumber(row: ReportRecord, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && value !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

function pickString(row: ReportRecord, keys: string[], fallback = '-') {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return fallback
}

function normalizeInvoice(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeStatus(status: string) {
  return String(status ?? '').trim().toLowerCase()
}

function normalizeReceivableStatus(status: unknown) {
  const value = String(status ?? '').trim().toLowerCase()
  if (!value) return 'outstanding'
  if (['lunas', 'paid', 'settled', 'done'].includes(value)) return 'paid'
  if (['sebagian', 'partial', 'partially'].includes(value)) return 'partial'
  if (['belum bayar', 'outstanding', 'unpaid'].includes(value)) return 'outstanding'
  return value
}

function firstMeaningfulNumber(...values: Array<unknown>) {
  for (const value of values) {
    const numeric = getNumber(value, NaN)
    if (Number.isFinite(numeric) && numeric !== 0) return numeric
  }
  return 0
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function getCurrentPeriod() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date())
}

export function ReceivablesModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReceivableId, setSelectedReceivableId] = useState<number | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [reportPeriod, setReportPeriod] = useState(getCurrentPeriod())

  // Fetch data
  const filters = statusFilter === 'all' ? {} : { status: statusFilter }
  const { data: receivables, loading, error, refetch } = useReceivables(filters)
  const { data: summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useReceivablesSummary(reportPeriod)
  const { data: detailData, loading: detailLoading } = useReceivableDetail(selectedReceivableId || undefined)
  const { data: receivableDataReport, loading: receivableDataLoading, error: receivableDataError, refetch: refetchReceivableData } = useReceivableDataReport({ period: reportPeriod })
  const { data: receivableProcessReport, loading: receivableProcessLoading, error: receivableProcessError, refetch: refetchReceivableProcess } = useReceivableProcessDetailReport({ period: reportPeriod })
  const receivableDataSummary = isRecord(receivableDataReport) && isRecord(receivableDataReport.summary) ? receivableDataReport.summary : null
  const receivableDataRows = isRecord(receivableDataReport) ? getRecordArray(receivableDataReport.data) : []
  const receivableProcessSummary = isRecord(receivableProcessReport) && isRecord(receivableProcessReport.summary) ? receivableProcessReport.summary : null
  const receivableProcessRule = isRecord(receivableProcessReport) ? receivableProcessReport.rule : null

  const receivableDataTotals = receivableDataRows.reduce<ReceivableDataTotals>(
    (acc, row) => ({
      beginning_balance: acc.beginning_balance + pickNumber(row, ['beginning_balance', 'saldo_awal', 'opening_balance']),
      netto: acc.netto + pickNumber(row, ['netto', 'total_netto']),
      ppn: acc.ppn + pickNumber(row, ['ppn', 'tax', 'vat']),
      biaya: acc.biaya + pickNumber(row, ['biaya', 'cost', 'fee']),
      nota_debet: acc.nota_debet + pickNumber(row, ['nota_debet', 'debit_note', 'debit_notes']),
      payment: acc.payment + pickNumber(row, ['payment', 'pembayaran', 'paid_amount']),
      ending_balance: acc.ending_balance + pickNumber(row, ['ending_balance', 'saldo_akhir', 'closing_balance']),
    }),
    {
      beginning_balance: 0,
      netto: 0,
      ppn: 0,
      biaya: 0,
      nota_debet: 0,
      payment: 0,
      ending_balance: 0,
    }
  )

  const displayedReceivables = useMemo(() => {
    const listByInvoice = new Map(
      receivables.map((item) => [normalizeInvoice(item.invoice_number), item] as const)
    )

    const sourceRows = receivableDataRows.length > 0
      ? receivableDataRows.map((row, index) => {
          const invoiceNumber = pickString(row, ['invoice_number', 'no_invoice', 'noInvoice'], `row-${index}`)
          const listItem = listByInvoice.get(normalizeInvoice(invoiceNumber))
          const amount =
            pickNumber(row, ['beginning_balance', 'saldo_awal', 'opening_balance']) +
            pickNumber(row, ['netto', 'total_netto']) +
            pickNumber(row, ['ppn', 'tax', 'vat']) +
            pickNumber(row, ['biaya', 'cost', 'fee']) +
            pickNumber(row, ['nota_debet', 'debit_note', 'debit_notes'])

          return {
            id: listItem?.id ?? index + 1,
            invoice_number: invoiceNumber,
            client_name: pickString(row, ['nama_klien', 'client_name', 'client'], listItem?.client_name ?? '-'),
            amount,
            paid_amount: pickNumber(row, ['pembayaran', 'payment', 'paid_amount']),
            outstanding_amount: pickNumber(row, ['saldo_akhir', 'ending_balance', 'closing_balance']),
            due_date: listItem?.due_date ?? pickString(row, ['due_date'], '-'),
            status: normalizeReceivableStatus(pickString(row, ['status'], listItem?.status ?? 'outstanding')),
          }
        })
      : receivables.map((item) => ({
          id: item.id,
          invoice_number: item.invoice_number,
          client_name: item.client_name,
          amount: getNumber(item.amount),
          paid_amount: getNumber(item.paid_amount),
          outstanding_amount: getNumber(item.outstanding_amount),
          due_date: item.due_date,
          status: normalizeReceivableStatus(item.status),
        }))

    return sourceRows.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        String(item.invoice_number).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.client_name).toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || normalizeStatus(String(item.status)) === normalizeStatus(statusFilter)
      return matchesSearch && matchesStatus
    })
  }, [receivables, receivableDataRows, searchTerm, statusFilter])

  const ageBucketCounts = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const buckets = {
      days_30: 0,
      days_60: 0,
      days_90: 0,
      days_over_90: 0,
    }

    for (const item of receivables) {
      const dueDate = item.due_date ? new Date(item.due_date) : null
      if (!dueDate || Number.isNaN(dueDate.getTime())) continue

      dueDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / 86400000)
      if (diffDays <= 30) buckets.days_30 += 1
      else if (diffDays <= 60) buckets.days_60 += 1
      else if (diffDays <= 90) buckets.days_90 += 1
      else buckets.days_over_90 += 1
    }

    return buckets
  }, [receivables])

  const effectiveSummary = {
    total_amount: firstMeaningfulNumber(
      (summary as { total_amount?: unknown } | null)?.total_amount,
      (receivableDataSummary as { total_amount?: unknown } | null)?.total_amount,
      displayedReceivables.reduce((sum, item) => sum + getNumber(item.amount), 0),
      receivableProcessSummary?.new_invoices,
      receivableDataTotals.netto + receivableDataTotals.ppn + receivableDataTotals.biaya + receivableDataTotals.nota_debet
    ),
    total_paid: firstMeaningfulNumber(
      (summary as { total_paid?: unknown } | null)?.total_paid,
      (receivableDataSummary as { pembayaran?: unknown } | null)?.pembayaran,
      displayedReceivables.reduce((sum, item) => sum + getNumber(item.paid_amount), 0),
      receivableDataTotals.payment,
      receivableProcessSummary?.payments
    ),
    total_outstanding: firstMeaningfulNumber(
      (summary as { total_outstanding?: unknown } | null)?.total_outstanding,
      (receivableDataSummary as { saldo_akhir?: unknown } | null)?.saldo_akhir,
      displayedReceivables.reduce((sum, item) => sum + getNumber(item.outstanding_amount), 0),
      receivableDataTotals.ending_balance,
      receivableProcessSummary?.closing_balance
    ),
    count_outstanding: firstMeaningfulNumber(
      (summary as { count_outstanding?: unknown } | null)?.count_outstanding,
      displayedReceivables.filter((item) => normalizeReceivableStatus(item.status) !== 'paid').length
    ),
    count_partial: firstMeaningfulNumber((summary as { count_partial?: unknown } | null)?.count_partial),
    count_paid: firstMeaningfulNumber(
      (summary as { count_paid?: unknown } | null)?.count_paid,
      displayedReceivables.filter((item) => normalizeReceivableStatus(item.status) === 'paid').length
    ),
    days_30: firstMeaningfulNumber((summary as { days_30?: unknown } | null)?.days_30, ageBucketCounts.days_30),
    days_60: firstMeaningfulNumber((summary as { days_60?: unknown } | null)?.days_60, ageBucketCounts.days_60),
    days_90: firstMeaningfulNumber((summary as { days_90?: unknown } | null)?.days_90, ageBucketCounts.days_90),
    days_over_90: firstMeaningfulNumber((summary as { days_over_90?: unknown } | null)?.days_over_90, ageBucketCounts.days_over_90),
  }

  // Calculate totals
  const totals = {
    total_amount: displayedReceivables.reduce((sum, r) => sum + getNumber(r.amount), 0),
    total_paid: displayedReceivables.reduce((sum, r) => sum + getNumber(r.paid_amount), 0),
    total_outstanding: displayedReceivables.reduce((sum, r) => sum + getNumber(r.outstanding_amount), 0),
  }

  const getStatusBadge = (status: string) => {
    switch (normalizeReceivableStatus(status)) {
      case 'paid':
        return <Badge className="bg-green-600">Lunas</Badge>
      case 'partial':
        return <Badge className="bg-yellow-600">Sebagian</Badge>
      case 'outstanding':
        return <Badge className="bg-red-600">Belum Bayar</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Loading state
  if (loading || receivableDataLoading || receivableProcessLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
          <Button className="ml-2" onClick={refetch} size="sm">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Summary Cards */}
      {!summaryLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitleUI className="text-sm font-medium text-foreground/75">Total Piutang</CardTitleUI>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {formatCurrency(effectiveSummary.total_amount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{effectiveSummary.count_outstanding + effectiveSummary.count_partial} item</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitleUI className="text-sm font-medium text-foreground/75">Sudah Dibayar</CardTitleUI>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {formatCurrency(effectiveSummary.total_paid)}
              </div>
              <Badge className="mt-2 bg-green-600">{effectiveSummary.count_paid} Lunas</Badge>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitleUI className="text-sm font-medium text-foreground/75">Belum Dibayar</CardTitleUI>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {formatCurrency(effectiveSummary.total_outstanding)}
              </div>
              <Badge className="mt-2 bg-red-600">{effectiveSummary.count_outstanding} Jatuh Tempo</Badge>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitleUI className="text-sm font-medium text-foreground/75">Overdue (90+)</CardTitleUI>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{effectiveSummary.days_over_90}</div>
              <p className="text-xs text-muted-foreground mt-1">Hari tertunggak</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className={shellClass}>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="list">Daftar Piutang</TabsTrigger>
            <TabsTrigger value="aging">Aging / Ringkasan</TabsTrigger>
            <TabsTrigger value="data">Data Piutang</TabsTrigger>
            <TabsTrigger value="process">Proses Piutang</TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4 mt-4">
            {/* Search & Filter */}
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Cari klien atau invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="outstanding">Belum Bayar</SelectItem>
                  <SelectItem value="partial">Sebagian Bayar</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border/70 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/70 border-b">
                    <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold">Klien</th>
                    <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                    <th className="px-4 py-3 text-right font-semibold">Dibayar</th>
                    <th className="px-4 py-3 text-right font-semibold">Belum Bayar</th>
                    <th className="px-4 py-3 text-left font-semibold">Tanggal Jatuh Tempo</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReceivables.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="px-4 py-3 font-semibold">{item.invoice_number}</td>
                      <td className="px-4 py-3">{item.client_name}</td>
                      <td className="px-4 py-3 text-right">
                        Rp {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        Rp {formatCurrency(item.paid_amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 font-semibold">
                        Rp {formatCurrency(item.outstanding_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(item.due_date)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (item.id) {
                              setSelectedReceivableId(item.id)
                              setIsDetailDialogOpen(true)
                            }
                          }}
                          disabled={!item.id}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayedReceivables.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Tidak ada data piutang</div>
            )}

            {/* Summary Row */}
            <div className="border-t pt-4 flex justify-end gap-6 text-sm font-semibold">
              <div>
                Total: <span className="text-base">Rp {formatCurrency(totals.total_amount)}</span>
              </div>
              <div>
                Dibayar: <span className="text-base text-green-600">Rp {formatCurrency(totals.total_paid)}</span>
              </div>
              <div>
                Belum Bayar: <span className="text-base text-red-600">Rp {formatCurrency(totals.total_outstanding)}</span>
              </div>
            </div>
          </TabsContent>

          {/* Aging Report Tab */}
          <TabsContent value="aging" className="space-y-4 mt-4">
            {summaryError && (
              <Card className="border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-rose-300">Gagal memuat aging summary</p>
                    <p className="text-sm text-rose-200/80">{summaryError.message}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => void refetchSummary()}>
                    Coba Lagi
                  </Button>
                </div>
              </Card>
            )}

            {(summary || receivableDataRows.length > 0 || summaryError) && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Aging / Ringkasan Piutang</p>
                      <p className="text-xs text-muted-foreground">
                        Sumber data dari report summary receivable backend.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-border/70">
                      /reports/receivable/summary
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">Total Piutang</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">Rp {formatCurrency(effectiveSummary.total_amount)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">Sudah Dibayar</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-emerald-600">Rp {formatCurrency(effectiveSummary.total_paid)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">Sisa Piutang</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-red-600">Rp {formatCurrency(effectiveSummary.total_outstanding)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">Overdue (90+)</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-red-600">{effectiveSummary.days_over_90}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">0-30 Hari</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{effectiveSummary.days_30}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">31-60 Hari</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{effectiveSummary.days_60}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">61-90 Hari</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{effectiveSummary.days_90}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitleUI className="text-xs font-medium">90+ Hari</CardTitleUI>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-red-600">{effectiveSummary.days_over_90}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Catatan Aging</p>
                      <p className="text-xs text-muted-foreground">
                        Jika bucket umur belum dihitung backend, angka di atas tetap diisi dari report summary dan data piutang.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-border/70">
                      {reportPeriod}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Periode Laporan</label>
                <Input value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} placeholder={getCurrentPeriod()} />
              </div>
            </div>

            {receivableDataError && (
              <Card className="border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-rose-300">Gagal memuat data piutang</p>
                    <p className="text-sm text-rose-200/80">{receivableDataError.message}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => void refetchReceivableData()}>
                    Coba Lagi
                  </Button>
                </div>
              </Card>
            )}

            {receivableDataLoading ? (
              <div className="py-8 text-center text-muted-foreground">Memuat data piutang...</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-sm font-semibold">Data Piutang</p>
                  <p className="text-xs text-muted-foreground">
                    Sumber data dari report data receivable backend.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Saldo Awal</p>
                      <p className="text-2xl font-bold">
                        Rp {getNumber(receivableDataSummary?.saldo_awal ?? receivableDataTotals.beginning_balance).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Netto</p>
                      <p className="text-2xl font-bold">
                        Rp {getNumber(receivableDataSummary?.netto ?? receivableDataTotals.netto).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Pembayaran</p>
                      <p className="text-2xl font-bold">
                        Rp {getNumber(receivableDataSummary?.pembayaran ?? receivableDataTotals.payment).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto border border-border/70 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-background">
                        <th className="p-2 text-left">Invoice</th>
                        <th className="p-2 text-left">Client</th>
                        <th className="p-2 text-right">Saldo Awal</th>
                        <th className="p-2 text-right">Netto</th>
                        <th className="p-2 text-right">PPN</th>
                        <th className="p-2 text-right">Biaya</th>
                        <th className="p-2 text-right">Nota Debet</th>
                        <th className="p-2 text-right">Pembayaran</th>
                        <th className="p-2 text-right">Saldo Akhir</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivableDataRows.length > 0 ? (
                        receivableDataRows.map((row, index) => (
                          <tr key={`${getString(row.no_invoice, `row-${index}`)}`} className="border-b">
                            <td className="p-2">{pickString(row, ['invoice_number', 'no_invoice', 'noInvoice'])}</td>
                            <td className="p-2">{pickString(row, ['client_name', 'nama_klien', 'client'])}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['beginning_balance', 'saldo_awal', 'opening_balance']).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['netto', 'total_netto']).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['ppn', 'tax', 'vat']).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['biaya', 'cost', 'fee']).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['nota_debet', 'debit_note', 'debit_notes']).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['payment', 'pembayaran', 'paid_amount']).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">{pickNumber(row, ['ending_balance', 'saldo_akhir', 'closing_balance']).toLocaleString('id-ID')}</td>
                            <td className="p-2">{pickString(row, ['status'])}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-muted-foreground">
                            Tidak ada data piutang pada periode ini.
                          </td>
                        </tr>
                      )}
                      {receivableDataRows.length > 0 && (
                        <tr className="bg-muted font-semibold">
                          <td colSpan={2}>TOTAL</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.saldo_awal ?? receivableDataTotals.beginning_balance).toLocaleString('id-ID')}</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.netto ?? receivableDataTotals.netto).toLocaleString('id-ID')}</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.ppn ?? receivableDataTotals.ppn).toLocaleString('id-ID')}</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.biaya ?? receivableDataTotals.biaya).toLocaleString('id-ID')}</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.nota_debet ?? receivableDataTotals.nota_debet).toLocaleString('id-ID')}</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.pembayaran ?? receivableDataTotals.payment).toLocaleString('id-ID')}</td>
                          <td className="text-right">{getNumber(receivableDataSummary?.saldo_akhir ?? receivableDataTotals.ending_balance).toLocaleString('id-ID')}</td>
                          <td />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="process" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Periode Laporan</label>
                <Input value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} placeholder={getCurrentPeriod()} />
              </div>
            </div>

            {receivableProcessError && (
              <Card className="border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-rose-300">Gagal memuat proses piutang</p>
                    <p className="text-sm text-rose-200/80">{receivableProcessError.message}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => void refetchReceivableProcess()}>
                    Coba Lagi
                  </Button>
                </div>
              </Card>
            )}

            {receivableProcessLoading ? (
              <div className="py-8 text-center text-muted-foreground">Memuat proses piutang...</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-sm font-semibold">Proses Piutang</p>
                  <p className="text-xs text-muted-foreground">
                    Sumber data dari report process-detail receivable backend.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Opening Balance</p>
                      <p className="text-2xl font-bold">
                        Rp {getNumber(receivableProcessSummary?.opening_balance).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">New Invoices</p>
                      <p className="text-2xl font-bold">
                        Rp {getNumber(receivableProcessSummary?.new_invoices).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Nota Debet</p>
                      <p className="text-2xl font-bold">
                        Rp {getNumber(receivableProcessSummary?.nota_debet).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Payments</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        Rp {getNumber(receivableProcessSummary?.payments).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-card/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Closing Balance</p>
                      <p className="text-2xl font-bold text-red-600">
                        Rp {getNumber(receivableProcessSummary?.closing_balance).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">Rule Proses</p>
                  <p className="mt-1 text-sm font-medium">
                    {getString(receivableProcessRule)}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Detail Piutang</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Ringkasan piutang invoice yang dipilih.
            </p>
          </DialogHeader>
          
          {detailLoading && <div className="text-center py-4">Memuat...</div>}
          
          {detailData && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nomor Invoice</p>
                  <p className="text-lg font-bold tracking-wide">{detailData.invoice_number || '-'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailData.client_name || '-'} {detailData.client_code ? `• ${detailData.client_code}` : ''}
                  </p>
                </div>
                <div className="shrink-0">{getStatusBadge(detailData.status)}</div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">Jumlah Invoice</p>
                  <p className="mt-1 text-xl font-bold">Rp {formatCurrency(detailData.amount)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/80 p-4">
                  <p className="text-xs text-emerald-700">Sudah Dibayar</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">Rp {formatCurrency(detailData.paid_amount)}</p>
                </div>
                <div className="rounded-2xl border border-rose-200/50 bg-rose-50/80 p-4">
                  <p className="text-xs text-rose-700">Sisa Piutang</p>
                  <p className="mt-1 text-xl font-bold text-rose-700">Rp {formatCurrency(detailData.outstanding_amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">Tanggal Invoice</p>
                  <p className="mt-1 font-medium">{formatDate(detailData.invoice_date)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">Tanggal Jatuh Tempo</p>
                  <p className="mt-1 font-medium">
                    {formatDate(detailData.due_date)}
                    {detailData.days_overdue > 0 && (
                      <span className="ml-2 text-sm font-semibold text-rose-600">
                        ({detailData.days_overdue} hari)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {detailData.notes && (
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="mt-1 text-sm leading-relaxed">{detailData.notes}</p>
                </div>
              )}

              {detailData.payment_history && detailData.payment_history.length > 0 && (
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-sm font-semibold">Riwayat Pembayaran</p>
                  <div className="mt-3 space-y-2">
                    {detailData.payment_history.map((payment) => (
                      <div
                        key={payment.id}
                        className="grid grid-cols-[120px_1fr_auto] gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                      >
                        <span className="text-muted-foreground">{formatDate(payment.payment_date)}</span>
                        <span className="truncate">{payment.reference || '-'}</span>
                        <span className="font-semibold">Rp {formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


