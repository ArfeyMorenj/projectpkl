"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreatePostingPaymentCostItem, PostingPaymentCostDetail } from "@/lib/api/types/posting-payments"

export type PostingPaymentCostFormSubmitData = CreatePostingPaymentCostItem

interface PostingPaymentCostFormProps {
  cost?: Partial<PostingPaymentCostDetail>
  onSubmit: (data: PostingPaymentCostFormSubmitData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function PostingPaymentCostForm({
  cost,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: PostingPaymentCostFormProps) {
  const [formData, setFormData] = useState({
    description: cost?.description || "",
    amount: String(cost?.amount ?? ""),
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.description.trim()) errors.description = "Deskripsi biaya harus diisi"
    if (!formData.amount || Number.isNaN(Number(formData.amount))) errors.amount = "Nominal biaya harus diisi"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    await onSubmit({
      description: formData.description.trim(),
      amount: Number(formData.amount),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
        </Alert>
      )}

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Detail Biaya Posting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Biaya admin bank"
              disabled={loading}
            />
            {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
              disabled={loading}
            />
            {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={loading} type="button">
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          {loading ? "Menyimpan..." : "Simpan Biaya"}
        </Button>
      </div>
    </form>
  )
}
