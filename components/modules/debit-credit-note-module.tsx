'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Eye, Edit2, Trash2, Plus } from 'lucide-react'
import { DebitCreditNoteForm, type DebitCreditNoteFormSubmitData } from '@/components/forms/debit-credit-note-form'
import {
  useDebitCreditNotes,
  useDebitCreditNoteDetail,
  useCreateDebitCreditNote,
  useUpdateDebitCreditNote,
  useDeleteDebitCreditNote,
  useDebitCreditNotesSearch,
} from '@/lib/api/hooks'
import type { DebitCreditNoteDetail, DebitCreditNoteListRow } from '@/lib/api/types/debit-credit-notes'
import { toBooleanFlag } from '@/lib/utils/boolean'

function toEditFormNote(
  detail: DebitCreditNoteDetail | null,
  fallback: DebitCreditNoteListRow | null
) {
  if (detail) {
    return {
      id: detail.header.id,
      type: detail.header.jenis,
      number: detail.header.number,
      date: detail.header.date,
      client_id: undefined,
      invoice_id: undefined,
      description: detail.header.description,
      auto_journal: detail.header.auto_journal,
      items: detail.items?.map((item) => ({
        sequence: item.sequence,
        item_code: item.item_code,
        item_name: item.item_name,
        dpp_amount: item.dpp_nota ?? item.dpp_amount ?? 0,
        ppn_amount: item.ppn_nota ?? item.ppn_amount ?? 0,
      })),
    }
  }

  return fallback
}

export function DebitCreditNoteModule() {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    number: '',
    date_from: '',
    date_to: '',
    type: '', // 'D', 'K', or ''
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [mode, setMode] = useState<'list' | 'detail'>('list')
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
  const [editingNote, setEditingNote] = useState<DebitCreditNoteListRow | null>(null)

  // Fetch list
  const { data: notes, loading: notesLoading, error: notesError, refetch } = useDebitCreditNotes(
    filters
  )

  // Fetch detail
  const {
    data: selectedNote,
    loading: detailLoading,
    error: detailError,
  } = useDebitCreditNoteDetail(selectedNoteId || undefined)

  // Search
  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useDebitCreditNotesSearch({
    q: debouncedQuery,
  })

  // Mutations
  const { mutate: createNote, loading: createLoading, error: createError } = useCreateDebitCreditNote()
  const { mutate: updateNote, loading: updateLoading, error: updateError } = useUpdateDebitCreditNote(
    editingNote?.note_id
  )
  const {
    mutate: deleteNote,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteDebitCreditNote()

  // Calculate summary
  const visibleNotes = useMemo(() => {
    const list = (searchQuery && debouncedQuery ? searchResults : notes) as DebitCreditNoteListRow[]
    const typeFilter = filters.type.trim()

    return list.filter((note) => {
      const matchesType = !typeFilter || note.type === typeFilter
      return matchesType
    })
  }, [filters.type, notes, searchResults, searchQuery, debouncedQuery])

  const summary = useMemo(() => {
    const list = visibleNotes

    return {
      total: list.length,
      debit: list.filter((n) => n.type === 'D').length,
      credit: list.filter((n) => n.type === 'K').length,
      posted: list.filter((n) => toBooleanFlag(n.is_posted)).length,
      draft: list.filter((n) => !toBooleanFlag(n.is_posted)).length,
    }
  }, [visibleNotes])

  // Handle search debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery.trim())
      } else {
        setDebouncedQuery('')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCreate = async (data: DebitCreditNoteFormSubmitData) => {
    await createNote({
      ...data,
      invoice_id: data.invoice_id ?? 0,
      client_id: data.client_id ?? 0,
    })
    setShowCreateDialog(false)
    refetch()
  }

  const handleUpdate = async (data: DebitCreditNoteFormSubmitData) => {
    await updateNote(data)
    setShowEditDialog(false)
    refetch()
  }

  const handleDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete)
      setShowDeleteDialog(false)
      setNoteToDelete(null)
      refetch()
    }
  }

  const handleViewDetail = (id: number) => {
    setSelectedNoteId(id)
    setMode('detail')
  }

  const handleEdit = (note: DebitCreditNoteListRow) => {
    setEditingNote(note)
    setSelectedNoteId(note.note_id)
    setShowEditDialog(true)
  }

  const displayList = visibleNotes
  const displayLoading = searchQuery && debouncedQuery ? searchLoading : notesLoading
  const displayError = searchQuery && debouncedQuery ? searchError : notesError

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Nota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua nota debet & kredit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Nota Debet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.debit}</div>
            <p className="text-xs text-muted-foreground mt-1">Penambahan piutang</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Nota Kredit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.credit}</div>
            <p className="text-xs text-muted-foreground mt-1">Pengurangan piutang</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.posted}</div>
            <p className="text-xs text-muted-foreground mt-1">Sudah posting jurnal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground/75">{summary.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">Belum posting</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Cari nomor, klien..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 min-w-48"
            />
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) =>
                setFilters({ ...filters, date_from: e.target.value })
              }
              placeholder="Dari tanggal"
              className="min-w-32"
            />
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              placeholder="Sampai tanggal"
              className="min-w-32"
            />
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="D">Nota Debet</SelectItem>
                <SelectItem value="K">Nota Kredit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nota Baru
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(displayError || createError || updateError || deleteError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            {displayError?.message ||
              createError?.message ||
              updateError?.message ||
              deleteError?.message}
          </div>
        </Alert>
      )}

      {/* List View */}
      {mode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Daftar Nota Debet & Kredit</CardTitle>
          </CardHeader>
          <CardContent>
            {displayLoading ? (
              <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
            ) : displayList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada nota</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold">Nomor</th>
                      <th className="px-4 py-2 text-left font-semibold">Jenis</th>
                      <th className="px-4 py-2 text-left font-semibold">Tanggal</th>
                      <th className="px-4 py-2 text-left font-semibold">Klien</th>
                      <th className="px-4 py-2 text-right font-semibold">DPP</th>
                      <th className="px-4 py-2 text-right font-semibold">PPN</th>
                      <th className="px-4 py-2 text-right font-semibold">Total</th>
                      <th className="px-4 py-2 text-center font-semibold">Status</th>
                      <th className="px-4 py-2 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayList.map((note) => (
                      <tr key={note.note_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{note.number}</td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={note.type === 'D' ? 'default' : 'secondary'}
                          >
                            {note.type === 'D' ? 'Debet' : 'Kredit'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(note.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-2">{note.client_name}</td>
                        <td className="px-4 py-2 text-right">
                          Rp {Number(note.nominal_dpp ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2 text-right">
                          Rp {Number(note.nominal_ppn ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          Rp{' '}
                          {(
                            Number(note.nominal_dpp ?? 0) + Number(note.nominal_ppn ?? 0)
                          ).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Badge
                            variant={
                              toBooleanFlag(note.is_posted) ? 'default' : 'outline'
                            }
                          >
                            {toBooleanFlag(note.is_posted) ? 'Posted' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(note.note_id)}
                              title="Lihat detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!toBooleanFlag(note.is_posted) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(note)}
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                    setNoteToDelete(note.note_id)
                                    setShowDeleteDialog(true)
                                  }}
                                    title="Hapus"
                                  >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail View */}
      {mode === 'detail' && selectedNote && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">
              Detail Nota: {selectedNote.header?.number}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode('list')
                setSelectedNoteId(null)
              }}
            >
              Kembali
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
          {detailLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat detail...
              </div>
            ) : detailError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <div className="ml-2">{detailError.message}</div>
              </Alert>
            ) : (() => {
                 return (
              <>
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-muted-foreground">Jenis</p>
                    <p className="font-semibold">
                      {selectedNote.header?.jenis === 'D'
                        ? 'Nota Debet'
                        : 'Nota Kredit'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal</p>
                    <p className="font-semibold">
                      {new Date(selectedNote.header?.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Klien</p>
                    <p className="font-semibold">{selectedNote.header?.client_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        toBooleanFlag(selectedNote.header?.is_posted)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {toBooleanFlag(selectedNote.header?.is_posted) ? 'Posted' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/75">DPP:</span>
                    <span className="font-semibold">
                      Rp{' '}
                      {selectedNote.header?.total_dpp?.toLocaleString(
                        'id-ID'
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/75">PPN:</span>
                    <span className="font-semibold">
                      Rp{' '}
                      {selectedNote.header?.total_ppn?.toLocaleString(
                        'id-ID'
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>
                      Rp{' '}
                      {(
                        (selectedNote.header?.total_dpp || 0) +
                        (selectedNote.header?.total_ppn || 0)
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                {selectedNote.items && selectedNote.items.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Item-Item</h4>
                    <div className="space-y-2">
                      {selectedNote.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border/70 bg-muted/20 p-3 text-sm"
                        >
                          <p className="font-medium">
                            {item.item_name}{' '}
                            {item.item_code && (
                              <span className="text-muted-foreground">
                                ({item.item_code})
                              </span>
                            )}
                          </p>
                          <div className="flex justify-between text-xs text-foreground/75">
                            <span>
                              DPP: Rp{' '}
                              {(item.dpp_nota ?? item.dpp_amount ?? 0).toLocaleString('id-ID')}
                            </span>
                            <span>
                              PPN: Rp{' '}
                              {(item.ppn_nota ?? item.ppn_amount ?? 0).toLocaleString('id-ID')}
                            </span>
                            <span className="font-semibold">
                              Total: Rp{' '}
                              {(
                                (item.dpp_nota ?? item.dpp_amount ?? 0) +
                                (item.ppn_nota ?? item.ppn_amount ?? 0)
                              ).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedNote.header?.description && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Keterangan</p>
                    <p className="text-sm">{selectedNote.header?.description}</p>
                  </div>
                )}
              </>
                )
              })()}
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Nota Debet/Kredit Baru</DialogTitle>
          </DialogHeader>
          <DebitCreditNoteForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Nota: {editingNote?.number}</DialogTitle>
          </DialogHeader>
          <DebitCreditNoteForm
            note={toEditFormNote(selectedNote, editingNote) ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditDialog(false)
              setEditingNote(null)
              setSelectedNoteId(null)
            }}
            loading={updateLoading}
            error={updateError}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Nota?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus nota ini? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

