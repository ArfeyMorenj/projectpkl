"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const shellClass =
  'bg-card/85 text-card-foreground rounded-3xl border border-border/70 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm'

interface TeamDetailViewProps {
  memberId?: string
  onClose: () => void
  onSave: (formData: TeamDetailFormData) => void
  onDelete?: (memberId: string) => void
  member?: TeamDetailMember
}

interface TeamDetailFormData {
  code: string
  name: string
  position: string
  status: string
}

interface TeamDetailMember {
  id: string
  name: string
  jabatan?: string
  status?: string
}

export function TeamDetailView({ memberId, onClose, onSave, onDelete, member }: TeamDetailViewProps) {
  const [formData, setFormData] = useState<TeamDetailFormData>({
    code: "",
    name: "",
    position: "",
    status: "STATUS1",
  })

  useEffect(() => {
    if (memberId && member) {
      setFormData({
        code: member.id,
        name: member.name,
        position: member.jabatan ?? "",
        status: member.status ?? "STATUS1",
      })
    } else {
      setFormData({
        code: "",
        name: "",
        position: "",
        status: "STATUS1",
      })
    }
  }, [memberId, member])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Please enter member name")
      return
    }
    onSave(formData)
  }

  const handleNew = () => {
    setFormData({
      code: "",
      name: "",
      position: "",
      status: "STATUS1",
    })
  }

  const handleDelete = () => {
    if (memberId && onDelete) {
      if (confirm("Are you sure you want to delete this member?")) {
        onDelete(memberId)
      }
    }
  }

  return (
    <div className={`${shellClass} max-w-xl w-full space-y-6`}>
      <h2 className="text-2xl font-bold text-foreground">TEAM MEMBER</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
            placeholder="Auto-generated"
            disabled={!!memberId}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
            placeholder="Enter member name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Position / Jabatan</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-foreground"
            placeholder="Enter position"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
          <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STATUS1">STATUS1</SelectItem>
              <SelectItem value="STATUS2">STATUS2</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Save
        </Button>
        <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700 text-white px-8">
          New
        </Button>
        {memberId && (
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-8">
            Delete
          </Button>
        )}
        <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-8">
          Close
        </Button>
      </div>
    </div>
  )
}

