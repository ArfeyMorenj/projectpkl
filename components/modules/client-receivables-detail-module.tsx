"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReceivableDetailReport } from "@/lib/api/hooks"

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

function extractObject(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return {}
  return value as ReportRow
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

type DetailRow = {
  tanggal: string
  nomor: string
  keterangan: string
  tagihan: number
  pembayaran: number
  saldo: number
}

export function ClientReceivablesDetailModule() {
  const [fromDate, setFromDate] = useState("2025-09-01")
  const [toDate, setToDate] = useState("2025-10-31")

  const { data: reportData, loading, error, refetch } = useReceivableDetailReport({
    from: fromDate,
    to: toDate,
  })

  const report = extractObject(reportData)
  const reportMeta = extractObject(report.report)
  const reportTotals = extractObject(report.totals)

  const detailRows = useMemo<DetailRow[]>(() => {
    const apiRows = extractRows(reportData)

    return apiRows.map((row) => ({
      tanggal: getString(row, ["tanggal", "date", "invoice_date", "transaction_date"], ""),
      nomor: getString(row, ["noInvoice", "no_invoice", "noBukti", "no_bukti", "invoice_number"]),
      keterangan: getString(row, ["keterangan", "description", "notes", "client_name"]),
      tagihan: getNumber(row, ["tagihan", "total", "total_amount", "amount"]),
      pembayaran: getNumber(row, ["pembayaran", "paid_amount", "payment"]),
      saldo: getNumber(row, ["saldo", "outstanding_amount", "remaining"]),
    }))
  }, [reportData])

  const totalTagihan = detailRows.reduce((sum, row) => sum + row.tagihan, 0)
  const totalBayar = detailRows.reduce((sum, row) => sum + row.pembayaran, 0)
  const totalSaldo = detailRows.reduce((sum, row) => sum + row.saldo, 0)

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
          <div className="text-red-600 font-semibold">Gagal memuat detail piutang klien: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Detail Piutang Klien</h1>

      <Card className="p-6">
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">Periode Dari</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Periode Sampai</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mb-4 rounded bg-muted p-3">
          <p className="text-sm">
            <strong>{String(reportMeta.title ?? "LAPORAN DETAIL PIUTANG KLIEN")}</strong>
            <br />
            PERIODE: {String((reportMeta.period as Record<string, unknown> | undefined)?.from ?? fromDate)} S/D {String(
              (reportMeta.period as Record<string, unknown> | undefined)?.to ?? toDate
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Tagihan</p>
            <p className="text-xl font-bold">Rp {Number(reportTotals.tagihan ?? totalTagihan).toLocaleString("id-ID")}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Pembayaran</p>
            <p className="text-xl font-bold">Rp {Number(reportTotals.jumlah ?? totalBayar).toLocaleString("id-ID")}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Nota DK</p>
            <p className="text-xl font-bold">Rp {Number(reportTotals.nota_dk ?? 0).toLocaleString("id-ID")}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Saldo Akhir</p>
            <p className="text-xl font-bold">Rp {Number(reportTotals.saldo ?? totalSaldo).toLocaleString("id-ID")}</p>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TANGGAL</TableHead>
                <TableHead>NOMOR</TableHead>
                <TableHead>KETERANGAN</TableHead>
                <TableHead className="text-right">TAGIHAN</TableHead>
                <TableHead className="text-right">PEMBAYARAN</TableHead>
                <TableHead className="text-right">SALDO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Belum ada data piutang untuk filter yang dipilih.
                  </TableCell>
                </TableRow>
              ) : (
                detailRows.map((item) => (
                  <TableRow key={`${item.nomor}-${item.tanggal}`}>
                    <TableCell className="font-mono text-sm">{item.tanggal || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{item.nomor}</TableCell>
                    <TableCell className="text-sm">{item.keterangan}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{item.tagihan.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{item.pembayaran.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">{item.saldo.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell className="text-right">{totalTagihan.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">{totalBayar.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">{totalSaldo.toLocaleString("id-ID")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
