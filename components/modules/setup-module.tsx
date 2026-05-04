'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, Edit2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import {
  useCompanySettings,
  useCreateTaxSeries,
  useDeleteTaxSeries,
  useNextTaxSeriesNumber,
  useSaveCompanySettings,
  useTaxSeries,
  useUpdateTaxSeries,
} from '@/lib/api/hooks'
import type { CompanySettings, CreateTaxSeriesRequest, TaxSeries } from '@/lib/api/types/setup'

const defaultCompanySettings: CompanySettings = {
  logo: null,
  company_name: 'PT FitArt Technology',
  address: 'Jakarta',
  city: 'Jakarta',
  phone: '0211234567',
  npwp: null,
  period_start: '2026-01-01',
  acc_ppn_kes: '3213',
  acc_ppn_mas: '3214',
  acc_discount: '5090',
  bank1: 'BCA',
  bank1_sn: 'Cabang Utama',
  bank1_ac: '1234567890',
  bank2: 'Mandiri',
  bank2_sn: 'Cabang Pusat',
  bank2_ac: '0987654321',
  acc_ppn_kes_name: 'Hutang PPN Keluaran',
  acc_ppn_mas_name: 'Hutang PPN Masukan (-)',
  acc_discount_name: 'Beban Diskon Penjualan',
}

type TaxSeriesFormState = {
  filled_date: string
  period: string
  tax_code: string
  start_number: string
  end_number: string
  ppn_percentage: string
  dpp_percentage: string
}

const defaultTaxSeriesForm: TaxSeriesFormState = {
  filled_date: '',
  period: '',
  tax_code: '',
  start_number: '',
  end_number: '',
  ppn_percentage: '11',
  dpp_percentage: '1.11',
}

export function SetupModule() {
  const [activeTab, setActiveTab] = useState<'perusahaan' | 'seri_faktur' | 'kode_akun' | 'rekening'>(
    'perusahaan'
  )
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings)
  const [originalCompanySettings, setOriginalCompanySettings] = useState<CompanySettings>(defaultCompanySettings)
  const [taxSeriesList, setTaxSeriesList] = useState<TaxSeries[]>([])

  const [isTaxSeriesDialogOpen, setIsTaxSeriesDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTaxSeriesId, setEditingTaxSeriesId] = useState<number | string | null>(null)
  const [deletingTaxSeriesId, setDeletingTaxSeriesId] = useState<number | string | null>(null)
  const [taxSeriesFormData, setTaxSeriesFormData] = useState<TaxSeriesFormState>(defaultTaxSeriesForm)

  const {
    data: fetchedCompanySettings,
    loading: companyLoading,
    error: companyError,
    refetch: refetchCompanySettings,
  } = useCompanySettings()
  const {
    data: fetchedTaxSeries,
    loading: taxSeriesLoading,
    error: taxSeriesError,
    refetch: refetchTaxSeries,
  } = useTaxSeries()

  const { mutate: saveCompanySettings, loading: saveCompanyLoading, error: saveCompanyError } =
    useSaveCompanySettings()
  const { mutate: createTaxSeries, loading: createTaxLoading, error: createTaxError } =
    useCreateTaxSeries()
  const { mutate: updateTaxSeries, loading: updateTaxLoading, error: updateTaxError } =
    useUpdateTaxSeries(editingTaxSeriesId)
  const { mutate: deleteTaxSeries, loading: deleteTaxLoading } = useDeleteTaxSeries()
  const { mutate: nextTaxSeriesNumber, loading: nextTaxLoading } = useNextTaxSeriesNumber()

  useEffect(() => {
    if (fetchedCompanySettings) {
      const normalizedCompanySettings = {
        ...defaultCompanySettings,
        ...fetchedCompanySettings,
      }
      setCompanySettings(normalizedCompanySettings)
      setOriginalCompanySettings(normalizedCompanySettings)
    }
  }, [fetchedCompanySettings])

  useEffect(() => {
    if (fetchedTaxSeries) {
      setTaxSeriesList(fetchedTaxSeries)
    }
  }, [fetchedTaxSeries])

  const handleCompanyFieldChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveCompanySettings = async () => {
    await saveCompanySettings({
      logo: companySettings.logo,
      company_name: companySettings.company_name,
      address: companySettings.address,
      city: companySettings.city,
      phone: companySettings.phone,
      npwp: companySettings.npwp?.trim() ? companySettings.npwp : null,
      period_start: companySettings.period_start,
      acc_ppn_kes: companySettings.acc_ppn_kes,
      acc_ppn_mas: companySettings.acc_ppn_mas,
      acc_discount: companySettings.acc_discount,
      bank1: companySettings.bank1,
      bank1_sn: companySettings.bank1_sn,
      bank1_ac: companySettings.bank1_ac,
      bank2: companySettings.bank2,
      bank2_sn: companySettings.bank2_sn,
      bank2_ac: companySettings.bank2_ac,
    })
    await refetchCompanySettings()
  }

  const openCreateTaxSeriesDialog = () => {
    setEditingTaxSeriesId(null)
    setTaxSeriesFormData(defaultTaxSeriesForm)
    setIsTaxSeriesDialogOpen(true)
  }

  const openEditTaxSeriesDialog = (series: TaxSeries) => {
    setEditingTaxSeriesId(series.id)
    setTaxSeriesFormData({
      filled_date: series.filled_date ?? '',
      period: series.period ?? '',
      tax_code: series.tax_code ?? '',
      start_number: series.start_number ?? '',
      end_number: series.end_number ?? '',
      ppn_percentage: String(series.ppn_percentage ?? ''),
      dpp_percentage: String(series.dpp_percentage ?? ''),
    })
    setIsTaxSeriesDialogOpen(true)
  }

  const handleSaveTaxSeries = async () => {
    const request: CreateTaxSeriesRequest = {
      filled_date: taxSeriesFormData.filled_date,
      period: taxSeriesFormData.period,
      tax_code: taxSeriesFormData.tax_code,
      start_number: taxSeriesFormData.start_number,
      end_number: taxSeriesFormData.end_number,
      ppn_percentage: Number(taxSeriesFormData.ppn_percentage),
      dpp_percentage: Number(taxSeriesFormData.dpp_percentage),
    }

    if (editingTaxSeriesId) {
      await updateTaxSeries(request)
    } else {
      await createTaxSeries(request)
    }

    setIsTaxSeriesDialogOpen(false)
    setEditingTaxSeriesId(null)
    setTaxSeriesFormData(defaultTaxSeriesForm)
    await refetchTaxSeries()
  }

  const openDeleteTaxSeriesDialog = (series: TaxSeries) => {
    setDeletingTaxSeriesId(series.id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteTaxSeries = async () => {
    if (deletingTaxSeriesId == null) return

    await deleteTaxSeries(deletingTaxSeriesId)
    setIsDeleteDialogOpen(false)
    setDeletingTaxSeriesId(null)
    await refetchTaxSeries()
  }

  const handleGenerateNextTaxSeries = async (id: number | string) => {
    await nextTaxSeriesNumber(id)
    await refetchTaxSeries()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Setup</h1>
        <p className="text-muted-foreground">Pengaturan perusahaan, seri faktur, dan akun pendukung.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        <button
          onClick={() => setActiveTab('perusahaan')}
          className={`px-5 py-3 font-semibold ${
            activeTab === 'perusahaan'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Setting Perusahaan
        </button>
        <button
          onClick={() => setActiveTab('seri_faktur')}
          className={`px-5 py-3 font-semibold ${
            activeTab === 'seri_faktur'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          No. Seri Faktur Pajak
        </button>
        <button
          onClick={() => setActiveTab('kode_akun')}
          className={`px-5 py-3 font-semibold ${
            activeTab === 'kode_akun'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Setting Kode Akun
        </button>
        <button
          onClick={() => setActiveTab('rekening')}
          className={`px-5 py-3 font-semibold ${
            activeTab === 'rekening'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Akun & Bank
        </button>
      </div>

      {(companyError || taxSeriesError || saveCompanyError || createTaxError || updateTaxError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            {companyError?.message ||
              taxSeriesError?.message ||
              saveCompanyError?.message ||
              createTaxError?.message ||
              updateTaxError?.message}
          </div>
        </Alert>
      )}

      {activeTab === 'perusahaan' && (
        <Card>
          <CardHeader>
            <CardTitle>Setting Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyLoading ? (
              <div className="text-sm text-muted-foreground">Memuat data perusahaan...</div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nama Perusahaan</Label>
                <Input
                  name="company_name"
                  value={companySettings.company_name}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  name="city"
                  value={companySettings.city}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <textarea
                name="address"
                value={companySettings.address}
                onChange={handleCompanyFieldChange}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={saveCompanyLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telp</Label>
                <Input
                  name="phone"
                  value={companySettings.phone}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP</Label>
                <Input
                  name="npwp"
                  value={companySettings.npwp ?? ''}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_start">Periode Start</Label>
              <Input
                name="period_start"
                type="date"
                value={companySettings.period_start}
                onChange={handleCompanyFieldChange}
                disabled={saveCompanyLoading}
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Akun Pajak
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="acc_ppn_kes">Acc PPN Keluaran</Label>
                  <Input
                    name="acc_ppn_kes"
                    value={companySettings.acc_ppn_kes}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {companySettings.acc_ppn_kes_name || 'Nama akun tidak tersedia'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc_ppn_mas">Acc PPN Masukan</Label>
                  <Input
                    name="acc_ppn_mas"
                    value={companySettings.acc_ppn_mas}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {companySettings.acc_ppn_mas_name || 'Nama akun tidak tersedia'}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="acc_discount">Acc Discount</Label>
                  <Input
                    name="acc_discount"
                    value={companySettings.acc_discount}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {companySettings.acc_discount_name || 'Nama akun tidak tersedia'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Rekening Bank
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bank1">Bank 1</Label>
                  <Input
                    name="bank1"
                    value={companySettings.bank1}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank1_sn">Bank 1 SN</Label>
                  <Input
                    name="bank1_sn"
                    value={companySettings.bank1_sn}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank1_ac">Bank 1 AC</Label>
                  <Input
                    name="bank1_ac"
                    value={companySettings.bank1_ac}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank2">Bank 2</Label>
                  <Input
                    name="bank2"
                    value={companySettings.bank2}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank2_sn">Bank 2 SN</Label>
                  <Input
                    name="bank2_sn"
                    value={companySettings.bank2_sn}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank2_ac">Bank 2 AC</Label>
                  <Input
                    name="bank2_ac"
                    value={companySettings.bank2_ac}
                    onChange={handleCompanyFieldChange}
                    disabled={saveCompanyLoading}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setCompanySettings(originalCompanySettings)}
                disabled={saveCompanyLoading}
              >
                Reset
              </Button>
              <Button onClick={handleSaveCompanySettings} disabled={saveCompanyLoading}>
                {saveCompanyLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'seri_faktur' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>No. Seri Faktur Pajak</CardTitle>
              <p className="text-sm text-muted-foreground">
                Data seri faktur yang tersimpan di backend.
              </p>
            </div>
            <Button onClick={openCreateTaxSeriesDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Seri
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxSeriesLoading ? (
              <div className="text-sm text-muted-foreground">Memuat data seri faktur...</div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tgl. Isi</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Kode Pajak</TableHead>
                    <TableHead>No. Awal</TableHead>
                    <TableHead>No. Akhir</TableHead>
                    <TableHead>No. Aktif</TableHead>
                    <TableHead>PPN %</TableHead>
                    <TableHead>DPP %</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxSeriesList.map((series, index) => (
                    <TableRow key={`${series.id}-${index}`}>
                      <TableCell>{series.filled_date}</TableCell>
                      <TableCell className="font-medium">{series.period}</TableCell>
                      <TableCell>{series.tax_code}</TableCell>
                      <TableCell className="font-mono">{series.start_number}</TableCell>
                      <TableCell className="font-mono">{series.end_number}</TableCell>
                      <TableCell className="font-mono">{series.current_number}</TableCell>
                      <TableCell>{Number(series.ppn_percentage).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{Number(series.dpp_percentage).toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditTaxSeriesDialog(series)} disabled={updateTaxLoading || deleteTaxLoading}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleGenerateNextTaxSeries(series.id)} disabled={nextTaxLoading}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => openDeleteTaxSeriesDialog(series)} disabled={deleteTaxLoading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {taxSeriesList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Belum ada seri faktur.</div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'kode_akun' && (
        <Card>
          <CardHeader>
            <CardTitle>Setting Kode Akun</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kode akun backend yang dipakai perusahaan untuk PPN dan diskon.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="acc_ppn_kes">Acc PPN Keluaran</Label>
                <Input
                  name="acc_ppn_kes"
                  value={companySettings.acc_ppn_kes}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {companySettings.acc_ppn_kes_name || 'Nama akun tidak tersedia'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="acc_ppn_mas">Acc PPN Masukan</Label>
                <Input
                  name="acc_ppn_mas"
                  value={companySettings.acc_ppn_mas}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {companySettings.acc_ppn_mas_name || 'Nama akun tidak tersedia'}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="acc_discount">Acc Discount</Label>
                <Input
                  name="acc_discount"
                  value={companySettings.acc_discount}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {companySettings.acc_discount_name || 'Nama akun tidak tersedia'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCompanySettings(originalCompanySettings)}
                disabled={saveCompanyLoading}
              >
                Reset
              </Button>
              <Button onClick={handleSaveCompanySettings} disabled={saveCompanyLoading}>
                {saveCompanyLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'rekening' && (
        <Card>
          <CardHeader>
            <CardTitle>Akun & Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank1">Bank 1</Label>
                <Input
                  name="bank1"
                  value={companySettings.bank1}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank1_sn">Bank 1 SN</Label>
                <Input
                  name="bank1_sn"
                  value={companySettings.bank1_sn}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank1_ac">Bank 1 AC</Label>
                <Input
                  name="bank1_ac"
                  value={companySettings.bank1_ac}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank2">Bank 2</Label>
                <Input
                  name="bank2"
                  value={companySettings.bank2}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank2_sn">Bank 2 SN</Label>
                <Input
                  name="bank2_sn"
                  value={companySettings.bank2_sn}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank2_ac">Bank 2 AC</Label>
                <Input
                  name="bank2_ac"
                  value={companySettings.bank2_ac}
                  onChange={handleCompanyFieldChange}
                  disabled={saveCompanyLoading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCompanySettings(originalCompanySettings)}
                disabled={saveCompanyLoading}
              >
                Reset
              </Button>
              <Button onClick={handleSaveCompanySettings} disabled={saveCompanyLoading}>
                {saveCompanyLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isTaxSeriesDialogOpen} onOpenChange={setIsTaxSeriesDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingTaxSeriesId ? 'Edit Seri Faktur' : 'Tambah Seri Faktur'}</DialogTitle>
            <DialogDescription>Lengkapi data No. Seri Faktur Pajak sesuai response backend.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="filled_date">Filled Date</Label>
              <Input
                name="filled_date"
                type="date"
                value={taxSeriesFormData.filled_date}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, filled_date: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                name="period"
                value={taxSeriesFormData.period}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, period: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_code">Tax Code</Label>
              <Input
                name="tax_code"
                value={taxSeriesFormData.tax_code}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, tax_code: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_number">Start Number</Label>
              <Input
                name="start_number"
                value={taxSeriesFormData.start_number}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, start_number: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_number">End Number</Label>
              <Input
                name="end_number"
                value={taxSeriesFormData.end_number}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, end_number: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppn_percentage">PPN %</Label>
              <Input
                name="ppn_percentage"
                type="number"
                step="0.01"
                value={taxSeriesFormData.ppn_percentage}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, ppn_percentage: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpp_percentage">DPP %</Label>
              <Input
                name="dpp_percentage"
                type="number"
                step="0.01"
                value={taxSeriesFormData.dpp_percentage}
                onChange={(e) => setTaxSeriesFormData((prev) => ({ ...prev, dpp_percentage: e.target.value }))}
                disabled={createTaxLoading || updateTaxLoading}
              />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
            <div>Current Number akan tampil di tabel setelah disimpan, dan di-update lewat tombol next number.</div>
            {editingTaxSeriesId ? (
              <div className="mt-2 font-mono text-foreground">
                Current Number:{' '}
                {taxSeriesList.find((item) => String(item.id) === String(editingTaxSeriesId))?.current_number ?? '-'}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaxSeriesDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveTaxSeries} disabled={createTaxLoading || updateTaxLoading}>
              {createTaxLoading || updateTaxLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Seri Faktur?</DialogTitle>
            <DialogDescription>Data ini akan dihapus dari setup tax series.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteTaxSeries} disabled={deleteTaxLoading}>
              {deleteTaxLoading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
