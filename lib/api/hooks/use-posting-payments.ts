"use client"

import { useToast } from '@/components/ui/use-toast'
import { useFetch, useMutation } from './use-fetch'
import {
  createPostingPayment,
  createPostingPaymentCost,
  deletePostingPaymentCost,
  postPostingOmzet,
  updatePostingPaymentCost,
} from '@/lib/api/posting-payments'
import type {
  CreatePostingPaymentCostItem,
  CreatePostingPaymentRequest,
  PostPostingOmzetRequest,
  PostPostingOmzetResponse,
  PostingPaymentCostsResponse,
  PostingPaymentDetailResponse,
  PostingPaymentSummaryJournalResponse,
  PostingPaymentsListResponse,
  PostingPaymentCostSaveResponse,
  PostingPaymentCostDeleteResponse,
} from '@/lib/api/types/posting-payments'

export function usePostingPayments() {
  return useFetch<PostingPaymentsListResponse>('/posting/payments', { raw: true })
}

export function usePostingPaymentsSearch(searchTerm: string) {
  const query = searchTerm.trim()
  const url = query.length >= 2 ? `/posting/payments/search?q=${encodeURIComponent(query)}` : null
  const queryResult = useFetch<PostingPaymentsListResponse>(url, { raw: true, skip: !url })

  return {
    ...queryResult,
    results: queryResult.data?.data ?? [],
  }
}

export function usePostingPaymentDetail(id: number | null) {
  return useFetch<PostingPaymentDetailResponse>(id ? `/posting/payments/${id}` : null, {
    raw: true,
    skip: !id,
  })
}

export function usePostingPaymentSummaryJournal(id: number | null) {
  return useFetch<PostingPaymentSummaryJournalResponse>(
    id ? `/posting/payments/${id}/summary-journal` : null,
    {
      raw: true,
      skip: !id,
    }
  )
}

export function usePostingPaymentCosts(id: number | null) {
  return useFetch<PostingPaymentCostsResponse>(id ? `/posting/payments/${id}/costs` : null, {
    raw: true,
    skip: !id,
  })
}

export function useCreatePostingPayment() {
  const { toast } = useToast()
  return useMutation<PostingPaymentDetailResponse, CreatePostingPaymentRequest>({
    mutationFn: createPostingPayment,
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Posting pembayaran berhasil dibuat',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal membuat posting pembayaran',
        variant: 'destructive',
      })
    },
  })
}

export function useCreatePostingPaymentCost() {
  const { toast } = useToast()
  return useMutation<PostingPaymentCostSaveResponse, { postingPaymentId: number; data: CreatePostingPaymentCostItem }>({
    mutationFn: ({ postingPaymentId, data }) => createPostingPaymentCost(postingPaymentId, data),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Biaya posting berhasil ditambahkan',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menambahkan biaya posting',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdatePostingPaymentCost() {
  const { toast } = useToast()
  return useMutation<PostingPaymentCostSaveResponse, { postingPaymentId: number; costId: number; data: CreatePostingPaymentCostItem }>({
    mutationFn: ({ postingPaymentId, costId, data }) => updatePostingPaymentCost(postingPaymentId, costId, data),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Biaya posting berhasil diperbarui',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui biaya posting',
        variant: 'destructive',
      })
    },
  })
}

export function useDeletePostingPaymentCost() {
  const { toast } = useToast()
  return useMutation<PostingPaymentCostDeleteResponse, { postingPaymentId: number; costId: number }>({
    mutationFn: ({ postingPaymentId, costId }) => deletePostingPaymentCost(postingPaymentId, costId),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Biaya posting berhasil dihapus',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus biaya posting',
        variant: 'destructive',
      })
    },
  })
}

export function usePostPostingOmzet() {
  const { toast } = useToast()
  return useMutation<PostPostingOmzetResponse, PostPostingOmzetRequest>({
    mutationFn: postPostingOmzet,
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Posting omzet berhasil dibuat',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal posting omzet',
        variant: 'destructive',
      })
    },
  })
}
