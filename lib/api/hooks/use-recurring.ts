'use client'

import { useToast } from '@/hooks/use-toast'
import { useMutation } from './use-fetch'
import { generateRecurringInvoices } from '../recurring'
import type { GenerateRecurringInvoicesRequest, GenerateRecurringInvoicesResponse } from '../types/recurring'

export function useGenerateRecurringInvoices() {
  const { toast } = useToast()

  return useMutation<GenerateRecurringInvoicesResponse, GenerateRecurringInvoicesRequest | undefined>({
    mutationFn: (data) => generateRecurringInvoices(data),
    onSuccess: (result) => {
      toast({
        title: 'Sukses',
        description: `Recurring invoice berhasil diproses (${result.created_count} dibuat)`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal generate recurring invoice',
        variant: 'destructive',
      })
    },
  })
}
