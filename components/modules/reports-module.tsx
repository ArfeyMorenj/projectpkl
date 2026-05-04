"use client"

import { useMemo, useState } from "react"
import { Download, Filter, FileBarChart2, FileSpreadsheet, FileText, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardReport } from "@/lib/api/hooks"

const reportTypes = [
  { id: "financial", name: "Financial Report", icon: FileBarChart2, description: "Ringkasan omzet, piutang, dan pembayaran" },
  { id: "sales", name: "Sales Report", icon: FileSpreadsheet, description: "Analisis penjualan per invoice dan klien" },
  { id: "tax", name: "Tax Report", icon: Receipt, description: "Rekap DPP dan PPN per periode" },
  { id: "register", name: "Register Invoice", icon: FileText, description: "Daftar invoice dan status pembayarannya" },
]

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData)) return {}
  if (reportData && typeof reportData === "object") {
    const data = (reportData as { data?: unknown }).data
    if (data && !Array.isArray(data) && typeof data === "object") {
      return data as Record<string, unknown>
    }
  }
  return reportData as Record<string, unknown>
}

type RecentReport = {
  id: number | string
  title: string
  generatedAt: string
  amount: number
}

const shellClass =
  "bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm"

export function ReportsModule() {
  const now = new Date()
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  const [filterApplied, setFilterApplied] = useState(false)

  const { data: dashboardData, loading, error, refetch } = useDashboardReport({
    period,
  })

  const report = useMemo(() => extractObject(dashboardData), [dashboardData])

  const totalInvoice = Number(report.invoice_total ?? report.total_invoice ?? 0)
  const totalUnpaid = Number(report.invoice_unpaid ?? report.total_unpaid ?? 0)
  const totalPayment = Number(report.payment_total ?? report.total_payment ?? 0)
  const arBalance = Number(report.ar_ending_balance ?? report.ar_balance ?? report.total_ar ?? 0)

  const recentReports = useMemo<RecentReport[]>(() => {
    const list = Array.isArray(report.recent_reports)
      ? (report.recent_reports as Array<Record<string, unknown>>)
      : Array.isArray(report.items)
        ? (report.items as Array<Record<string, unknown>>)
        : []

    return list.slice(0, 3).map((item, index): RecentReport => ({
      id: (item.id as string | number | undefined) ?? index + 1,
      title: String(item.title ?? item.name ?? `Report ${index + 1}`),
      generatedAt: String(item.generated_at ?? item.generatedAt ?? item.date ?? period),
      amount: Number(item.amount ?? item.total ?? item.value ?? 0),
    }))
  }, [period, report])

  if (loading) {
    return (
      <div className="p-6">
        <div className={shellClass + " space-y-4"}>
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-border/70 bg-card/70 p-6 space-y-3">
          <div className="font-semibold text-red-600">Gagal memuat laporan dashboard: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  const handleDownload = (name: string) => {
    alert(`Generate report: ${name}\nPeriod: ${period}\nInvoice: Rp ${totalInvoice.toLocaleString("id-ID")}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className={shellClass + " space-y-6"}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate and download business reports</p>
        </div>

        <Card className="border-border/70 bg-card/70 p-4">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">Period</label>
                <Input type="month" className="mt-2" value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>
              <Button
                className="self-end gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setFilterApplied(true)}
              >
                <Filter className="w-4 h-4" />
                Apply Filter
              </Button>
            </div>
            {filterApplied && (
              <div className="text-xs text-muted-foreground">
                Hasil filter periode {period}: Invoice Rp {totalInvoice.toLocaleString("id-ID")} | Piutang Rp{" "}
                {arBalance.toLocaleString("id-ID")} | Pembayaran Rp {totalPayment.toLocaleString("id-ID")}
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">Total Invoice</p>
            <div className="mt-2 text-2xl font-bold">Rp {totalInvoice.toLocaleString("id-ID")}</div>
          </Card>
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">Unpaid Invoice</p>
            <div className="mt-2 text-2xl font-bold text-red-600">Rp {totalUnpaid.toLocaleString("id-ID")}</div>
          </Card>
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">Payment Collected</p>
            <div className="mt-2 text-2xl font-bold text-green-600">Rp {totalPayment.toLocaleString("id-ID")}</div>
          </Card>
          <Card className="border-border/70 bg-card/70 p-5">
            <p className="text-sm text-muted-foreground">AR Balance</p>
            <div className="mt-2 text-2xl font-bold">Rp {arBalance.toLocaleString("id-ID")}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reportTypes.map((reportType) => {
            const Icon = reportType.icon
            return (
              <Card key={reportType.id} className="border-border/70 bg-card/70 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{reportType.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{reportType.description}</p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Preview
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleDownload(reportType.name)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="border-border/70 bg-card/70 p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Recent Reports</h3>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <div className="text-sm text-muted-foreground">Belum ada ringkasan report dari backend untuk periode ini.</div>
            ) : (
              recentReports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded px-3 -mx-3 py-3 hover:bg-muted/30 border-b border-border/60 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">Generated {r.generatedAt}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1">
                    <Download className="h-4 w-4" />
                    Rp {r.amount.toLocaleString("id-ID")}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
