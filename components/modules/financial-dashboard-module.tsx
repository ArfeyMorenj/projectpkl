"use client"

import { useMemo, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { useBanks, useCashReport, useInvoiceRegisterReport } from "@/lib/api/hooks"

const shellClass =
  "bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm"

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

function monthKey(date: string): string {
  return String(date || "").slice(0, 7)
}

function monthLabel(value: string): string {
  const [yyyy, mm] = value.split("-")
  if (!yyyy || !mm) return value || "-"
  return new Date(Number(yyyy), Number(mm) - 1, 1).toLocaleDateString("id-ID", { month: "short" })
}

function parseDate(value: unknown) {
  const raw = String(value ?? "")
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
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

type DashboardInvoiceRow = {
  noInvoice: string
  tanggal: string
  total: number
  sourceCode: string
  kodeKlien: string
  namaKlien: string
  jatuhTempo: string
  paidAmount: number
  outstandingAmount: number
}

type DashboardPaymentRow = {
  tanggal: string
  totalBayar: number
  noPosting: string
  kodeKlien: string
  namaKlien: string
  invoices: string[]
}

export function FinancialDashboardModule() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateFrom, setDateFrom] = useState("2025-01-01")
  const [dateTo, setDateTo] = useState("2025-10-31")
  const [selectedBankId, setSelectedBankId] = useState("1")

  const { data: banks } = useBanks()

  const invoiceQuery = {
    period_from: dateFrom.slice(0, 7),
    period_to: dateTo.slice(0, 7),
    detailed: '',
  }

  const cashQuery = {
    date_from: dateFrom,
    date_to: dateTo,
    bank_id: selectedBankId || undefined,
  }

  const { data: invoiceReport, loading: invoiceLoading, error: invoiceError, refetch: refetchInvoice } = useInvoiceRegisterReport(
    invoiceQuery
  )
  const { data: cashReport, loading: cashLoading, error: cashError, refetch: refetchCash } = useCashReport(cashQuery)

  const invoices = useMemo<DashboardInvoiceRow[]>(() => {
    return extractRows(invoiceReport).map((row) => ({
      noInvoice: getString(row, ["noInvoice", "no_invoice", "invoice_number", "number", "no_bukti"]),
      tanggal: getString(row, ["tanggal", "invoice_date", "date"], ""),
      total: getNumber(row, ["total", "jumlah", "netto", "amount", "invoice_total"]),
      sourceCode: getString(row, ["sourceCode", "source_code", "type", "kind"]),
      kodeKlien: getString(row, ["kodeKlien", "client_code", "client_id"]),
      namaKlien: getString(row, ["namaKlien", "client_name", "client"]),
      jatuhTempo: getString(row, ["jatuhTempo", "due_date", "dueDate", "tanggal"], ""),
      paidAmount: getNumber(row, ["paid_amount", "paid"]),
      outstandingAmount: getNumber(row, ["outstanding_amount", "outstanding"]),
    }))
  }, [invoiceReport])

  const payments = useMemo<DashboardPaymentRow[]>(() => {
    return extractRows(cashReport).map((row) => ({
      tanggal: getString(row, ["tanggal", "date", "cash_date"], ""),
      totalBayar: getNumber(row, ["totalBayar", "total_amount", "amount"]),
      noPosting: getString(row, ["noPosting", "no_posting", "no_bukti"]),
      kodeKlien: getString(row, ["kodeKlien", "client_code"]),
      namaKlien: getString(row, ["namaKlien", "client_name"]),
      invoices: Array.isArray(row.invoices) ? row.invoices.map((item) => String(item)) : [],
    }))
  }, [cashReport])

  const loading = invoiceLoading || cashLoading
  const error = invoiceError ?? cashError

  const monthlyData = useMemo(() => {
    const bucket = new Map<string, { revenue: number; paid: number }>()

    for (const inv of invoices) {
      const key = monthKey(inv.tanggal)
      const row = bucket.get(key) ?? { revenue: 0, paid: 0 }
      row.revenue += inv.total
      bucket.set(key, row)
    }

    for (const pos of payments) {
      const key = monthKey(pos.tanggal)
      const row = bucket.get(key) ?? { revenue: 0, paid: 0 }
      row.paid += pos.totalBayar
      bucket.set(key, row)
    }

    return Array.from(bucket.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, row]) => ({
        month: monthLabel(month),
        revenue: row.revenue,
        paid: row.paid,
        outstanding: Math.max(0, row.revenue - row.paid),
      }))
  }, [invoices, payments])

  const invoiceTypeData = useMemo(() => {
    const bySource = new Map<string, number>()
    for (const inv of invoices) {
      bySource.set(inv.sourceCode, (bySource.get(inv.sourceCode) ?? 0) + inv.total)
    }
    const total = Array.from(bySource.values()).reduce<number>((sum, value) => sum + value, 0) || 1
    return Array.from(bySource.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
      }))
  }, [invoices])

  const totalRevenue = invoices.reduce<number>((sum, inv) => sum + inv.total, 0)
  const totalPaid = payments.reduce<number>((sum, pos) => sum + pos.totalBayar, 0)
  const totalOutstanding = Math.max(0, totalRevenue - totalPaid)

  const agingData = useMemo(() => {
    const now = parseDate(dateTo) ?? new Date()
    let paid = 0
    let lt30 = 0
    let d30_60 = 0
    let gt60 = 0
    const paidInvoiceNumbers = new Set<string>()

    for (const payment of payments) {
      for (const invoiceNumber of payment.invoices) {
        paidInvoiceNumbers.add(invoiceNumber)
      }
    }

    for (const inv of invoices) {
      const isPaid =
        paidInvoiceNumbers.has(inv.noInvoice) ||
        inv.paidAmount >= inv.total ||
        (inv.outstandingAmount <= 0 && inv.total > 0)

      if (isPaid) {
        paid += inv.total
        continue
      }

      const dueDate = parseDate(inv.jatuhTempo) ?? parseDate(inv.tanggal) ?? now
      const days = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      if (days < 30) lt30 += inv.total
      else if (days < 60) d30_60 += inv.total
      else gt60 += inv.total
    }

    return [
      { category: "Lunas", amount: paid, color: "#22c55e" },
      { category: "< 30 Hari", amount: lt30, color: "#eab308" },
      { category: "30-60 Hari", amount: d30_60, color: "#f97316" },
      { category: "60+ Hari", amount: gt60, color: "#ef4444" },
    ]
  }, [dateTo, invoices, payments])

  const clientPerformance = useMemo(() => {
    const perClient = new Map<string, { revenue: number; collected: number; name: string }>()

    for (const inv of invoices) {
      const row = perClient.get(inv.kodeKlien) ?? { revenue: 0, collected: 0, name: inv.namaKlien }
      row.revenue += inv.total
      row.name = row.name || inv.namaKlien
      perClient.set(inv.kodeKlien, row)
    }

    for (const pos of payments) {
      const row = perClient.get(pos.kodeKlien) ?? { revenue: 0, collected: 0, name: pos.namaKlien }
      row.collected += pos.totalBayar
      row.name = row.name || pos.namaKlien
      perClient.set(pos.kodeKlien, row)
    }

    return Array.from(perClient.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((client) => {
        const ratio = client.revenue > 0 ? client.collected / client.revenue : 0
        return {
          ...client,
          status: ratio >= 0.9 ? "success" : ratio >= 0.5 ? "warning" : "danger",
        }
      })
  }, [invoices, payments])

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <div className="p-6">
        <div className={shellClass + " space-y-4"}>
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className={shellClass}>
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive">
            <AlertDescription>
              Gagal memuat financial dashboard: {error.message}
              <br />
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  void refetchInvoice()
                  void refetchCash()
                }}
              >
                Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dasbor Keuangan</h1>
        <p className="text-muted-foreground">Analisis real-time performa keuangan dan piutang perusahaan</p>
      </div>

      <Card className="border-border/70 bg-card/70 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Tanggal Dari</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Tanggal Sampai</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Bank</label>
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih bank" />
              </SelectTrigger>
              <SelectContent>
                {(banks ?? []).map((bank) => (
                  <SelectItem key={bank.id} value={String(bank.id)}>
                    {bank.code} - {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                void refetchInvoice()
                void refetchCash()
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Revenue
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-green-600 mt-2">Data invoice</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Terbayar
              <DollarSign className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp {totalPaid.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground mt-2">{((totalPaid / (totalRevenue || 1)) * 100).toFixed(1)}% dari total</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Belum Terbayar
              <TrendingDown className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp {totalOutstanding.toLocaleString("id-ID")}</div>
            <p className="text-xs text-red-600 mt-2">{((totalOutstanding / (totalRevenue || 1)) * 100).toFixed(1)}% dari total</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Invoice Aktif
              <Calendar className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Data transaksi</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="trends">Tren</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="clients">Klien</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle>Cash Flow Bulanan</CardTitle>
                <CardDescription>Perbandingan revenue dan collection per bulan</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="paid" fill="#10b981" name="Terbayar" />
                    <Bar dataKey="outstanding" fill="#ef4444" name="Belum Bayar" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle>Status Piutang</CardTitle>
                <CardDescription>Distribusi piutang berdasarkan aging</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={agingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: { name?: string; value?: number }) => `${name}: Rp ${((value ?? 0) / 1000000).toFixed(1)}M`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {agingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>Tren Revenue</CardTitle>
              <CardDescription>Pergerakan revenue dan koleksi pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" strokeWidth={2} />
                  <Line type="monotone" dataKey="paid" stroke="#10b981" name="Terbayar" strokeWidth={2} />
                  <Line type="monotone" dataKey="outstanding" stroke="#ef4444" name="Belum Bayar" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>Revenue per Jenis Invoice</CardTitle>
              <CardDescription>Kontribusi setiap source code terhadap total revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceTypeData.length === 0 ? (
                <div className="text-sm text-muted-foreground">Belum ada data invoice untuk periode ini.</div>
              ) : (
                invoiceTypeData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-semibold">Rp {item.value.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border/60">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">{item.percentage}% dari total</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>Performa Koleksi per Klien</CardTitle>
              <CardDescription>Analisis pembayaran dan status setiap klien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientPerformance.length === 0 ? (
                <div className="text-sm text-muted-foreground">Belum ada data klien untuk periode ini.</div>
              ) : (
                clientPerformance.map((client, idx) => {
                  const percentage = client.revenue > 0 ? (client.collected / client.revenue) * 100 : 0
                  const statusColor = {
                    success: "text-green-600 bg-green-50",
                    warning: "text-amber-300 bg-amber-500/10",
                    danger: "text-red-600 bg-red-50",
                  }[client.status]

                  return (
                    <div key={idx} className={`p-4 rounded-lg border ${statusColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{client.name}</span>
                        <span className="text-sm font-mono">{percentage.toFixed(0)}% terbayar</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Invoice: Rp {(client.revenue / 1000000).toFixed(1)}M</span>
                        <span>Terbayar: Rp {(client.collected / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div className="bg-current h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

