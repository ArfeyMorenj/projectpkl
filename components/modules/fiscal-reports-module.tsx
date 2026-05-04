'use client'

import { useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFiscalCommercialReport, useTaxReport, useTaxSummaryReport, useTaxVatReport } from '@/lib/api/hooks'

type ReportRow = Record<string, unknown>

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData) || typeof reportData !== 'object') return {}
  return reportData as Record<string, unknown>
}

function extractRows(reportData: unknown): ReportRow[] {
  if (Array.isArray(reportData)) return reportData as ReportRow[]
  if (reportData && typeof reportData === 'object') {
    const rows = (reportData as { data?: unknown }).data
    if (Array.isArray(rows)) return rows as ReportRow[]
  }
  return []
}

function getString(row: ReportRow, keys: string[], fallback = '-') {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return fallback
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

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function FiscalReportsModule() {
  const [activeTab, setActiveTab] = useState('tax')
  const [period, setPeriod] = useState('2026-04')
  const [fromDate, setFromDate] = useState('2025-04-01')
  const [toDate, setToDate] = useState('2026-04-30')
  const [vatType, setVatType] = useState('standard')

  const { data: taxData, loading: taxLoading, error: taxError, refetch: refetchTax } = useTaxReport({
    period,
  })
  const { data: vatData, loading: vatLoading, error: vatError, refetch: refetchVat } = useTaxVatReport({
    from: fromDate,
    to: toDate,
    type: vatType,
  })
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useTaxSummaryReport({
    from: fromDate,
    to: toDate,
  })
  const { data: fiscalData, loading: fiscalLoading, error: fiscalError, refetch: refetchFiscal } = useFiscalCommercialReport({
    period,
  })

  const taxReport = extractObject(taxData)
  const vatReport = extractObject(vatData)
  const summaryReport = extractObject(summaryData)
  const fiscalReport = extractObject(fiscalData)
  const taxReportInfo = taxReport.report && typeof taxReport.report === 'object' ? (taxReport.report as Record<string, unknown>) : {}
  const vatReportInfo = vatReport.report && typeof vatReport.report === 'object' ? (vatReport.report as Record<string, unknown>) : {}
  const summaryReportInfo = summaryReport.report && typeof summaryReport.report === 'object' ? (summaryReport.report as Record<string, unknown>) : {}
  const fiscalReportInfo = fiscalReport.report && typeof fiscalReport.report === 'object' ? (fiscalReport.report as Record<string, unknown>) : {}

  const taxRows = useMemo(() => extractRows(taxData), [taxData])
  const vatRows = useMemo(() => extractRows(vatData), [vatData])
  const summaryRows = useMemo(() => extractRows(summaryData), [summaryData])
  const fiscalRows = useMemo(() => extractRows(fiscalData), [fiscalData])

  const taxTotals = useMemo(() => ({
    dpp: taxRows.reduce((sum, row) => sum + getNumber(row, ['dpp']), 0),
    ppn: taxRows.reduce((sum, row) => sum + getNumber(row, ['ppn']), 0),
  }), [taxRows])

  const taxByType = Array.isArray(taxReport.by_type) ? (taxReport.by_type as ReportRow[]) : []

  const vatTotals = useMemo(() => ({
    dpp: vatRows.reduce((sum, row) => sum + getNumber(row, ['dpp']), 0),
    ppn: vatRows.reduce((sum, row) => sum + getNumber(row, ['ppn']), 0),
  }), [vatRows])

  const summaryTotals = useMemo(() => {
    const summary = summaryData && typeof summaryData === 'object' ? (summaryData as { summary?: Record<string, unknown> }).summary : undefined
    return {
      invoice: Number(summary?.total_invoice ?? summaryRows.length),
      dpp: Number(summary?.total_dpp ?? summaryRows.reduce((sum, row) => sum + getNumber(row, ['dpp']), 0)),
      ppn: Number(summary?.total_ppn ?? summaryRows.reduce((sum, row) => sum + getNumber(row, ['ppn']), 0)),
    }
  }, [summaryData, summaryRows])

  const fiscalTotals = useMemo(() => ({
    dpp: fiscalRows.reduce((sum, row) => sum + getNumber(row, ['dpp']), 0),
    ppn: fiscalRows.reduce((sum, row) => sum + getNumber(row, ['ppn']), 0),
  }), [fiscalRows])

  const activeLoading = taxLoading || vatLoading || summaryLoading || fiscalLoading
  const activeError = taxError ?? vatError ?? summaryError ?? fiscalError

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
          <div className="text-red-600 font-semibold">Gagal memuat laporan fiskal: {activeError.message}</div>
          <Button
            onClick={() => {
              void refetchTax()
              void refetchVat()
              void refetchSummary()
              void refetchFiscal()
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Laporan Fiskal & Pajak</h1>
          <p className="text-muted-foreground">Connected to tax, VAT, summary, dan fiscal-commercial endpoints from Postman collection.</p>
        </div>

        <Card className="border-border/70 bg-card/70 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold">Period</label>
              <Input className="w-full" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold">From</label>
              <Input className="w-full" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold">To</label>
              <Input className="w-full" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="vat">VAT</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          </TabsList>

          <TabsContent value="tax" className="space-y-4">
            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{String(taxReportInfo.title ?? 'LAPORAN PAJAK')}</CardTitle>
                    <CardDescription>Endpoint /api/reports/tax dengan saved response collection.</CardDescription>
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
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Periode: {String(taxReport.period ?? period)}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="text-xs text-muted-foreground">Total Invoice</div>
                    <div className="text-2xl font-bold">{taxRows.length}</div>
                  </Card>
                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="text-xs text-muted-foreground">Total DPP</div>
                    <div className="text-2xl font-bold">Rp {taxTotals.dpp.toLocaleString('id-ID')}</div>
                  </Card>
                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="text-xs text-muted-foreground">Total PPN</div>
                    <div className="text-2xl font-bold">Rp {taxTotals.ppn.toLocaleString('id-ID')}</div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="text-xs text-muted-foreground">PPN Collectible</div>
                    <div className="text-2xl font-bold">Rp {getNumber((taxReport.summary ?? {}) as ReportRow, ['total_ppn_collectible']).toLocaleString('id-ID')}</div>
                  </Card>
                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="text-xs text-muted-foreground">PPN %</div>
                    <div className="text-2xl font-bold">{getNumber((taxReport.summary ?? {}) as ReportRow, ['total_ppn_percentage']).toLocaleString('id-ID')}%</div>
                  </Card>
                  <Card className="border-border/70 bg-card/70 p-4">
                    <div className="text-xs text-muted-foreground">By Type</div>
                    <div className="text-2xl font-bold">{taxByType.length}</div>
                  </Card>
                </div>

                {taxByType.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipe</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">DPP</TableHead>
                          <TableHead className="text-right">PPN</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxByType.map((row, index) => (
                          <TableRow key={`${getString(row, ['type'], String(index))}-${index}`}>
                            <TableCell>{getString(row, ['type'])}</TableCell>
                            <TableCell className="text-right">{getNumber(row, ['count']).toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-right">{getNumber(row, ['dpp']).toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>No Transaksi</TableHead>
                        <TableHead>Wajib Pajak</TableHead>
                        <TableHead>Invoice Type</TableHead>
                        <TableHead className="text-right">DPP</TableHead>
                        <TableHead className="text-right">PPN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            Belum ada data pajak.
                          </TableCell>
                        </TableRow>
                      ) : (
                        taxRows.map((row, index) => (
                          <TableRow key={`${getString(row, ['number'], String(index))}-${index}`}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{getString(row, ['date', 'tax_date'])}</TableCell>
                            <TableCell className="font-mono">{getString(row, ['number'])}</TableCell>
                            <TableCell>{getString(row, ['client_name'])}</TableCell>
                            <TableCell>{getString(row, ['invoice_type'])}</TableCell>
                            <TableCell className="text-right">{getNumber(row, ['dpp']).toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vat" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-2xl font-bold">{String(vatReportInfo.type ?? vatType)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total DPP</p>
                  <p className="text-2xl font-bold">Rp {getNumber(vatReport as ReportRow, ['total_dpp']).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total PPN</p>
                  <p className="text-2xl font-bold">Rp {getNumber(vatReport as ReportRow, ['total_ppn']).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {String(vatReportInfo.title ?? 'LAPORAN PAJAK VAT')} | Periode: {String((vatReportInfo.period as { from?: string } | undefined)?.from ?? fromDate)} S/D {String((vatReportInfo.period as { to?: string } | undefined)?.to ?? toDate)}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>No Transaksi</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead className="text-right">DPP</TableHead>
                      <TableHead className="text-right">PPN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Belum ada data VAT.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vatRows.map((row, index) => (
                        <TableRow key={`${getString(row, ['number'], String(index))}-${index}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{getString(row, ['date', 'tax_date'])}</TableCell>
                          <TableCell className="font-mono">{getString(row, ['number'])}</TableCell>
                          <TableCell>{getString(row, ['client_name'])}</TableCell>
                          <TableCell className="text-right">{getNumber(row, ['dpp']).toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
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
                {String(summaryReportInfo.title ?? 'RINGKASAN PAJAK')} | Periode: {String((summaryReport.period as { from?: string } | undefined)?.from ?? fromDate)} S/D {String((summaryReport.period as { to?: string } | undefined)?.to ?? toDate)}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
                <Card className="border-border/70 bg-card/70 p-4">
                  <div className="text-xs text-muted-foreground">Total Invoice</div>
                  <div className="text-2xl font-bold">{summaryTotals.invoice}</div>
                </Card>
                <Card className="border-border/70 bg-card/70 p-4">
                  <div className="text-xs text-muted-foreground">Total DPP</div>
                  <div className="text-2xl font-bold">Rp {summaryTotals.dpp.toLocaleString('id-ID')}</div>
                </Card>
                <Card className="border-border/70 bg-card/70 p-4">
                  <div className="text-xs text-muted-foreground">Total PPN</div>
                  <div className="text-2xl font-bold">Rp {summaryTotals.ppn.toLocaleString('id-ID')}</div>
                </Card>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Client</TableHead>
                      <TableHead>Nama Client</TableHead>
                      <TableHead>NPWP</TableHead>
                      <TableHead className="text-right">DPP</TableHead>
                      <TableHead className="text-right">PPN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Belum ada ringkasan pajak.
                        </TableCell>
                      </TableRow>
                    ) : (
                      summaryRows.map((row, index) => (
                        <TableRow key={`${getString(row, ['client_code'], String(index))}-${index}`}>
                          <TableCell>{getString(row, ['client_code'])}</TableCell>
                          <TableCell>{getString(row, ['client_name'])}</TableCell>
                          <TableCell>{getString(row, ['npwp'])}</TableCell>
                          <TableCell className="text-right">{getNumber(row, ['dpp']).toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fiscal" className="space-y-4">
            <Card className="border-border/70 bg-card/70 p-4">
              <div className="mb-3 text-sm text-muted-foreground">
                {String(fiscalReportInfo.title ?? 'LAPORAN FISKAL & KOMERSIAL')} | Periode: {String(fiscalReportInfo.period ?? period)}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
                <Card className="border-border/70 bg-card/70 p-4">
                  <div className="text-xs text-muted-foreground">Total DPP</div>
                  <div className="text-2xl font-bold">Rp {fiscalTotals.dpp.toLocaleString('id-ID')}</div>
                </Card>
                <Card className="border-border/70 bg-card/70 p-4">
                  <div className="text-xs text-muted-foreground">Total PPN</div>
                  <div className="text-2xl font-bold">Rp {fiscalTotals.ppn.toLocaleString('id-ID')}</div>
                </Card>
                <Card className="border-border/70 bg-card/70 p-4">
                  <div className="text-xs text-muted-foreground">Rows</div>
                  <div className="text-2xl font-bold">{fiscalRows.length}</div>
                </Card>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>No. Transaksi</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">PPN Fis.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fiscalRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Belum ada data fiscal-commercial.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fiscalRows.map((row, index) => (
                        <TableRow key={`${getString(row, ['noInvoice', 'no_invoice'], String(index))}-${index}`}>
                          <TableCell>{getString(row, ['sourceCode', 'source_code'])}</TableCell>
                          <TableCell>{getString(row, ['name', 'title'], getString(row, ['kind', 'type'], '-'))}</TableCell>
                          <TableCell className="font-mono">{getString(row, ['noInvoice', 'no_invoice', 'number'])}</TableCell>
                          <TableCell>{getString(row, ['kind', 'type']).toUpperCase()}</TableCell>
                          <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

