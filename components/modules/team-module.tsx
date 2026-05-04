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
import { useTeamMembers, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember } from '@/lib/api/hooks'
import { TeamMemberForm } from '@/components/forms/team-member-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { TeamMember, CreateTeamMemberRequest } from '@/lib/api/types/team-members'
import { toBooleanFlag } from '@/lib/utils/boolean'
import { softDeletePersistedRow, upsertPersistedRow, usePersistedRows } from '@/lib/utils/persisted-rows'

export function TeamModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Fetch hooks
  const { data: membersData, loading, error, refetch } = useTeamMembers()

  // Mutation hooks
  const { mutate: createMember, loading: createLoading, error: createError } = useCreateTeamMember()
  const { mutate: updateMember, loading: updateLoading, error: updateError } = useUpdateTeamMember(selectedMember?.id)
  const { mutate: deleteMember, loading: deleteLoading } = useDeleteTeamMember()

  const { rows: members, setRows: setMembers } = usePersistedRows<TeamMember>(
    'fitart_team_members_rows',
    membersData
  )
  const displayedMembers =
    searchTerm.trim().length >= 2
      ? members.filter((member) =>
          [member.code, member.name, member.position, member.status]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : members
  const isMemberActive = (member: TeamMember) => toBooleanFlag(member.is_active)

  const handleCreateMember = async (formData: CreateTeamMemberRequest) => {
    try {
      const createdMember = await createMember(formData)
      setMembers((current) => upsertPersistedRow(current, createdMember))
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Create failed:', err)
    }
  }

  const handleUpdateMember = async (formData: CreateTeamMemberRequest) => {
    try {
      const updatedMember = await updateMember(formData)
      setMembers((current) => upsertPersistedRow(current, updatedMember))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDeleteMember = async () => {
    if (!selectedMember) return
    try {
      await deleteMember(selectedMember.id)
      setMembers((current) => softDeletePersistedRow(current, selectedMember.id))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
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
  if (!members.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Tidak ada data anggota tim</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Anggota Tim
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Manajemen Anggota Tim</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Cari berdasarkan kode, nama, atau posisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Posisi</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Status Aktif</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedMembers.map((member, idx) => (
                <tr key={member.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{member.code}</td>
                  <td className="px-4 py-3 font-semibold">{member.name}</td>
                  <td className="px-4 py-3">{member.position || '-'}</td>
                  <td className="px-4 py-3">{member.status || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isMemberActive(member) ? 'default' : 'secondary'}>
                      {isMemberActive(member) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member)
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
                          setSelectedMember(member)
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

        {displayedMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada anggota tim ditemukan</div>
        )}

        {/* Total */}
        <div className="mt-4 text-sm text-foreground/75">Total: {displayedMembers.length} anggota</div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim Baru</DialogTitle>
          </DialogHeader>
          <TeamMemberForm
            onSubmit={handleCreateMember}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Anggota Tim</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <TeamMemberForm
              member={selectedMember}
              onSubmit={handleUpdateMember}
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
          <AlertDialogTitle>Hapus Anggota Tim?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus anggota tim: <strong>{selectedMember?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

