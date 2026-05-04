'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useChartOfAccounts, useChartOfAccountsSearch } from '@/lib/api/hooks'
import type { ChartOfAccount } from '@/lib/api/types/master-data'
import { toBooleanFlag } from '@/lib/utils/boolean'

function formatStatus(status: string) {
  return status ? status.replace(/_/g, ' ') : '-'
}

function isAccountActive(account: ChartOfAccount) {
  return toBooleanFlag(account.status)
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function ChartOfAccountsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null)

  const { data: accountsData, loading, error, refetch } = useChartOfAccounts()
  const { results: searchResults, loading: searchLoading } = useChartOfAccountsSearch(searchTerm)

  const accounts = useMemo(() => accountsData ?? [], [accountsData])
  const displayedAccounts = searchTerm.trim().length >= 2 ? searchResults : accounts
  const isSearching = searchTerm.trim().length >= 2

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-10 w-full max-w-md" />
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
          <Button className="ml-4" size="sm" onClick={refetch}>
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className={shellClass}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chart of Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Daftar akun utama dari backend untuk lookup dan referensi setup.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            Total {accounts.length} akun
          </Badge>
        </div>

        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode atau nama akun..."
            className="pl-9"
          />
        </div>

        <div className="mt-6 space-y-4">
          {isSearching && searchLoading && (
            <div className="text-sm text-muted-foreground">Mencari akun...</div>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatStatus(account.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAccountActive(account) ? 'default' : 'secondary'}>
                        {isAccountActive(account) ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAccount(account)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {displayedAccounts.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              {isSearching
                ? 'Tidak ada chart of accounts yang cocok.'
                : 'Belum ada chart of accounts dari backend.'}
            </div>
          )}
        </div>
      </div>

      <Dialog open={Boolean(selectedAccount)} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <DialogContent className="max-w-xl bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Detail Chart of Accounts</DialogTitle>
            <DialogDescription>Informasi akun yang dipilih dari daftar backend.</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Kode</div>
                <div className="font-mono font-medium">{selectedAccount.code}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Nama Akun</div>
                <div className="font-medium">{selectedAccount.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Tipe</div>
                <div>{formatStatus(selectedAccount.type)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Status</div>
                <div>{isAccountActive(selectedAccount) ? 'Aktif' : 'Nonaktif'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Dibuat</div>
                <div>{selectedAccount.created_at}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Diubah</div>
                <div>{selectedAccount.updated_at}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

