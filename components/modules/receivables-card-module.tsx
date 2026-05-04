"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReceivableDetailReport, useReceivableSummaryReport } from "@/lib/api/hooks"

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

type Row = { tgl: string; noBukti: string; keterangan: string; debet: number; kredit: number; sisa: number }

export function ReceivablesCardModule() {
  const [fromDate, setFromDate] = useState("2025-07-01")
  const [toDate, setToDate] = useState("2025-10-31")

  const { data: detailData, loading: detailLoading, error: detailError, refetch: refetchDetail } = useReceivableDetailReport({
    from: fromDate,
    to: toDate,
  })
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useReceivableSummaryReport()

  const rows = useMemo<Row[]>(() => {
    const apiRows = extractRows(detailData)

    return apiRows.map((row) => ({
      tgl: String(row.tgl ?? row.date ?? row.transaction_date ?? row.invoice_date ?? ""),
      noBukti: String(row.noBukti ?? row.no_bukti ?? row.no_invoice ?? row.noPosting ?? row.no_posting ?? row.invoice_number ?? ""),
      keterangan: String(row.keterangan ?? row.description ?? row.notes ?? row.client_name ?? ""),
      debet: Number(row.debet ?? row.debit ?? row.tagihan ?? row.amount ?? 0),
      kredit: Number(row.kredit ?? row.credit ?? row.pembayaran ?? row.paid_amount ?? 0),
      sisa: Number(row.sisa ?? row.outstanding ?? row.outstanding_amount ?? 0),
    }))
  }, [detailData])

  const summary = extractObject(summaryData)
  const summaryReport = extractObject(summary.report)
  const summaryTotals = extractObject(summary.summary)

  const totals = rows.reduce(
    (acc, row) => ({
      debet: acc.debet + row.debet,
      kredit: acc.kredit + row.kredit,
    }),
    { debet: 0, kredit: 0 }
  )

  const cards = [
    {
      label: "Total Piutang",
      value: Number(summaryTotals.saldo_akhir ?? summary.total_amount ?? totals.debet ?? 0),
      tone: "blue",
    },
    {
      label: "Sudah Dibayar",
      value: Number(summaryTotals.pembayaran ?? summary.total_paid ?? totals.kredit ?? 0),
      tone: "green",
    },
    {
      label: "Sisa Piutang",
      value: Number(summaryTotals.saldo_akhir ?? summary.total_outstanding ?? Math.max((totals.debet ?? 0) - (totals.kredit ?? 0), 0)),
      tone: "red",
    },
    {
      label: "Jatuh Tempo 90+",
      value: Number(summary.days_over_90 ?? 0),
      tone: "amber",
    },
  ]

  if (detailLoading || summaryLoading) {
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

  const activeError = detailError ?? summaryError
  if (activeError) {
    return (
      <div className="p-6">
        <Card className="p-6 space-y-3">
          <div className="text-red-600 font-semibold">Gagal memuat kartu piutang: {activeError.message}</div>
          <Button
            onClick={() => {
              void refetchDetail()
              void refetchSummary()
            }}
          >
            Coba Lagi
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kartu Piutang</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <div
              className={`mt-2 text-2xl font-bold ${
                card.tone === "red" ? "text-red-600" : card.tone === "green" ? "text-green-600" : card.tone === "amber" ? "text-amber-600" : "text-foreground"
              }`}
            >
              Rp {card.value.toLocaleString("id-ID")}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="mb-2 font-semibold">{String(summaryReport.title ?? "KARTU PIUTANG")}</h2>
          <p className="text-sm text-muted-foreground">
            PERIODE: {String(summaryReport.period ?? `${fromDate} S/D ${toDate}`)}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Dari Tanggal</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">S/D Tanggal</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Ringkasan</label>
            <Input type="text" value={String(summaryTotals.saldo_akhir ?? 0)} readOnly />
          </div>
          <div className="flex items-end gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                void refetchDetail()
                void refetchSummary()
              }}
            >
              Preview
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Close
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TGL</TableHead>
                <TableHead>NO. BUKTI</TableHead>
                <TableHead>KETERANGAN</TableHead>
                <TableHead className="text-right">DEBET</TableHead>
                <TableHead className="text-right">KREDIT</TableHead>
                <TableHead className="text-right">SISA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Belum ada data untuk filter yang dipilih.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((tx, idx) => (
                  <TableRow key={`${tx.noBukti}-${idx}`}>
                    <TableCell className="font-mono text-sm">{tx.tgl || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.noBukti || "-"}</TableCell>
                    <TableCell className="text-sm">{tx.keterangan || "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{tx.debet.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{tx.kredit.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">{tx.sisa.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell className="text-right">{totals.debet.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">{totals.kredit.toLocaleString("id-ID")}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
