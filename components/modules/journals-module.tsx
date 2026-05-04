'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useJournals } from '@/lib/api/hooks'

function getNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function getString(value: unknown, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback
  return String(value)
}

export function JournalsModule() {
  const [page, setPage] = useState(1)
  const perPage = 50

  const { data, loading, error, refetch } = useJournals({ page, per_page: perPage })

  const rows = useMemo(() => data?.data ?? [], [data])
  const total = data?.total ?? 0
  const lastPage = data?.last_page ?? 1

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
          <div className="text-red-600 font-semibold">Gagal memuat jurnal: {error.message}</div>
          <Button onClick={refetch}>Coba Lagi</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Journals</h1>
        <p className="text-sm text-muted-foreground">Data dari endpoint {`/api/journals`} sesuai saved response Postman.</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-sm text-muted-foreground">
            Total: {total} | Page {data?.current_page ?? page} / {lastPage}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Prev
            </Button>
            <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((prev) => prev + 1)}>
              Next
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Tidak ada jurnal.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={`${getString(row.id ?? index)}`}>
                    <TableCell className="font-mono">{getString(row.number ?? row.no_journal ?? row.id, String(index + 1))}</TableCell>
                    <TableCell>{getString(row.date ?? row.journal_date, '-')}</TableCell>
                    <TableCell>{getString(row.description ?? row.notes, '-')}</TableCell>
                    <TableCell>{getString(row.source ?? row.reference_type, '-')}</TableCell>
                    <TableCell className="text-right font-mono">{getNumber(row.total_debit).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right font-mono">{getNumber(row.total_credit).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{getString(row.status, '-')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
