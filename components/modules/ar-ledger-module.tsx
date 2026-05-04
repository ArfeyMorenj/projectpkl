'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useArLedgerReport, useArSummaryReport, useClients } from '@/lib/api/hooks'

type ReportRow = Record<string, unknown> & {
  invoice?: Record<string, unknown>
}

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData) || typeof reportData !== 'object') return {}
  return reportData as Record<string, unknown>
}

function extractRows(reportData: unknown): ReportRow[] {
  if (Array.isArray(reportData)) return reportData as ReportRow[]
  if (reportData && typeof reportData === 'object') {
    const data = (reportData as { data?: unknown }).data
    if (Array.isArray(data)) return data as ReportRow[]
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

export function ArLedgerModule() {
  const [clientId, setClientId] = useState('1')
  const [from, setFrom] = useState('2025-01')
  const [to, setTo] = useState('2026-04')

  const { data: clientsData } = useClients()
  const { data: summaryData } = useArSummaryReport()
  const { data: reportData, loading, error, refetch } = useArLedgerReport({
    client_id: clientId || undefined,
    from,
    to,
  })

  const report = extractObject(reportData)
  const summaryReport = extractObject(summaryData)
  const clients = clientsData ?? []
  const rows = useMemo(() => extractRows(reportData), [reportData])
  const summaryRows = useMemo(() => extractRows(summaryData), [summaryData])

  const totalEndingBalance = Number(report.total_ending_balance ?? rows.reduce((sum, row) => sum + getNumber(row, ['ending_balance']), 0))
  const filter = extractObject(report.filter)

  if (loading) {
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

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-border/70 bg-card/70 p-6 space-y-3">
          <div className="text-red-600 font-semibold">Gagal memuat AR ledger: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className={shellClass + ' space-y-6'}>
        <div>
          <h1 className="text-3xl font-bold">AR Ledger</h1>
          <p className="text-sm text-muted-foreground">Endpoint {`/api/reports/ar/ledger`} dengan filter client dan periode.</p>
        </div>

        <Card className="border-border/70 bg-card/70 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Client</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.code} - {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">From (YYYY-MM)</label>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2025-01" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">To (YYYY-MM)</label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-04" />
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-card/70 p-4">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded border border-border/60 p-4">
              <div className="text-xs text-muted-foreground">Row Summary</div>
              <div className="text-2xl font-bold">{summaryRows.length}</div>
            </div>
            <div className="rounded border border-border/60 p-4">
              <div className="text-xs text-muted-foreground">Ending Balance</div>
              <div className="text-2xl font-bold">Rp {totalEndingBalance.toLocaleString('id-ID')}</div>
            </div>
            <div className="rounded border border-border/60 p-4">
              <div className="text-xs text-muted-foreground">Filter Client</div>
              <div className="text-2xl font-bold">{clientId}</div>
            </div>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            Period summary: {String(summaryReport.period ?? '-')} | Filter backend: client {String(filter.client_id ?? clientId)} from {String(filter.from ?? from)} to {String(filter.to ?? to)}
          </div>

          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Beginning</TableHead>
                <TableHead className="text-right">Netto</TableHead>
                <TableHead className="text-right">PPN</TableHead>
                <TableHead className="text-right">Biaya</TableHead>
                <TableHead className="text-right">Nota Debet</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="text-right">Ending</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    Belum ada data ledger.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={`${getString(row, ['period'], String(index))}-${index}`}>
                    <TableCell>{getString(row, ['period'])}</TableCell>
                    <TableCell>{getString(row.invoice ?? row, ['number', 'invoice_number'], '-')}</TableCell>
                    <TableCell>{getString(row, ['client_name'])}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['beginning_balance']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['netto']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['ppn']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['biaya']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['nota_debet']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['payment']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right font-semibold">{getNumber(row, ['ending_balance']).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{getString(row, ['status'])}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
