'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/lib/api/hooks'
import { ClientForm } from '@/components/forms/client-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Client, CreateClientRequest } from '@/lib/api/types/clients'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function ClientsModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Fetch hooks
  const { data: clientsData, loading, error, refetch } = useClients()

  // Mutation hooks
  const { mutate: createClient, loading: createLoading, error: createError } = useCreateClient()
  const { mutate: updateClient, loading: updateLoading, error: updateError } = useUpdateClient(selectedClient?.id)
  const { mutate: deleteClient, loading: deleteLoading } = useDeleteClient()

  const { rows: clients, setRows: setClients } = usePersistedRows<Client>('fitart_clients_rows', clientsData)
  const displayedClients =
    searchTerm.trim().length >= 2
      ? clients.filter((client) =>
          [client.code, client.name, client.status, client.city, client.phone, client.tax_name]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : clients
  const isClientActive = (client: Client) => toBooleanFlag(client.is_active)

  const handleCreateClient = async (formData: CreateClientRequest) => {
    try {
      const createdClient = await createClient(formData)
      setClients((current) => upsertPersistedRow(current, createdClient))
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateClient = async (formData: CreateClientRequest) => {
    try {
      const updatedClient = await updateClient(formData)
      setClients((current) => upsertPersistedRow(current, updatedClient))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return
    try {
      await deleteClient(selectedClient.id)
      setClients((current) => softDeletePersistedRow(current, selectedClient.id))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
          <Button className="ml-2" onClick={refetch} size="sm">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (!clients.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Tidak ada data klien</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Klien
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={shellClass}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Manajemen Klien</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Klien
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Cari berdasarkan nama atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Kota</th>
                <th className="px-4 py-3 text-left font-semibold">Telepon</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedClients.map((client, idx) => (
                <tr key={client.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{client.code}</td>
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.city || '-'}</td>
                  <td className="px-4 py-3">{client.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isClientActive(client) ? 'default' : 'secondary'}>
                      {isClientActive(client) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedClient(client)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading || deleteLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedClient(client)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={deleteLoading || updateLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedClients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada klien ditemukan</div>
        )}

        {/* Total */}
        <div className="mt-4 text-sm text-foreground/75">Total: {displayedClients.length} klien</div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Tambah Klien Baru</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreateClient}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Klien</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              client={selectedClient}
              onSubmit={handleUpdateClient}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Klien?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus klien: <strong>{selectedClient?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

