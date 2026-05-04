'use client'

import { useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInvoiceRegisterReport } from '@/lib/api/hooks'

type InvoiceRegisterRow = Record<string, unknown>

type InvoiceRegisterRekapRow = {
  kode: string
  nama: string
  dpp: number
  ppn: number
  total: number
}

type InvoiceRegisterPayload = {
  filter?: Record<string, unknown>
  mode?: string
  total_invoices?: number
  grand_total?: Record<string, unknown>
  report?: Record<string, unknown>
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function extractRows(reportData: unknown): InvoiceRegisterRow[] {
  if (Array.isArray(reportData)) return reportData as InvoiceRegisterRow[]
  if (reportData && typeof reportData === "object") {
    const payload = reportData as { rows?: unknown; data?: unknown; detail?: unknown }
    if (Array.isArray(payload.rows)) return payload.rows as InvoiceRegisterRow[]
    if (Array.isArray(payload.data)) return payload.data as InvoiceRegisterRow[]
    if (Array.isArray(payload.detail)) return payload.detail as InvoiceRegisterRow[]
  }
  return []
}

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData) || typeof reportData !== 'object') return {}
  return reportData as InvoiceRegisterPayload
}

function getField(row: InvoiceRegisterRow, keys: string[], fallback = '-'): string {
  for (const key of keys) {
    const value = row?.[key]
    if (value !== undefined && value !== null && value !== '') {
      return String(value)
    }
  }
  return String(fallback)
}

export function InvoiceRegisterModule() {
  const [activeTab, setActiveTab] = useState('detail')
  const [periodFrom, setPeriodFrom] = useState('2025-10')
  const [periodTo, setPeriodTo] = useState('2025-10')
  const [noInvoice, setNoInvoice] = useState('')
  const [namaKlien, setNamaKlien] = useState('')

  const { data: reportData, loading, error, refetch } = useInvoiceRegisterReport({
    period_from: periodFrom,
    period_to: periodTo,
    detailed: '',
  })

  const report = extractObject(reportData)

  const rows = useMemo<InvoiceRegisterRow[]>(() => {
    const rawRows = extractRows(reportData)
    const queryInvoice = noInvoice.trim().toLowerCase()
    const queryClient = namaKlien.trim().toLowerCase()

    return rawRows.filter((row) => {
      const rowInvoice = String(getField(row, ['noInvoice', 'no_invoice', 'invoice_number', 'number'], '')).toLowerCase()
      const rowClient = String(getField(row, ['namaKlien', 'nama_klien', 'client_name', 'client'], '')).toLowerCase()
      const rowDate = String(getField(row, ['tanggal', 'invoice_date', 'date'], ''))
      const rowPeriod = rowDate ? rowDate.slice(0, 7) : ''

      const byDate = !rowPeriod || (rowPeriod >= periodFrom && rowPeriod <= periodTo)
      const byNo = !queryInvoice || rowInvoice.includes(queryInvoice)
      const byName = !queryClient || rowClient.includes(queryClient)
      return byDate && byNo && byName
    })
  }, [namaKlien, noInvoice, periodFrom, periodTo, reportData])

  const rekap = useMemo<InvoiceRegisterRekapRow[]>(() => {
    const map = new Map<string, InvoiceRegisterRekapRow>()
    for (const row of rows) {
      const kode = getField(row, ['kodeKlien', 'kode_klien', 'client_code'], '')
      const nama = getField(row, ['namaKlien', 'nama_klien', 'client_name', 'client'], '')
      const key = `${kode}-${nama}`
      const prev = map.get(key) ?? { kode, nama, dpp: 0, ppn: 0, total: 0 }
      prev.dpp += Number(getField(row, ['dpp'], '0'))
      prev.ppn += Number(getField(row, ['ppn'], '0'))
      prev.total += Number(getField(row, ['total', 'total_amount', 'netto'], '0'))
      map.set(key, prev)
    }
    return Array.from(map.values())
  }, [rows])

  const totalDpp = rows.reduce<number>((sum, row) => sum + Number(getField(row, ['dpp'], '0')), 0)
  const totalPpn = rows.reduce<number>((sum, row) => sum + Number(getField(row, ['ppn'], '0')), 0)
  const grandTotal = report.grand_total ?? {}

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
          <div className="space-y-3">
            <div className="text-red-600 font-semibold">Gagal memuat register invoice: {error.message}</div>
            <Button onClick={refetch}>Coba Lagi</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={shellClass}>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Register Invoice</h1>
          <p className="text-muted-foreground">Rekap dan detail invoice berdasarkan periode dari API.</p>
        </div>

      <Card className="mt-6 border-border/70 bg-card/70 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-semibold">Periode Dari</label>
            <Input type="month" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold">Periode Sampai</label>
            <Input type="month" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold">No. Invoice</label>
            <Input value={noInvoice} onChange={(e) => setNoInvoice(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold">Nama Klien</label>
            <Input value={namaKlien} onChange={(e) => setNamaKlien(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {String(report.report?.title ?? 'REGISTER INVOICE')} | Mode: {String(report.mode ?? 'rekap')} | Total invoice: {Number(report.total_invoices ?? rows.length)}
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detail">Detail Register</TabsTrigger>
          <TabsTrigger value="rekap">Daftar Ringkas</TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="space-y-4">
          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>REGISTER INVOICE (DETAIL)</CardTitle>
                  <CardDescription>Detail invoice + status pembayaran.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TGL</TableHead>
                      <TableHead>No Invoice</TableHead>
                      <TableHead>Jth Tempo</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">DPP</TableHead>
                      <TableHead className="text-right">PPN</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Sudah Bayar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={getField(row, ['id', 'noInvoice', 'invoice_number', 'number'], String(Math.random()))}>
                        <TableCell>{getField(row, ['tanggal', 'invoice_date', 'date'])}</TableCell>
                        <TableCell className="font-mono">{getField(row, ['noInvoice', 'no_invoice', 'invoice_number', 'number'])}</TableCell>
                        <TableCell>{getField(row, ['jatuhTempo', 'due_date'])}</TableCell>
                        <TableCell>{getField(row, ['namaKlien', 'nama_klien', 'client_name', 'client'])}</TableCell>
                        <TableCell className="text-sm">{getField(row, ['keterangan', 'description'])}</TableCell>
                        <TableCell className="text-right">{Number(getField(row, ['dpp'], '0')).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{Number(getField(row, ['ppn'], '0')).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right font-semibold">{Number(getField(row, ['total', 'total_amount', 'netto'], '0')).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{Number(getField(row, ['paid_amount', 'sudahBayar'], '0')).toLocaleString('id-ID')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rekap" className="space-y-4">
          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>REGISTER INVOICE (REKAP)</CardTitle>
                  <CardDescription>Ringkasan per klien.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kd.Klien</TableHead>
                      <TableHead>Nama Klien</TableHead>
                      <TableHead className="text-right">DPP</TableHead>
                      <TableHead className="text-right">PPN</TableHead>
                      <TableHead className="text-right">Netto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekap.map((row) => (
                      <TableRow key={`${row.kode}-${row.nama}`}>
                        <TableCell>{row.kode || '-'}</TableCell>
                        <TableCell>{row.nama || '-'}</TableCell>
                        <TableCell className="text-right">{row.dpp.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{row.ppn.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right font-semibold">{row.total.toLocaleString('id-ID')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rows.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total DPP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(grandTotal.dpp ?? totalDpp).toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PPN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(grandTotal.ppn ?? totalPpn).toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

