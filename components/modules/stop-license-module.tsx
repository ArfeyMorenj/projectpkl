'use client'

import { useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardHeader, CardTitle as CardTitleUI } from '@/components/ui/card'
import type { WorkOrder } from '@/lib/api/types/work-orders'
import type { TeamMember } from '@/lib/api/types/team-members'
import type { StopLicense } from '@/lib/api/types/stop-licenses'
import {
  useWorkOrders,
  useTeamMembers,
  useStopLicenses,
  useStopLicensesSearch,
  useStopLicenseDetail,
  useCreateStopLicense,
  useUpdateStopLicense,
  useDeleteStopLicense,
} from '@/lib/api/hooks'
import { StopLicenseForm, type StopLicenseFormSubmitData } from '@/components/forms/stop-license-form'
import { toBooleanFlag } from '@/lib/utils/boolean'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function getStatusBadge(isStopped: boolean) {
  return isStopped ? <Badge className="bg-red-600">Stopped</Badge> : <Badge className="bg-green-600">Open</Badge>
}

function isLicenseStopped(stopLicense: StopLicense) {
  return toBooleanFlag(stopLicense.is_stopped)
}

export function StopLicenseModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStopLicense, setSelectedStopLicense] = useState<StopLicense | null>(null)

  const { data: stopLicenses, loading, error, refetch } = useStopLicenses()
  const { results: searchResults } = useStopLicensesSearch(searchTerm)
  const { data: detailData } = useStopLicenseDetail(selectedStopLicense?.id)
  const { data: workOrdersData } = useWorkOrders()
  const { data: teamMembersData } = useTeamMembers()
  const workOrders: WorkOrder[] = workOrdersData ?? []
  const teamMembers: TeamMember[] = teamMembersData ?? []

  const { mutate: createStopLicense, loading: createLoading, error: createError } = useCreateStopLicense()
  const { mutate: updateStopLicense, loading: updateLoading, error: updateError } = useUpdateStopLicense(
    selectedStopLicense?.id
  )
  const { mutate: deleteStopLicense, loading: deleteLoading } = useDeleteStopLicense()

  const displayedStopLicenses = searchTerm ? searchResults : stopLicenses

  const handleCreateStopLicense = async (formData: StopLicenseFormSubmitData) => {
    try {
      await createStopLicense(formData)
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateStopLicense = async (formData: StopLicenseFormSubmitData) => {
    try {
      await updateStopLicense(formData)
      setIsEditDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteStopLicense = async () => {
    if (!selectedStopLicense) return
    try {
      await deleteStopLicense(selectedStopLicense.id)
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total Stop</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stopLicenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pencatatan stop license</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Work Orders</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Data work order tersedia</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">SPV</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Team member tersedia</p>
          </CardContent>
        </Card>
      </div>

      <div className={shellClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manajemen Henti Lisensi</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Henti Lisensi Baru
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Cari nomor stop license atau work order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Nomor</th>
                <th className="px-4 py-3 text-left font-semibold">Work Order</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal Stop</th>
                <th className="px-4 py-3 text-left font-semibold">SPV</th>
                <th className="px-4 py-3 text-left font-semibold">Catatan</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedStopLicenses.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{item.number}</td>
                  <td className="px-4 py-3">{item.work_order?.number || `WO #${item.work_order_id}`}</td>
                  <td className="px-4 py-3 text-sm">{new Date(item.stop_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">
                    {item.client_spv?.code || item.client_spv_code || '-'} {item.client_spv?.name ? `- ${item.client_spv.name}` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm truncate max-w-xs">{item.notes || '-'}</td>
                  <td className="px-4 py-3">{getStatusBadge(isLicenseStopped(item))}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStopLicense(item)
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
                          setSelectedStopLicense(item)
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

        {displayedStopLicenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada henti lisensi ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Buat Henti Lisensi Baru</DialogTitle>
          </DialogHeader>
          <StopLicenseForm
            onSubmit={handleCreateStopLicense}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
            workOrders={workOrders}
            teamMembers={teamMembers}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Henti Lisensi</DialogTitle>
          </DialogHeader>
          {selectedStopLicense && (
            <StopLicenseForm
              stopLicense={detailData ?? selectedStopLicense}
              onSubmit={handleUpdateStopLicense}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
              workOrders={workOrders}
              teamMembers={teamMembers}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Henti Lisensi?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus henti lisensi:{' '}
            <strong>{selectedStopLicense?.number}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStopLicense}
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
