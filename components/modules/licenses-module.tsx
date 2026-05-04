'use client'

import { useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import type { Client } from '@/lib/api/types/clients'
import type { WorkOrder } from '@/lib/api/types/work-orders'
import type { License, CreateLicenseRequest, UpdateLicenseRequest } from '@/lib/api/types/licenses'
import {
  useClients,
  useWorkOrders,
  useLicenses,
  useLicenseDetail,
  useCreateLicense,
  useUpdateLicense,
  useDeleteLicense,
} from '@/lib/api/hooks'
import { LicenseForm } from '@/components/forms/license-form'

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

function normalizeStatus(status: string) {
  return String(status ?? '').trim().toLowerCase()
}

function isStatus(status: string, target: string) {
  return normalizeStatus(status) === target
}

function getStatusBadge(status: string) {
  switch (normalizeStatus(status)) {
    case 'paid':
      return <Badge className="bg-green-600">Paid</Badge>
    case 'unpaid':
      return <Badge className="bg-gray-600">Unpaid</Badge>
    case 'expired':
      return <Badge className="bg-orange-600">Expired</Badge>
    case 'stopped':
      return <Badge className="bg-red-600">Stopped</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function LicenseModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)

  const { data: licenses, loading, error, refetch } = useLicenses()
  const { data: clientsData } = useClients()
  const { data: workOrdersData } = useWorkOrders()
  const { data: detailData } = useLicenseDetail(selectedLicense?.id)
  const clients: Client[] = clientsData ?? []
  const workOrders: WorkOrder[] = workOrdersData ?? []

  const { mutate: createLicense, loading: createLoading, error: createError } = useCreateLicense()
  const { mutate: updateLicense, loading: updateLoading, error: updateError } = useUpdateLicense(
    selectedLicense?.id
  )
  const { mutate: deleteLicense, loading: deleteLoading } = useDeleteLicense()

  const filteredLicenses = licenses.filter((lic) => {
    const normalizedStatus = normalizeStatus(lic.status)
    const matchesSearch =
      lic.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.work_order?.number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateLicense = async (formData: CreateLicenseRequest) => {
    try {
      await createLicense(formData)
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateLicense = async (formData: CreateLicenseRequest | UpdateLicenseRequest) => {
    try {
      await updateLicense(formData)
      setIsEditDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteLicense = async () => {
    if (!selectedLicense) return
    try {
      await deleteLicense(selectedLicense.id)
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total Lisensi</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pencatatan lisensi</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Unpaid</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {licenses.filter((l) => isStatus(l.status, 'unpaid')).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Belum dibayar</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Paid</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {licenses.filter((l) => isStatus(l.status, 'paid')).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sudah dibayar</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total Nilai</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              Rp {licenses.reduce((sum, item) => sum + Number(item.total || 0), 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Akumulasi semua lisensi</p>
          </CardContent>
        </Card>
      </div>

      <div className={shellClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manajemen Lisensi</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Lisensi Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-2">
          <Input
            placeholder="Cari nomor lisensi, klien, atau work order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">No. Lisensi</th>
                <th className="px-4 py-3 text-left font-semibold">Klien</th>
                <th className="px-4 py-3 text-left font-semibold">Work Order</th>
                <th className="px-4 py-3 text-left font-semibold">Periode</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{item.license_number}</td>
                  <td className="px-4 py-3">{item.client?.code} - {item.client?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{item.work_order?.number || `WO #${item.work_order_id}`}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.license_date).toLocaleDateString('id-ID')} -{' '}
                    {new Date(item.due_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    Rp {Number(item.total || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLicense(item)
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
                          setSelectedLicense(item)
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

        {filteredLicenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada lisensi ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Buat Lisensi Baru</DialogTitle>
          </DialogHeader>
          <LicenseForm
            onSubmit={handleCreateLicense}
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
            <DialogTitle>Edit Lisensi</DialogTitle>
          </DialogHeader>
          {selectedLicense && (
            <LicenseForm
              license={detailData ?? selectedLicense}
              onSubmit={handleUpdateLicense}
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
          <AlertDialogTitle>Hapus Lisensi?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus lisensi:{' '}
            <strong>{selectedLicense?.license_number}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLicense}
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
