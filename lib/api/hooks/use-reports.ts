// Reports hooks
'use client'

import { useFetch } from './use-fetch'
import { ENDPOINTS } from '@/lib/api/endpoints'

type ReportParams = Record<string, string | number | boolean | undefined>

function buildQueryString(params?: ReportParams) {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// ==================== Dashboard ====================
export function useDashboardReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.DASHBOARD}${buildQueryString(params)}`, { raw: true })
}

// ==================== AR Reports ====================
export function useArSummaryReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.AR_SUMMARY}${buildQueryString(params)}`, { raw: true })
}

export function useArLedgerReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.AR_LEDGER}${buildQueryString(params)}`, { raw: true })
}

// ==================== Cash Report ====================
export function useCashReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.CASH}${buildQueryString(params)}`, { raw: true })
}

// ==================== Tax Reports ====================
export function useTaxReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.TAX}${buildQueryString(params)}`, { raw: true })
}

export function useTaxVatReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.TAX_VAT}${buildQueryString(params)}`, { raw: true })
}

export function useTaxSummaryReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.TAX_SUMMARY}${buildQueryString(params)}`, { raw: true })
}

// ==================== Sales Reports ====================
export function useSalesReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.SALES}${buildQueryString(params)}`, { raw: true })
}

export function useSalesClientReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.SALES_CLIENT}${buildQueryString(params)}`, { raw: true })
}

export function useSalesSummaryReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.SALES_SUMMARY}${buildQueryString(params)}`, { raw: true })
}

// ==================== Invoice Reports ====================
export function useInvoiceRegisterReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.INVOICES_REGISTER}${buildQueryString(params)}`, { raw: true })
}

export function useInvoiceHistoryReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.INVOICES_HISTORY}${buildQueryString(params)}`, { raw: true })
}

// ==================== Receivable Reports ====================
export function useReceivableDataReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.RECEIVABLE_DATA}${buildQueryString(params)}`, { raw: true })
}

export function useReceivableDetailReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.RECEIVABLE_DETAIL}${buildQueryString(params)}`, { raw: true })
}

export function useReceivableProcessDetailReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.RECEIVABLE_PROCESS_DETAIL}${buildQueryString(params)}`, { raw: true })
}

export function useReceivableSummaryReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.RECEIVABLE_SUMMARY}${buildQueryString(params)}`, { raw: true })
}

export function useReceivableByItemReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.RECEIVABLE_BY_ITEM}${buildQueryString(params)}`, { raw: true })
}

// ==================== Fiscal Report ====================
export function useFiscalCommercialReport(params?: ReportParams) {
  return useFetch<unknown>(`${ENDPOINTS.REPORTS.FISCAL_COMMERCIAL}${buildQueryString(params)}`, { raw: true })
}
