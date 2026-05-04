'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import type { Bank, CreateBankRequest } from '@/lib/api/types/banks'

interface BankFormProps {
  bank?: Bank | null
  onSubmit: (data: CreateBankRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: Error | null
}

/**
 * Reusable bank form for create/edit operations
 */
export function BankForm({
  bank,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}: BankFormProps) {
  const [formData, setFormData] = useState<CreateBankRequest>({
    code: '',
    name: '',
    account_number: '',
    account_name: '',
    type: 'M',
    acc_code: '',
    cdf_code: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Initialize form with existing bank data
  useEffect(() => {
    if (bank) {
      setFormData({
        code: bank.code,
        name: bank.name,
        account_number: bank.account_number || '',
        account_name: bank.account_name || '',
        type: bank.type,
        acc_code: bank.acc_code,
        cdf_code: bank.cdf_code,
      })
    }
  }, [bank])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTypeChange = (value: 'M' | 'H') => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          {error.message || 'Terjadi kesalahan saat menyimpan'}
        </Alert>
      )}

      {/* Code */}
      <div className="space-y-1">
        <Label htmlFor="code">Kode Bank *</Label>
        <Input
          id="code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="BK01"
          required
          disabled={submitting || loading}
        />
      </div>

      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="name">Nama Bank *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="BANK BCA"
          required
          disabled={submitting || loading}
        />
      </div>

      {/* Account Number */}
      <div className="space-y-1">
        <Label htmlFor="account_number">Nomor Rekening</Label>
        <Input
          id="account_number"
          name="account_number"
          value={formData.account_number}
          onChange={handleChange}
          placeholder="1234567890"
          disabled={submitting || loading}
        />
      </div>

      {/* Account Name */}
      <div className="space-y-1">
        <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
        <Input
          id="account_name"
          name="account_name"
          value={formData.account_name}
          onChange={handleChange}
          placeholder="PT Integrasi Media Nusantara"
          disabled={submitting || loading}
        />
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label htmlFor="type">Tipe *</Label>
        <Select value={formData.type} onValueChange={handleTypeChange}>
          <SelectTrigger disabled={submitting || loading}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">Main (M)</SelectItem>
            <SelectItem value="H">Header (H)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ACC Code */}
      <div className="space-y-1">
        <Label htmlFor="acc_code">Kode Akun (ACC) *</Label>
        <Input
          id="acc_code"
          name="acc_code"
          value={formData.acc_code}
          onChange={handleChange}
          placeholder="1201"
          required
          disabled={submitting || loading}
        />
      </div>

      {/* CDF Code */}
      <div className="space-y-1">
        <Label htmlFor="cdf_code">Kode CDF *</Label>
        <Input
          id="cdf_code"
          name="cdf_code"
          value={formData.cdf_code}
          onChange={handleChange}
          placeholder="1201"
          required
          disabled={submitting || loading}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={submitting || loading}
          className="flex-1"
        >
          {submitting || loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting || loading}
            className="flex-1"
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
