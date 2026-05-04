'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
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
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { CompanyForm } from '@/components/forms/company-form'
import {
  useCompanies,
  useCompaniesSearch,
  useCreateCompany,
  useDeleteCompany,
  useUpdateCompany,
} from '@/lib/api/hooks'
import type { Company, CreateCompanyRequest } from '@/lib/api/types/companies'

export function CompaniesModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const { data: companies, loading, error, refetch } = useCompanies()
  const { results: searchResults } = useCompaniesSearch(searchTerm)
  const { mutate: createCompany, loading: createLoading, error: createError } = useCreateCompany()
  const { mutate: updateCompany, loading: updateLoading, error: updateError } = useUpdateCompany(
    selectedCompany?.id ?? null
  )
  const { mutate: deleteCompany, loading: deleteLoading } = useDeleteCompany()

  const displayedCompanies = searchTerm.trim() ? searchResults : companies ?? []

  const handleCreateCompany = async (formData: CreateCompanyRequest) => {
    await createCompany(formData)
    setIsCreateDialogOpen(false)
    refetch()
  }

  const handleUpdateCompany = async (formData: CreateCompanyRequest) => {
    await updateCompany(formData)
    setIsEditDialogOpen(false)
    refetch()
  }

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return
    await deleteCompany(selectedCompany.id)
    setIsDeleteDialogOpen(false)
    refetch()
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Companies</h1>
          <p className="text-muted-foreground">Kelola data perusahaan, alamat, kontak, dan informasi invoice.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Company
        </Button>
      </div>

      <div className="bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm space-y-4">
        <Input
          placeholder="Cari kode atau nama company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70 border-b">
                <th className="px-4 py-3 text-left font-semibold">Kode</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Kota</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedCompanies.map((company, index) => (
                <tr key={company.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-semibold">{company.code}</td>
                  <td className="px-4 py-3">{company.name}</td>
                  <td className="px-4 py-3">{company.city}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCompany(company)
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
                          setSelectedCompany(company)
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

        {displayedCompanies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Tidak ada company ditemukan</div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Company</DialogTitle>
          </DialogHeader>
          <CompanyForm
            onSubmit={handleCreateCompany}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <CompanyForm
              company={selectedCompany}
              onSubmit={handleUpdateCompany}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateLoading}
              error={updateError}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Company?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus company <strong>{selectedCompany?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
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

