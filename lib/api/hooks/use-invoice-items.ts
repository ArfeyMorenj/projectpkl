// Invoice Items Custom Hooks
import { useToast } from '@/hooks/use-toast'
import { useMutation, useFetch } from './use-fetch'
import * as invoiceItemsAPI from '../invoice-items'
import type {
  CreateInvoiceItemRequest,
  InvoiceItemDeleteResponse,
  InvoiceItemRecord,
  UpdateInvoiceItemRequest,
} from '../types/invoice-items'

export function useInvoiceItems() {
  return useFetch<InvoiceItemRecord[]>('/invoice-items', {
    skip: false,
  })
}

export function useCreateInvoiceItem() {
  const { toast } = useToast()

  return useMutation<InvoiceItemRecord, CreateInvoiceItemRequest>({
    mutationFn: (data) => invoiceItemsAPI.createInvoiceItem(data),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice item berhasil ditambahkan',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menambahkan invoice item',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateInvoiceItem(id?: number) {
  const { toast } = useToast()

  return useMutation<InvoiceItemRecord, UpdateInvoiceItemRequest>({
    mutationFn: (data) => {
      if (!id) throw new Error('Invoice item ID is required')
      return invoiceItemsAPI.updateInvoiceItem(id, data)
    },
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice item berhasil diperbarui',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui invoice item',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteInvoiceItem() {
  const { toast } = useToast()

  return useMutation<InvoiceItemDeleteResponse, number>({
    mutationFn: (id) => invoiceItemsAPI.deleteInvoiceItem(id),
    onSuccess: () => {
      toast({
        title: 'Sukses',
        description: 'Invoice item berhasil dihapus',
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus invoice item',
        variant: 'destructive',
      })
    },
  })
}
