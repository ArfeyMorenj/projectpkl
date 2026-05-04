"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBanks } from "@/lib/api/hooks"
import { useCashReport } from "@/lib/api/hooks/use-reports"

type ReportRow = Record<string, unknown>

function extractObject(reportData: unknown) {
  if (!reportData || Array.isArray(reportData) || typeof reportData !== 'object') return {}
  return reportData as Record<string, unknown>
}

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

type RegisterRow = {
  tanggal: string
  nomor: string
  keterangan: string
  klien: string
  tagihan: number
  mutasi: number
  saldo: number
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function BankRegisterModule() {
  const [fromDate, setFromDate] = useState("2025-07-01")
  const [toDate, setToDate] = useState("2025-10-31")
  const [bankId, setBankId] = useState("")

  const { data: banksData } = useBanks()
  const { data: reportData, loading, error, refetch } = useCashReport({
    date_from: fromDate,
    date_to: toDate,
    bank_id: bankId || undefined,
  })

  const report = extractObject(reportData)
  const banks = banksData ?? []

  const rows = useMemo<RegisterRow[]>(() => {
    const apiRows = extractRows(reportData)
    let runningSaldo = 0

    return apiRows
      .filter((row) => {
        const rowBankId = getString(row, ["bank_id"], "")
        const rowDate = getString(row, ["tanggal", "date", "cash_date"], "")
        const matchesBank = !bankId || rowBankId === bankId
        const matchesDate = !rowDate || (rowDate >= fromDate && rowDate <= toDate)
        return matchesBank && matchesDate
      })
      .map((row) => {
        const mutasi = getNumber(row, ["totalBayar", "total_amount", "amount", "kredit", "debet"])
        const saldo = getNumber(row, ["saldo", "balance"]) || (runningSaldo += mutasi)

        return {
          tanggal: getString(row, ["tanggal", "date", "cash_date"], ""),
          nomor: getString(row, ["noPosting", "no_posting", "no_bukti", "number"]),
          keterangan: getString(row, ["keterangan", "description", "notes"]),
          klien: [row.kodeKlien ?? row.client_code, row.namaKlien ?? row.client_name]
            .filter(Boolean)
            .join(" ")
            .trim(),
          tagihan: getNumber(row, ["totalInvoice", "tagihan", "invoice_total"]),
          mutasi,
          saldo,
        }
      })
  }, [bankId, fromDate, reportData, toDate])

  const totalTagihan = rows.reduce((sum, row) => sum + row.tagihan, 0)
  const totalMutasi = rows.reduce((sum, row) => sum + row.mutasi, 0)
  const totalSaldo = rows[rows.length - 1]?.saldo ?? 0
  const bankName =
    String(report.bank_name ?? '') ||
    (bankId ? banks.find((bank) => String(bank.id) === bankId)?.name ?? bankId : 'SEMUA')
  const paymentCount = Number(report.payment_count ?? rows.length)
  const totalIn = Number(report.total_in ?? totalMutasi)

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
          <div className="text-red-600 font-semibold">Gagal memuat register kas/bank: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  const selectedBankName =
    bankId === ""
      ? "SEMUA"
      : banks.find((bank) => String(bank.id) === bankId)?.name ?? bankId

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={shellClass}>
      <div className="space-y-6">
      <h1 className="text-3xl font-bold">Register KAS/BANK</h1>

      <Card className="border-border/70 bg-card/70 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Tanggal Dari</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Tanggal Sampai</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Bank</label>
            <Select value={bankId} onValueChange={setBankId}>
              <SelectTrigger>
                <SelectValue placeholder="Semua bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua bank</SelectItem>
                {banks.map((bank) => {
                  const code = String(bank.id)
                  return (
                    <SelectItem key={bank.id ?? code} value={code}>
                      {bank.code} - {bank.name ?? "-"}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h2 className="font-semibold">REGISTER KAS/BANK</h2>
          <p className="text-sm text-muted-foreground">
            TANGGAL: {fromDate} S/D {toDate} | BANK: {selectedBankName}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TANGGAL</TableHead>
                <TableHead>NOMOR</TableHead>
                <TableHead>KETERANGAN</TableHead>
                <TableHead>KLIEN</TableHead>
                <TableHead className="text-right">TAGIHAN</TableHead>
                <TableHead className="text-right">MUTASI</TableHead>
                <TableHead className="text-right">SALDO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Belum ada data register untuk filter yang dipilih.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((tx, index) => (
                  <TableRow key={`${tx.nomor}-${index}`}>
                    <TableCell className="font-mono text-sm">{tx.tanggal || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.nomor}</TableCell>
                    <TableCell className="text-sm">{tx.keterangan}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.klien || "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{tx.tagihan.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{tx.mutasi.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">{tx.saldo.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={4}>TOTAL</TableCell>
                <TableCell className="text-right">{totalTagihan.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">{totalMutasi.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">{totalSaldo.toLocaleString("id-ID")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
      </div>
      </div>
    </div>
  )
}
