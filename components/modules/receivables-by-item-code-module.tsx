'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useReceivableByItemReport } from '@/lib/api/hooks'

const itemTypes = [
  { id: '2', name: 'LICENSE' },
  { id: '1', name: 'HARDWARE' },
  { id: '3', name: 'SOFTWARE' },
  { id: '4', name: 'SERVICE' },
]

type ReportRow = Record<string, unknown>

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData) || typeof reportData !== 'object') return {}
  return reportData as Record<string, unknown>
}

function extractRows(reportData: unknown): ReportRow[] {
  if (Array.isArray(reportData)) return reportData as ReportRow[]
  if (reportData && typeof reportData === 'object') {
    const rows = (reportData as { rows?: unknown }).rows
    const data = (reportData as { data?: unknown }).data
    if (Array.isArray(rows)) return rows as ReportRow[]
    if (Array.isArray(data)) return data as ReportRow[]
  }
  return []
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

function getMonthNominal(entry: unknown) {
  if (entry && typeof entry === 'object') return Number((entry as { nominal?: unknown }).nominal ?? 0)
  return Number(entry ?? 0)
}

export function ReceivablesByItemCodeModule() {
  const [periodFrom, setPeriodFrom] = useState('2025-01')
  const [periodTo, setPeriodTo] = useState('2025-12')
  const [selectedItemCode, setSelectedItemCode] = useState('1')

  const { data: reportData, loading, error, refetch } = useReceivableByItemReport({
    period_from: periodFrom,
    period_to: periodTo,
    item_code: selectedItemCode,
  })

  const report = extractObject(reportData)
  const rows = useMemo(() => extractRows(report.data), [report.data])
  const months = Array.isArray(report.months) ? (report.months as string[]) : []
  const totals = report.totals && typeof report.totals === 'object' ? (report.totals as Record<string, unknown>) : {}
  const totalClients = Number(report.total_clients ?? rows.length)

  const matrixRows = useMemo(() => {
    return rows.map((row) => {
      const monthMap = (row.months && typeof row.months === 'object' ? row.months : {}) as Record<string, unknown>
      return {
        code: getString(row, ['client_code', 'code', 'kode']),
        name: getString(row, ['client_name', 'name', 'nama']),
        months: monthMap,
      }
    })
  }, [rows])

  const grandTotal = months.reduce((sum, month) => sum + Number(totals[month] ?? 0), 0)

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 space-y-3">
          <div className="text-red-600 font-semibold">Gagal memuat laporan piutang: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Piutang Dasar Kode Item</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Periode Dari</label>
              <Input type="month" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Periode Sampai</label>
              <Input type="month" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Jenis Item</label>
              <Select value={selectedItemCode} onValueChange={setSelectedItemCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="default">Preview</Button>
            <Button variant="outline">Close</Button>
          </div>

          <div className="mt-6 rounded-lg border bg-muted p-4">
            <div className="mb-4">
              <p className="font-semibold">LAPORAN PIUTANG DASAR KODE ITEM</p>
              <p className="text-sm text-muted-foreground">
                PERIODE : {periodFrom} S/D {periodTo} | JENIS ITEM : {itemTypes.find((t) => t.id === selectedItemCode)?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total client: {totalClients} | Total semua bulan: {grandTotal.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">KODE</th>
                    <th className="px-2 py-2 text-left">NAMA</th>
                    {months.map((month) => (
                      <th key={month} className="px-2 py-2 text-right">{month}</th>
                    ))}
                    <th className="px-2 py-2 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixRows.map((row, index) => {
                    const rowTotal = months.reduce((sum, month) => sum + getMonthNominal(row.months[month]), 0)
                    return (
                      <tr key={`${row.code}-${index}`} className="border-b">
                        <td className="px-2 py-2">{row.code}</td>
                        <td className="px-2 py-2">{row.name}</td>
                        {months.map((month) => {
                          return (
                            <td key={month} className="px-2 py-2 text-right font-mono">
                              {getMonthNominal(row.months[month]).toLocaleString('id-ID')}
                            </td>
                          )
                        })}
                        <td className="px-2 py-2 text-right font-mono font-semibold">{rowTotal.toLocaleString('id-ID')}</td>
                      </tr>
                    )
                  })}
                  <tr className="bg-muted font-semibold">
                    <td colSpan={2} className="px-2 py-2">
                      TOTAL
                    </td>
                    {months.map((month) => (
                      <td key={month} className="px-2 py-2 text-right font-mono">
                        {Number(totals[month] ?? 0).toLocaleString('id-ID')}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-right font-mono">{grandTotal.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
