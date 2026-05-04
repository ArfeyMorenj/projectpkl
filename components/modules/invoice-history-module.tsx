'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useInvoiceHistoryReport } from '@/lib/api/hooks'

type HistoryPosting = Record<string, unknown>
type HistoryData = {
  invoice: Record<string, unknown> | null
  postings: HistoryPosting[]
  report: Record<string, unknown> | null
}

function extractHistoryData(reportData: unknown): HistoryData {
  if (!reportData) return { invoice: null, postings: [], report: null }
  if (Array.isArray(reportData)) return { invoice: (reportData[0] as Record<string, unknown>) ?? null, postings: reportData as HistoryPosting[], report: null }
  const payload = reportData as { rows?: unknown; data?: unknown; invoice?: unknown; header?: unknown; postings?: unknown }
  if (Array.isArray(payload.rows)) return { invoice: (payload.invoice as Record<string, unknown>) ?? (payload.header as Record<string, unknown>) ?? null, postings: payload.rows as HistoryPosting[], report: (payload as { report?: Record<string, unknown> }).report ?? null }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    const data = payload.data as { invoice?: unknown; postings?: unknown; report?: unknown; header?: unknown }
    const invoice = (data.invoice as Record<string, unknown>) ?? (data.header as Record<string, unknown>) ?? null
    const postings = Array.isArray(data.postings) ? (data.postings as HistoryPosting[]) : []
    return {
      invoice,
      postings,
      report: (data.report as Record<string, unknown>) ?? (payload as { report?: Record<string, unknown> }).report ?? null,
    }
  }
  return {
    invoice: (payload.invoice as Record<string, unknown>) ?? (payload.header as Record<string, unknown>) ?? (reportData as Record<string, unknown>),
    postings: Array.isArray(payload.postings) ? (payload.postings as HistoryPosting[]) : [],
    report: (payload as { report?: Record<string, unknown> }).report ?? null,
  }
}

function getString(row: Record<string, unknown> | null, keys: string[], fallback = '-') {
  if (!row) return fallback
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return fallback
}

export function InvoiceHistoryModule() {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [submittedInvoice, setSubmittedInvoice] = useState('')

  const { data: reportData, loading, error, refetch } = useInvoiceHistoryReport(
    submittedInvoice ? { number: submittedInvoice } : undefined
  )

  const history = useMemo(() => extractHistoryData(reportData), [reportData])
  const invoice = history.invoice
  const postings = history?.postings ?? []
  const report = history.report

  const paid = postings.reduce(
    (sum, posting) => sum + Number(posting.totalBayar ?? posting.amount ?? 0),
    0
  )
  const total = Number(invoice?.total ?? invoice?.total_amount ?? 0)
  const remaining = total - paid

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
          <div className="text-red-600 font-semibold">Gagal memuat historis invoice: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Historis Invoice</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">No. Invoice</label>
            <Input
              type="text"
              placeholder="Contoh: 001/S04/LP/1025"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setSubmittedInvoice(invoiceNumber.trim())}
              variant="default"
              disabled={!invoiceNumber.trim()}
            >
              Preview
            </Button>
            <Button
              onClick={() => {
                setSubmittedInvoice('')
                setInvoiceNumber('')
              }}
              variant="outline"
            >
              Close
            </Button>
          </div>

          {submittedInvoice && (
            <div className="mt-6 rounded-lg border bg-muted p-4">
              {invoice ? (
                <div className="space-y-4">
                  <div className="mb-2 text-sm text-muted-foreground">
                    {String(report?.title ?? 'HISTORIS INVOICE')} | Invoice {String(report?.invoice_number ?? submittedInvoice)}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice Number</p>
                      <p className="font-semibold">{getString(invoice, ['noInvoice', 'no_invoice', 'invoice_number', 'number'], submittedInvoice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className={`font-semibold ${remaining <= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {remaining <= 0 ? 'LUNAS' : 'BELUM LUNAS'}
                      </p>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Field</th>
                        <th className="py-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Tanggal Invoice</td>
                        <td>{getString(invoice, ['tanggal', 'invoice_date'])}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Klien</td>
                        <td>
                          {getString(
                            invoice,
                            ['namaKlien', 'client_name'],
                            invoice?.client && typeof invoice.client === 'object' && !Array.isArray(invoice.client)
                              ? String((invoice.client as { name?: unknown }).name ?? '-')
                              : '-'
                          )}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Total Invoice</td>
                        <td>{total.toLocaleString('id-ID')}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Sudah Dibayar</td>
                        <td>{paid.toLocaleString('id-ID')}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Sisa</td>
                        <td>{remaining.toLocaleString('id-ID')}</td>
                      </tr>
                    </tbody>
                  </table>

                  {postings.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Riwayat Posting Pembayaran</p>
                      <div className="overflow-x-auto rounded border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-background">
                              <th className="p-2 text-left">No Posting</th>
                              <th className="p-2 text-left">Tanggal</th>
                              <th className="p-2 text-right">Nominal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {postings.map((posting, index) => (
                              <tr key={`${String(posting.noPosting ?? posting.no_posting ?? index)}`} className="border-b">
                                <td className="p-2">{String(posting.noPosting ?? posting.no_posting ?? '-')}</td>
                                <td className="p-2">{String(posting.tanggal ?? posting.posting_date ?? '-')}</td>
                                <td className="p-2 text-right">
                                  {Number(posting.totalBayar ?? posting.amount ?? 0).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Invoice tidak ditemukan.</p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
