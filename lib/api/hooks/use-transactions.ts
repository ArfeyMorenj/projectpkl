// Transaction hooks
'use client'

import { useFetch, useMutation } from './use-fetch'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type {
  Invoice,
  Payment,
  WorkOrder,
  StopLicense,
  License,
  Installation,
  DebitCreditNote,
  Receivable,
  PostingPayment,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  CreateStopLicenseRequest,
  UpdateStopLicenseRequest,
} from '@/lib/api/types/transactions'

interface PageResponse<T> {
  data: T[]
}

interface DataResponse<T> {
  data: T
}

interface ArrayResponse<T> {
  data: T[]
}

function extractRows(response: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(response)) {
    return response as Array<Record<string, unknown>>
  }

  if (response && typeof response === 'object') {
    const candidate = response as { data?: unknown }
    if (Array.isArray(candidate.data)) {
      return candidate.data as Array<Record<string, unknown>>
    }
  }

  return []
}

function getUpperText(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

function isLicenseRow(row: Record<string, unknown>, flow?: unknown) {
  const flowValue = getUpperText(flow)
  if (flowValue === 'INVOICE_LICENSE') return true
  if (flowValue === 'INVOICE_PRODUCT') return false

  const category = getUpperText(row.invoice_category ?? row.category ?? row.flow_hint)
  if (category === 'LICENSE' || category === 'LICENCE') return true
  if (category === 'PRODUCT' || category === 'NON_LICENSE' || category === 'NON-LICENSE') return false

  const invoiceTypeName = getUpperText(row.invoice_type_name ?? row.jenis_invoice_name)
  if (invoiceTypeName.includes('LICENSE') || invoiceTypeName.includes('LICENCE')) return true

  const invoiceTypeCode = getUpperText(row.invoice_type_code ?? row.jenis_invoice_code)
  if (['504', 'S04'].includes(invoiceTypeCode)) return true

  const invoiceType = row.invoice_type as
    | { is_license?: unknown; code?: unknown; name?: unknown }
    | undefined
  if (invoiceType) {
    if (typeof invoiceType.is_license === 'boolean') {
      return invoiceType.is_license
    }

    const nestedName = getUpperText(invoiceType.name)
    if (nestedName.includes('LICENSE') || nestedName.includes('LICENCE')) return true

    const nestedCode = getUpperText(invoiceType.code)
    if (['504', 'S04'].includes(nestedCode)) return true
  }

  return false
}

function filterInvoiceRows(response: unknown, mode: 'license' | 'product') {
  const flow = response && typeof response === 'object' ? (response as { flow?: unknown }).flow : undefined
  const rows = extractRows(response)

  if (mode === 'license') {
    if (getUpperText(flow) === 'INVOICE_LICENSE') {
      return rows
    }
    return rows.filter((row) => isLicenseRow(row, flow))
  }

  if (getUpperText(flow) === 'INVOICE_PRODUCT') {
    return rows
  }
  return rows.filter((row) => !isLicenseRow(row, flow))
}

// ==================== Work Orders ====================
export function useWorkOrders(page = 1, perPage = 10) {
  return useFetch<PageResponse<WorkOrder>>(
    `${ENDPOINTS.WORK_ORDERS.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function useWorkOrderDetail(id: string | number | null) {
  return useFetch<DataResponse<WorkOrder>>(
    id ? ENDPOINTS.WORK_ORDERS.GET(id) : null
  )
}

// ==================== Installations ====================
export function useInstallations(page = 1, perPage = 10) {
  return useFetch<PageResponse<Installation>>(
    `${ENDPOINTS.INSTALLATIONS.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function useInstallationDetail(id: string | number | null) {
  return useFetch<DataResponse<Installation>>(
    id ? ENDPOINTS.INSTALLATIONS.GET(id) : null
  )
}

// ==================== Licenses ====================
export function useLicenses(page = 1, perPage = 10) {
  return useFetch<PageResponse<License>>(
    `${ENDPOINTS.LICENSES.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function useLicenseDetail(id: string | number | null) {
  return useFetch<DataResponse<License>>(
    id ? ENDPOINTS.LICENSES.GET(id) : null
  )
}

// ==================== Stop Licenses ====================
export function useStopLicenses(page = 1, perPage = 10) {
  return useFetch<PageResponse<StopLicense>>(
    `${ENDPOINTS.STOP_LICENSES.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function useStopLicenseDetail(id: string | number | null) {
  return useFetch<DataResponse<StopLicense>>(
    id ? ENDPOINTS.STOP_LICENSES.GET(id) : null
  )
}

// ==================== Invoices (License) ====================
export function useInvoicesLicense(page = 1, perPage = 10) {
  return useFetch<PageResponse<Invoice>>(
    `${ENDPOINTS.INVOICES_LICENSE.LIST}?page=${page}&per_page=${perPage}`,
    {
      select: (response) => ({
        data: filterInvoiceRows(response, 'license') as unknown as Invoice[],
      }),
    }
  )
}

export function useInvoiceLicenseDetail(id: string | number | null) {
  return useFetch<DataResponse<Invoice>>(
    id ? ENDPOINTS.INVOICES_LICENSE.GET(id) : null
  )
}

export function useInvoiceLicenseSummaryJournal(id: string | number | null) {
  return useFetch<DataResponse<Record<string, unknown>>>(
    id ? ENDPOINTS.INVOICES_LICENSE.SUMMARY_JOURNAL(id) : null
  )
}

// ==================== Invoices (Product) ====================
export function useInvoicesProduct(page = 1, perPage = 10) {
  return useFetch<PageResponse<Invoice>>(
    `${ENDPOINTS.INVOICES_PRODUCT.LIST}?page=${page}&per_page=${perPage}`,
    {
      select: (response) => ({
        data: filterInvoiceRows(response, 'product') as unknown as Invoice[],
      }),
    }
  )
}

export function useInvoiceProductDetail(id: string | number | null) {
  return useFetch<DataResponse<Invoice>>(
    id ? ENDPOINTS.INVOICES_PRODUCT.GET(id) : null
  )
}

export function useInvoiceProductSummaryJournal(id: string | number | null) {
  return useFetch<DataResponse<Record<string, unknown>>>(
    id ? ENDPOINTS.INVOICES_PRODUCT.SUMMARY_JOURNAL(id) : null
  )
}

// ==================== Payments ====================
export function usePayments(page = 1, perPage = 10) {
  return useFetch<PageResponse<Payment>>(
    `${ENDPOINTS.PAYMENTS.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function usePaymentDetail(id: string | number | null) {
  return useFetch<DataResponse<Payment>>(
    id ? ENDPOINTS.PAYMENTS.GET(id) : null
  )
}

// ==================== Debit Credit Notes ====================
export function useDebitCreditNotes(page = 1, perPage = 10) {
  return useFetch<PageResponse<DebitCreditNote>>(
    `${ENDPOINTS.DEBIT_CREDIT_NOTES.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function useDebitCreditNoteDetail(id: string | number | null) {
  return useFetch<DataResponse<DebitCreditNote>>(
    id ? ENDPOINTS.DEBIT_CREDIT_NOTES.GET(id) : null
  )
}

export function useDebitCreditNoteSummaryJournal(id: string | number | null) {
  return useFetch<DataResponse<Record<string, unknown>>>(
    id ? ENDPOINTS.DEBIT_CREDIT_NOTES.SUMMARY_JOURNAL(id) : null
  )
}

// ==================== Receivables ====================
export function useReceivables(page = 1, perPage = 10) {
  return useFetch<PageResponse<Receivable>>(
    `${ENDPOINTS.RECEIVABLES.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function useReceivableDetail(id: string | number | null) {
  return useFetch<DataResponse<Receivable>>(
    id ? ENDPOINTS.RECEIVABLES.GET(id) : null
  )
}

// ==================== Posting Payments ====================
export function usePostingPayments(page = 1, perPage = 10) {
  return useFetch<PageResponse<PostingPayment>>(
    `${ENDPOINTS.POSTING_PAYMENTS.LIST}?page=${page}&per_page=${perPage}`
  )
}

export function usePostingPaymentsSearch(searchTerm: string) {
  const query = searchTerm.trim()
  const url = query.length >= 2 ? `${ENDPOINTS.POSTING_PAYMENTS.SEARCH}?q=${encodeURIComponent(query)}` : null

  const queryResult = useFetch<ArrayResponse<PostingPayment>>(url, {
    skip: !url,
  })

  return {
    ...queryResult,
    results: queryResult.data?.data ?? [],
  }
}

export function usePostingPaymentDetail(id: string | number | null) {
  return useFetch<DataResponse<PostingPayment>>(
    id ? ENDPOINTS.POSTING_PAYMENTS.GET(id) : null
  )
}

export function usePostingPaymentSummaryJournal(id: string | number | null) {
  return useFetch<DataResponse<Record<string, unknown>>>(
    id ? ENDPOINTS.POSTING_PAYMENTS.SUMMARY_JOURNAL(id) : null
  )
}

export function usePostingPaymentCosts(id: string | number | null) {
  return useFetch<ArrayResponse<Record<string, unknown>>>(
    id ? ENDPOINTS.POSTING_PAYMENT_COSTS.LIST(id) : null,
    { skip: !id }
  )
}
