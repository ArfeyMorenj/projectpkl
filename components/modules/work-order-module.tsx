'use client'

import { useState } from 'react'
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Client } from '@/lib/api/types/clients'
import type { Product } from '@/lib/api/types/products'
import type { Item } from '@/lib/api/types/items'
import type { TeamMember } from '@/lib/api/types/team-members'
import type {
  WorkOrder,
  WorkOrderDetail,
  WorkOrderResponse,
} from '@/lib/api/types/work-orders'
import type { WorkOrderFormSubmitData } from '@/components/forms/work-order-form'
import {
  useAssignTeamToWorkOrder,
  useClients,
  useItems,
  useProducts,
  useTeamMembers,
  useWorkOrders,
  useWorkOrdersSearch,
  useWorkOrderDetail,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  useDeleteWorkOrder,
  useWorkOrderSummary,
} from '@/lib/api/hooks'
import { WorkOrderForm } from '@/components/forms/work-order-form'

interface WorkOrderFilters {
  status?: string
  from_date?: string
  to_date?: string
}

function getStatusBadge(status: string) {
  const normalized = String(status ?? '').toUpperCase()
  switch (normalized) {
    case 'AKTIF':
    case 'ACTIVE':
      return <Badge className="bg-green-600">Aktif</Badge>
    case 'DRAFT':
      return <Badge className="bg-gray-600">Draft</Badge>
    case 'SELESAI':
    case 'COMPLETED':
      return <Badge className="bg-blue-600">Selesai</Badge>
    case 'BATAL':
    case 'CANCELLED':
      return <Badge className="bg-red-600">Batal</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function getSummaryCount(byStatus: Record<string, number> | undefined, candidates: string[]) {
  if (!byStatus) return 0

  for (const candidate of candidates) {
    if (candidate in byStatus) return byStatus[candidate]
  }

  return Object.entries(byStatus).find(([key]) => candidates.includes(key.toUpperCase()))?.[1] ?? 0
}

function formatMoney(value: unknown) {
  return Number(value ?? 0).toLocaleString('id-ID')
}

type WorkOrderDisplayLike = Partial<WorkOrderDetail> &
  Partial<WorkOrderResponse> & {
    client?: { name?: string }
    product?: { name?: string }
    item?: { name?: string }
  }

function getClientLabel(wo: WorkOrderDisplayLike) {
  return wo.client?.name || wo.client_name || '-'
}

function getProductLabel(wo: WorkOrderDisplayLike) {
  return wo.product?.name || wo.product_name || '-'
}

function getItemLabel(wo: WorkOrderDisplayLike) {
  return wo.item?.name || wo.item_name || '-'
}

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

export function WorkOrderModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | WorkOrderResponse | null>(null)

  const filters: WorkOrderFilters = statusFilter === 'all' ? {} : { status: statusFilter }
  if (dateFromFilter) filters.from_date = dateFromFilter
  if (dateToFilter) filters.to_date = dateToFilter

  const { data: workOrders, loading, error, refetch } = useWorkOrders(filters)
  const { results: searchResults } = useWorkOrdersSearch(searchTerm)
  const { data: detailData } = useWorkOrderDetail(selectedWorkOrder?.id)
  const { data: summary, loading: summaryLoading } = useWorkOrderSummary(
    dateFromFilter || undefined,
    dateToFilter || undefined
  )
  const { data: clientsData } = useClients()
  const { data: productsData } = useProducts()
  const { data: itemsData } = useItems()
  const { data: teamMembersData } = useTeamMembers()

  const { mutate: createWorkOrder, loading: createLoading, error: createError } = useCreateWorkOrder()
  const { mutate: updateWorkOrder, loading: updateLoading, error: updateError } = useUpdateWorkOrder(
    selectedWorkOrder?.id
  )
  const { mutate: deleteWorkOrder, loading: deleteLoading } = useDeleteWorkOrder()
  const { mutate: assignTeamToWorkOrder, loading: assignLoading } = useAssignTeamToWorkOrder()

  const displayedWorkOrders: Array<WorkOrder | WorkOrderResponse> = searchTerm ? searchResults : workOrders

  const clients: Client[] = clientsData ?? []
  const products: Product[] = productsData ?? []
  const items: Item[] = itemsData ?? []
  const teamMembers: TeamMember[] = teamMembersData ?? []

  const handleCreateWorkOrder = async (formData: WorkOrderFormSubmitData) => {
    try {
      await createWorkOrder(formData)
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateWorkOrder = async (formData: WorkOrderFormSubmitData) => {
    try {
      const { team, ...updatePayload } = formData
      const updatedWorkOrder = await updateWorkOrder(updatePayload)
      if (team?.length) {
        await assignTeamToWorkOrder(updatedWorkOrder.id, team)
      }
      setIsEditDialogOpen(false)
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteWorkOrder = async () => {
    try {
      if (!selectedWorkOrder) return
      await deleteWorkOrder(selectedWorkOrder.id)
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

  const totalWorkOrders = summary?.total_work_orders ?? workOrders.length
  const activeCount = getSummaryCount(summary?.by_status, ['AKTIF', 'ACTIVE', 'aktif', 'active'])
  const cancelledCount = getSummaryCount(summary?.by_status, ['BATAL', 'CANCELLED', 'batal', 'cancelled'])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Total WO</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Work order tercatat</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Aktif</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Status AKTIF</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Batal</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Status batal</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitleUI className="text-sm font-medium text-foreground/75">Rata-rata</CardTitleUI>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              Rp {(summary?.average_cost || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per WO</p>
          </CardContent>
        </Card>
      </div>

      <div className={shellClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manajemen Work Order</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            WO Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-4">
          <Input
            placeholder="Cari nomor WO, klien, produk, atau item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="AKTIF">AKTIF</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="SELESAI">SELESAI</SelectItem>
              <SelectItem value="BATAL">BATAL</SelectItem>
              <SelectItem value="NON AKTIF">NON AKTIF</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFromFilter}
            onChange={(e) => setDateFromFilter(e.target.value)}
            placeholder="Dari Tanggal"
          />
          <Input
            type="date"
            value={dateToFilter}
            onChange={(e) => setDateToFilter(e.target.value)}
            placeholder="Sampai Tanggal"
          />
        </div>

        <div className="overflow-x-auto border border-border/70 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Nomor</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Klien</th>
                <th className="px-4 py-3 text-left font-semibold">Produk</th>
                <th className="px-4 py-3 text-left font-semibold">Item</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedWorkOrders.map((wo, idx) => (
                <tr key={wo.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{wo.number}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(wo.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{getClientLabel(wo)}</td>
                  <td className="px-4 py-3">{getProductLabel(wo)}</td>
                  <td className="px-4 py-3">{getItemLabel(wo)}</td>
                  <td className="px-4 py-3 text-right">Rp {formatMoney(wo.amount)}</td>
                  <td className="px-4 py-3">{getStatusBadge(wo.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWorkOrder(wo)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={updateLoading || assignLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedWorkOrder(wo)
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

        {displayedWorkOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada Work Order ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Buat Work Order Baru</DialogTitle>
          </DialogHeader>
          <WorkOrderForm
            onSubmit={handleCreateWorkOrder}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
            clients={clients}
            products={products}
            items={items}
            teamMembers={teamMembers}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto bg-card text-card-foreground border-border/70">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
          </DialogHeader>
          {selectedWorkOrder && (
            <WorkOrderForm
              workOrder={detailData ?? (selectedWorkOrder as WorkOrderDetail)}
              onSubmit={handleUpdateWorkOrder}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
              clients={clients}
              products={products}
              items={items}
              teamMembers={teamMembers}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Work Order?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus Work Order: <strong>{selectedWorkOrder?.number}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkOrder}
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
