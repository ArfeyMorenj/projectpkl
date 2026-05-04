'use client'

import { useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle as CardTitleUI } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { Client } from '@/lib/api/types/clients'
import type { WorkOrder } from '@/lib/api/types/work-orders'
import type { Installation } from '@/lib/api/types/installations'
import {
  useClients,
  useWorkOrders,
  useInstallations,
  useInstallationDetail,
  useCreateInstallation,
  useUpdateInstallation,
  useDeleteInstallation,
} from '@/lib/api/hooks'
import { InstallationForm, type InstallationFormSubmitData } from '@/components/forms/installation-form'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function getWorkOrderLabel(item: Installation) {
  return item.work_order?.number || `WO #${item.work_order_id}`
}

function getClientLabel(item: Installation) {
  return item.client?.name || `Client #${item.client_id}`
}

export function InstallationModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null)

  const { data: installations, loading, error, refetch } = useInstallations()
  const { data: clientsData } = useClients()
  const { data: workOrdersData } = useWorkOrders()
  const { data: detailData } = useInstallationDetail(selectedInstallation?.id)

  const clients: Client[] = clientsData ?? []
  const workOrders: WorkOrder[] = workOrdersData ?? []

  const { mutate: createInstallation, loading: createLoading, error: createError } = useCreateInstallation()
  const { mutate: updateInstallation, loading: updateLoading, error: updateError } = useUpdateInstallation(
    selectedInstallation?.id
  )
  const { mutate: deleteInstallation, loading: deleteLoading } = useDeleteInstallation()

  const filteredInstallations = installations.filter((inst) => {
    const query = searchTerm.toLowerCase()
    return (
      getWorkOrderLabel(inst).toLowerCase().includes(query) ||
      getClientLabel(inst).toLowerCase().includes(query) ||
      inst.install_date.toLowerCase().includes(query) ||
      (inst.notes || '').toLowerCase().includes(query)
    )
  })

  const handleCreateInstallation = async (formData: InstallationFormSubmitData) => {
    try {
      await createInstallation(formData)
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateInstallation = async (formData: InstallationFormSubmitData) => {
    try {
      await updateInstallation(formData)
      setIsEditDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteInstallation = async () => {
    if (!selectedInstallation) return
    try {
      await deleteInstallation(selectedInstallation.id)
      setIsDeleteDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className={shellClass}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
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
          <Button className="ml-2" onClick={refetch} size="sm">
            Coba Lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total Instalasi</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{installations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pencatatan instalasi</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Klien</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Data klien tersedia</p>
          </CardContent>
        </Card>
      </div>

      <div className={shellClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manajemen Instalasi</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Instalasi Baru
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Cari work order, klien, atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Work Order</th>
                <th className="px-4 py-3 text-left font-semibold">Klien</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Implementor</th>
                <th className="px-4 py-3 text-left font-semibold">Catatan</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstallations.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{getWorkOrderLabel(item)}</td>
                  <td className="px-4 py-3">{getClientLabel(item)}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.install_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {[item.implementor_1, item.implementor_2, item.implementor_3].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm truncate max-w-xs">{item.notes || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInstallation(item)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedInstallation(item)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={deleteLoading}
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

        {filteredInstallations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada instalasi ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Buat Instalasi Baru</DialogTitle>
          </DialogHeader>
          <InstallationForm
            onSubmit={handleCreateInstallation}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
            clients={clients}
            workOrders={workOrders}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Instalasi</DialogTitle>
          </DialogHeader>
          {selectedInstallation && (
            <InstallationForm
              installation={detailData ?? selectedInstallation}
              onSubmit={handleUpdateInstallation}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
              clients={clients}
              workOrders={workOrders}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Instalasi?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus instalasi:{' '}
            <strong>{selectedInstallation ? getWorkOrderLabel(selectedInstallation) : '-'}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInstallation}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
