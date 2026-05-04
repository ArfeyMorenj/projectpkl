'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGenerateRecurringInvoices } from '@/lib/api/hooks'
import type { GenerateRecurringInvoicesResponse } from '@/lib/api/types/recurring'
import { toBooleanFlag } from '@/lib/utils/boolean'

function getString(value: unknown, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback
  return String(value)
}

function getNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

type RecurringCreatedInvoice = GenerateRecurringInvoicesResponse['created'][number]

function getClientLabel(invoice: RecurringCreatedInvoice) {
  return invoice.client?.name ?? `Client #${invoice.client_id}`
}

function getWorkOrderLabel(invoice: RecurringCreatedInvoice) {
  return invoice.work_order?.number ?? `WO #${invoice.work_order_id}`
}

export function RecurringModule() {
  const [period, setPeriod] = useState('2026-04')
  const { mutate, loading, data, error } = useGenerateRecurringInvoices()

  const created = useMemo(() => data?.created ?? [], [data])

  const handleGenerate = async () => {
    await mutate({ period })
  }

  if (loading && !data) {
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recurring Invoices</h1>
        <p className="text-sm text-muted-foreground">Generate invoice berulang dari endpoint /api/recurring/invoices/generate.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Period</label>
            <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void handleGenerate()} disabled={loading}>
              Generate
            </Button>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">Gagal generate: {error.message}</div>}
        {data && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded border p-4">
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-2xl font-bold">{data.created_count}</div>
            </div>
            <div className="rounded border p-4">
              <div className="text-xs text-muted-foreground">Skipped</div>
              <div className="text-2xl font-bold">{data.skipped_count}</div>
            </div>
            <div className="rounded border p-4">
              <div className="text-xs text-muted-foreground">Period</div>
              <div className="text-2xl font-bold">{data.period}</div>
            </div>
          </div>
        )}
      </Card>

      {created.length > 0 && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead className="text-right">DPP</TableHead>
                  <TableHead className="text-right">PPN</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {created.map((invoice, index) => (
                  <TableRow key={`${invoice.id}-${index}`}>
                    <TableCell className="font-mono">{invoice.number}</TableCell>
                    <TableCell>{getClientLabel(invoice)}</TableCell>
                    <TableCell>{getWorkOrderLabel(invoice)}</TableCell>
                    <TableCell className="text-right">{getNumber(invoice.dpp).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(invoice.ppn).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{getNumber(invoice.total).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{toBooleanFlag(invoice.is_posted) ? 'POSTED' : 'DRAFT'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
