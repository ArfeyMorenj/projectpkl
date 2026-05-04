'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSalesClientReport, useSalesReport, useSalesSummaryReport } from '@/lib/api/hooks'

type ReportRow = Record<string, unknown>

type SalesReportPayload = {
  filter?: {
    period_from?: string
    period_to?: string
    group_by?: string
  }
  group_by?: string
  total_invoices?: number
  total_amount?: number
  report?: Record<string, unknown>
  totals?: Record<string, unknown>
}

function extractRows(reportData: unknown): ReportRow[] {
  if (Array.isArray(reportData)) return reportData as ReportRow[]
  if (reportData && typeof reportData === 'object') {
    const data = (reportData as { data?: unknown }).data
    if (Array.isArray(data)) return data as ReportRow[]
  }
  return []
}

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData) || typeof reportData !== 'object') return {}
  return reportData as SalesReportPayload
}

function getNumber(row: ReportRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && value !== '') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

function getString(row: ReportRow, keys: string[], fallback = '-') {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return fallback
}

function formatPeriod(value: unknown, fallbackFrom: string, fallbackTo: string) {
  if (value && typeof value === 'object') {
    const period = value as { from?: unknown; to?: unknown }
    const from = period.from ? String(period.from) : fallbackFrom
    const to = period.to ? String(period.to) : fallbackTo
    return `${from} s/d ${to}`
  }
  return String(value ?? `${fallbackFrom} s/d ${fallbackTo}`)
}

function monthToDateRange(month: string, mode: 'start' | 'end') {
  if (!month) return ''
  const [year, monthPart] = month.split('-').map(Number)
  if (!year || !monthPart) return ''
  if (mode === 'start') {
    return `${month}-01`
  }
  const lastDate = new Date(year, monthPart, 0).getDate()
  return `${month}-${String(lastDate).padStart(2, '0')}`
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function SalesReportsModule() {
  const [fromMonth, setFromMonth] = useState('2024-01')
  const [toMonth, setToMonth] = useState('2026-12')
  const [activeTab, setActiveTab] = useState('sales')

  const salesParams = {
    period_from: fromMonth,
    period_to: toMonth,
    group_by: 'item',
  }

  const { data: salesData, loading: salesLoading, error: salesError, refetch: refetchSales } = useSalesReport(salesParams)
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useSalesSummaryReport({
    from: monthToDateRange(fromMonth, 'start'),
    to: monthToDateRange(toMonth, 'end'),
  })
  const { data: clientData, loading: clientLoading, error: clientError, refetch: refetchClient } = useSalesClientReport()

  const salesReport = extractObject(salesData)
  const summaryReport = extractObject(summaryData)
  const clientReport = extractObject(clientData)

  const salesRows = useMemo(() => extractRows(salesData), [salesData])
  const summaryRows = useMemo(() => extractRows(summaryData), [summaryData])
  const clientRows = useMemo(() => extractRows(clientData), [clientData])

  const summaryTotals = useMemo(() => {
    const totals = summaryReport.totals
    return {
      bruto: Number(totals?.bruto ?? salesRows.reduce((sum, row) => sum + getNumber(row, ['bruto']), 0)),
      discount: Number(totals?.discount ?? salesRows.reduce((sum, row) => sum + getNumber(row, ['discount']), 0)),
      dpp: Number(totals?.dpp ?? salesRows.reduce((sum, row) => sum + getNumber(row, ['dpp']), 0)),
      ppn: Number(totals?.ppn ?? salesRows.reduce((sum, row) => sum + getNumber(row, ['ppn']), 0)),
      total: Number(totals?.total ?? salesRows.reduce((sum, row) => sum + getNumber(row, ['total']), 0)),
    }
  }, [salesRows, summaryData])

  const clientTotals = useMemo(() => {
    return {
      total: clientRows.reduce((sum, row) => sum + getNumber(row, ['total']), 0),
      dpp: clientRows.reduce((sum, row) => sum + getNumber(row, ['dpp']), 0),
      ppn: clientRows.reduce((sum, row) => sum + getNumber(row, ['ppn']), 0),
    }
  }, [clientRows])

  const activeError = salesError ?? summaryError ?? clientError
  const activeLoading = salesLoading || summaryLoading || clientLoading

  if (activeLoading) {
    return (
      <div className="p-6">
        <div className={shellClass + ' space-y-4'}>
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (activeError) {
    return (
      <div className="p-6">
        <Card className="border-border/70 bg-card/70 p-6 space-y-3">
          <div className="text-red-600 font-semibold">Gagal memuat laporan sales: {activeError.message}</div>
          <Button
            onClick={() => {
              void refetchSales()
              void refetchSummary()
              void refetchClient()
            }}
          >
            Coba Lagi
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className={shellClass + ' space-y-6'}>
        <div>
          <h1 className="text-3xl font-bold">{String(salesReport.report?.title ?? 'Sales Reports')}</h1>
          <p className="text-sm text-muted-foreground">{formatPeriod(salesReport.report?.period, fromMonth, toMonth)}</p>
        </div>

        <Card className="border-border/70 bg-card/70 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Periode Dari</label>
              <Input type="month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Periode Sampai</label>
              <Input type="month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => setActiveTab('sales')}>
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="client">Per Client</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoice</p>
                <p className="text-lg font-bold">{Number(salesReport.total_invoices ?? salesRows.length).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold">Rp {Number(salesReport.total_amount ?? summaryTotals.total).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Group By</p>
                <p className="text-lg font-bold">{String(salesReport.group_by ?? salesReport.filter?.group_by ?? 'item')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Periode</p>
                <p className="text-lg font-bold">{String(salesReport.filter?.period_from ?? fromMonth)} s/d {String(salesReport.filter?.period_to ?? toMonth)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rows</p>
                <p className="text-lg font-bold">{salesRows.length}</p>
              </div>
            </div>

              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Item</TableHead>
                    <TableHead>Nama Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        Belum ada data sales untuk periode ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesRows.map((row, index) => (
                      <TableRow key={`${getString(row, ['item_code'], String(index))}-${index}`}>
                        <TableCell>{getString(row, ['item_code'])}</TableCell>
                        <TableCell>{getString(row, ['item_name'])}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['qty']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['total_amount']).toLocaleString('id-ID')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <div className="mb-3 text-sm text-muted-foreground">
                {String(summaryReport.report?.title ?? 'LAPORAN REKAP PENJUALAN PER ITEM PRODUK')}
              </div>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">DPP</TableHead>
                    <TableHead className="text-right">PPN</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Belum ada summary sales.
                      </TableCell>
                    </TableRow>
                  ) : (
                    summaryRows.map((row, index) => (
                      <TableRow key={`${getString(row, ['kode'], String(index))}-${index}`}>
                        <TableCell>{getString(row, ['kode'])}</TableCell>
                        <TableCell>{getString(row, ['nama'])}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['bruto']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['discount']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['dpp']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['total']).toLocaleString('id-ID')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            </Card>
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <div className="mb-3 text-sm text-muted-foreground">
                {String(clientReport.report?.title ?? 'LAPORAN PENJUALAN PER CLIENT')}
              </div>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Client</TableHead>
                    <TableHead>Nama Client</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">DPP</TableHead>
                    <TableHead className="text-right">PPN</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Belum ada data sales per client.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientRows.map((row, index) => (
                      <TableRow key={`${getString(row, ['client_code'], String(index))}-${index}`}>
                        <TableCell>{getString(row, ['client_code'])}</TableCell>
                        <TableCell>{getString(row, ['client_name'])}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['bruto']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['discount']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['dpp']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{getNumber(row, ['total']).toLocaleString('id-ID')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Total per client: Rp {clientTotals.total.toLocaleString('id-ID')}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
