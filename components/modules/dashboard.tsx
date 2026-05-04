"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, Package, DollarSign, TrendingUp } from "lucide-react"
import { useDashboardReport, useClients, useProducts } from "@/lib/api/hooks"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]
const shellClass =
  "bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm"

type DashboardReportData = {
  invoice_total?: number
  invoice_unpaid?: number
  payment_total?: number
  ar_ending_balance?: number
}

type DashboardPayload = {
  period?: string
  data?: DashboardReportData
}

function formatMonthLabel(month: string): string {
  const [yyyy, mm] = month.split("-")
  return new Date(Number(yyyy), Number(mm) - 1, 1).toLocaleDateString("id-ID", { month: "short" })
}

export function Dashboard() {
  // Get current period (YYYY-MM format)
  const now = new Date()
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const { data: dashboardData, loading: dashLoading, error: dashError } = useDashboardReport({ period: currentPeriod })
  const { data: clientsData, loading: clientsLoading } = useClients()
  const { data: productsData, loading: productsLoading } = useProducts()

  if (dashLoading || clientsLoading || productsLoading) {
    return (
      <div className="p-6">
        <div className={shellClass + " space-y-4"}>
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (dashError) {
    return (
      <div className="p-6">
        <div className={shellClass}>
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive">
          <AlertDescription>
            Gagal memuat dashboard data: {dashError?.message || 'Unknown error'}
            <br />
            <small className="mt-2 block">Pastikan backend running di http://127.0.0.1:8000</small>
          </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const clients = clientsData || []
  const products = productsData || []
  const payload = (dashboardData || {}) as DashboardPayload
  const report = payload.data || {}

  // Parse report data (simplified structure from API)
  const invoiceTotal = report.invoice_total || 0
  const invoiceUnpaid = report.invoice_unpaid || 0
  const paymentTotal = report.payment_total || 0
  const arBalance = report.ar_ending_balance || 0

  // Calculate collection rate
  const collectionRate = invoiceTotal > 0 ? ((paymentTotal / invoiceTotal) * 100).toFixed(1) : 0

  const dashboardStats = [
    { 
      label: "Total Clients", 
      value: clients.length.toString(), 
      icon: Users, 
      trend: "Master", 
      color: "bg-blue-500" 
    },
    { 
      label: "Products", 
      value: products.length.toString(), 
      icon: Package, 
      trend: "Master", 
      color: "bg-green-500" 
    },
    {
      label: "Total Invoice",
      value: `Rp ${invoiceTotal.toLocaleString("id-ID")}`,
      icon: DollarSign,
      trend: `Rp ${invoiceUnpaid.toLocaleString("id-ID")} unpaid`,
      color: "bg-purple-500",
    },
    {
      label: "Collection Rate",
      value: `${collectionRate}%`,
      icon: TrendingUp,
      trend: `Rp ${paymentTotal.toLocaleString("id-ID")} collected`,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className={shellClass + " space-y-6"}>
        <div className="text-sm text-muted-foreground">
          Period: {payload.period || currentPeriod}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="border-border/70 bg-card/70 p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="mt-2 text-xs text-green-600">{stat.trend}</p>
                  </div>
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="border-border/70 bg-card/70 p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Summary Report</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 py-2">
                <span className="text-muted-foreground">Total Invoice:</span>
                <span className="font-semibold">Rp {invoiceTotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-2">
                <span className="text-muted-foreground">Unpaid Invoice:</span>
                <span className="font-semibold text-red-600">Rp {invoiceUnpaid.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Payment Collected:</span>
                <span className="font-semibold text-green-600">Rp {paymentTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 py-2">
                <span className="text-muted-foreground">AR Balance:</span>
                <span className="font-semibold">Rp {arBalance.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-2">
                <span className="text-muted-foreground">Collection Rate:</span>
                <span className="font-semibold text-blue-600">{collectionRate}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-semibold">{currentPeriod}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

