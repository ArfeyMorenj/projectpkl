'use client'

import { useFetch } from './use-fetch'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type {
  ArrayResponse,
  Bank,
  ChartOfAccount,
  Client,
  Company,
  InvoiceType,
  Item,
  Product,
  TeamMember,
} from '@/lib/api/types/master-data'

export function useClientsLookup(q = '') {
  return useFetch<ArrayResponse<Client>>(
    `${ENDPOINTS.LOOKUPS.CLIENTS}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useProductsLookup(q = '') {
  return useFetch<ArrayResponse<Product>>(
    `${ENDPOINTS.LOOKUPS.PRODUCTS}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useItemsLookup(q = '') {
  return useFetch<ArrayResponse<Item>>(
    `${ENDPOINTS.LOOKUPS.ITEMS}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useTeamMembersLookup(q = '') {
  return useFetch<ArrayResponse<TeamMember>>(
    `${ENDPOINTS.LOOKUPS.TEAM_MEMBERS}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useBanksLookup(q = '') {
  return useFetch<ArrayResponse<Bank>>(
    `${ENDPOINTS.LOOKUPS.BANKS}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useInvoiceTypesLookup(q = '') {
  return useFetch<ArrayResponse<InvoiceType>>(
    `${ENDPOINTS.LOOKUPS.INVOICE_TYPES}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useCompaniesLookup(q = '') {
  return useFetch<ArrayResponse<Company>>(
    `${ENDPOINTS.LOOKUPS.COMPANIES}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}

export function useChartOfAccounts() {
  return useFetch<ArrayResponse<ChartOfAccount>>(ENDPOINTS.LOOKUPS.COA)
}

export function useChartOfAccountsLookup(q = '') {
  return useFetch<ArrayResponse<ChartOfAccount>>(
    `${ENDPOINTS.LOOKUPS.CHART_OF_ACCOUNTS}${q ? `?q=${encodeURIComponent(q)}` : ''}`
  )
}
