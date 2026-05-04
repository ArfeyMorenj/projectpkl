'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useBanks } from '@/lib/api/hooks/use-banks'
import { useCashReport } from '@/lib/api/hooks/use-reports'

type ReportRow = Record<string, unknown>

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

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

function getString(row: ReportRow, keys: string[], fallback = '-') {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value)
    }
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

export function BankReportModule() {
  const [startDate, setStartDate] = useState('2025-07-01')
  const [endDate, setEndDate] = useState('2025-10-31')
  const [selectedBankId, setSelectedBankId] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const { data: banksData } = useBanks()
  const { data: reportData, loading, error, refetch } = useCashReport({
    date_from: startDate,
    date_to: endDate,
    bank_id: selectedBankId || undefined,
  })

  const report = extractObject(reportData)
  const banks = banksData ?? []
  const rows = useMemo(() => {
    const allRows = extractRows(reportData)
    return allRows.filter((row) => {
      const bankId = getString(row, ['bank_id'], '')
      const rowDate = getString(row, ['tanggal', 'date', 'cash_date'], '')
      const byBank = !selectedBankId || bankId === selectedBankId
      const byDate = !rowDate || (rowDate >= startDate && rowDate <= endDate)
      return byBank && byDate
    })
  }, [endDate, reportData, selectedBankId, startDate])

  const total = rows.reduce((sum, row) => sum + getNumber(row, ['totalBayar', 'total_amount', 'amount']), 0)
  const totalIn = Number(report.total_in ?? total)
  const paymentCount = Number(report.payment_count ?? rows.length)
  const bankName =
    String(report.bank_name ?? '') ||
    (selectedBankId ? banks.find((bank) => String(bank.id) === selectedBankId)?.name ?? selectedBankId : 'SEMUA')

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
          <div className="text-red-600 font-semibold">Gagal memuat laporan kas/bank: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={shellClass}>
      <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan KAS/BANK</h1>

      <Card className="border-border/70 bg-card/70 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-border/70 bg-card/70 p-4">
              <p className="text-xs text-muted-foreground">Bank</p>
              <p className="text-xl font-bold">{bankName}</p>
            </Card>
            <Card className="border-border/70 bg-card/70 p-4">
              <p className="text-xs text-muted-foreground">Total In</p>
              <p className="text-xl font-bold">Rp {totalIn.toLocaleString('id-ID')}</p>
            </Card>
            <Card className="border-border/70 bg-card/70 p-4">
              <p className="text-xs text-muted-foreground">Payment Count</p>
              <p className="text-xl font-bold">{paymentCount}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal (From)</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">To</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Bank</label>
              <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua bank</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={String(bank.id)}>
                      {bank.code} - {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Bank</label>
              <Input
                type="text"
                value={banks.find((bank) => String(bank.id) === selectedBankId)?.name ?? ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setShowPreview(true)} variant="default">
              Preview
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </div>

          {showPreview && (
            <div className="mt-6 overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">Tanggal</th>
                    <th className="px-2 py-2 text-left">Nomor</th>
                    <th className="px-2 py-2 text-left">Keterangan</th>
                    <th className="px-2 py-2 text-left">Klien</th>
                    <th className="px-2 py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${getString(row, ['noPosting', 'no_posting', 'no_bukti'], String(index))}-${index}`} className="border-b">
                      <td className="px-2 py-2">{getString(row, ['tanggal', 'date', 'cash_date'])}</td>
                      <td className="px-2 py-2">{getString(row, ['noPosting', 'no_posting', 'no_bukti'])}</td>
                      <td className="px-2 py-2">{getString(row, ['keterangan', 'description'])}</td>
                      <td className="px-2 py-2">{getString(row, ['namaKlien', 'client_name'])}</td>
                      <td className="px-2 py-2 text-right">
                        {getNumber(row, ['totalBayar', 'total_amount', 'amount']).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td colSpan={4} className="px-2 py-2">
                      TOTAL
                    </td>
                    <td className="px-2 py-2 text-right">{total.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      </div>
      </div>
    </div>
  )
}
