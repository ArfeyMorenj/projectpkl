// Company Management API Functions
import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'
import type {
  CompaniesListResponse,
  CompaniesSearchResponse,
  Company,
  CompanyDeleteResponse,
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from './types/companies'

export async function getCompanies(): Promise<Company[]> {
  const response = await apiClient.get<CompaniesListResponse>(ENDPOINTS.COMPANIES.LIST)
  return response.data || []
}

export async function getCompanyById(id: string | number): Promise<Company> {
  const response = await apiClient.get<CompanyResponse>(ENDPOINTS.COMPANIES.GET(id))
  return response.data
}

export async function searchCompanies(query: string): Promise<Company[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await apiClient.get<CompaniesSearchResponse>(
    `${ENDPOINTS.COMPANIES.SEARCH}?q=${encodeURIComponent(query)}`
  )
  return response.data || []
}

export async function createCompany(data: CreateCompanyRequest): Promise<Company> {
  const response = await apiClient.post<CompanyResponse>(ENDPOINTS.COMPANIES.CREATE, data)
  return response.data
}

export async function updateCompany(id: string | number, data: UpdateCompanyRequest): Promise<Company> {
  const response = await apiClient.put<CompanyResponse>(ENDPOINTS.COMPANIES.UPDATE(id), data)
  return response.data
}

export async function deleteCompany(id: string | number): Promise<CompanyDeleteResponse> {
  return apiClient.delete<CompanyDeleteResponse>(ENDPOINTS.COMPANIES.DELETE(id))
}
