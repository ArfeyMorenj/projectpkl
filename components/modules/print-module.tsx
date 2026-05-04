'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchInvoicePdf, fetchReceiptPdf, useInvoiceBatchPrint, useQueueInvoiceBatchPrint } from '@/lib/api/hooks'

type BatchRow = Record<string, unknown>

function getString(row: BatchRow, keys: string[], fallback = '-') {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return fallback
}

function getNumber(row: BatchRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && value !== '') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function PrintModule() {
  const [dateFrom, setDateFrom] = useState('2026-03-01')
  const [dateTo, setDateTo] = useState('2026-03-31')
  const [receiptId, setReceiptId] = useState('1')
  const [queuedResult, setQueuedResult] = useState<{ count: number; invoices: Array<{ invoice_id: number; number: string; client_name: string; pdf_url?: string }> } | null>(null)

  const { data, loading, error, refetch } = useInvoiceBatchPrint({ date_from: dateFrom, date_to: dateTo })
  const { mutate: queueBatch, loading: queueLoading } = useQueueInvoiceBatchPrint()

  const rows = useMemo(() => data?.data ?? [], [data])

  const handleDownloadInvoice = async (invoiceId: number, number: string) => {
    const blob = await fetchInvoicePdf(invoiceId)
    downloadBlob(blob, `${number}.pdf`)
  }

  const handleDownloadReceipt = async (id: string = receiptId) => {
    const blob = await fetchReceiptPdf(id)
    downloadBlob(blob, `receipt-${id}.pdf`)
  }

  const handleQueueBatch = async () => {
    const result = await queueBatch({ date_from: dateFrom, date_to: dateTo })
    setQueuedResult(result.data)
  }

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
          <div className="text-red-600 font-semibold">Gagal memuat data print: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className={shellClass}>
        <div>
          <h1 className="text-3xl font-bold">Print Center</h1>
          <p className="text-sm text-muted-foreground">Batch invoice dan PDF download dari endpoint print backend.</p>
        </div>

        <div className="mt-6 space-y-6">
      <Card className="border-border/70 bg-card/70">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button className="w-full" onClick={() => void handleQueueBatch()} disabled={queueLoading}>
              Queue Batch
            </Button>
          </div>
        </div>
        {queuedResult && (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-sm">
            <div className="font-semibold">Batch print queue prepared ({queuedResult.count})</div>
            <div className="mt-2 space-y-1">
              {queuedResult.invoices.map((invoice) => (
                <div key={invoice.invoice_id} className="flex items-center justify-between gap-3">
                  <span className="font-mono">{invoice.number}</span>
                  <span className="text-muted-foreground">{invoice.client_name}</span>
                  <Button size="sm" variant="outline" onClick={() => void handleDownloadInvoice(invoice.invoice_id, invoice.number)}>
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="border-border/70 bg-card/70">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Total invoice: {data?.total ?? rows.length}
          </div>
          <Button variant="outline" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Tidak ada invoice untuk batch print.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={`${getString(row, ['number'], String(index))}-${index}`}>
                    <TableCell className="font-mono">{getString(row, ['number'])}</TableCell>
                    <TableCell>{getString(row, ['date'])}</TableCell>
                    <TableCell>{getString(row, ['client_name'])}</TableCell>
                    <TableCell>{getString(row, ['invoice_type'])}</TableCell>
                    <TableCell className="text-right">{getNumber(row, ['amount']).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-mono text-xs">{getString(row, ['pdf_url'])}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDownloadInvoice(Number(row.invoice_id), getString(row, ['number'], `invoice-${index}`))}
                        >
                          PDF Invoice
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        onClick={() => void handleDownloadReceipt(receiptId)}
                        >
                          Receipt
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Receipt ID</label>
            <Input value={receiptId} onChange={(e) => setReceiptId(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void handleDownloadReceipt()}>
              Download Receipt PDF
            </Button>
          </div>
        </div>
      </Card>
        </div>
      </div>
    </div>
  )
}
