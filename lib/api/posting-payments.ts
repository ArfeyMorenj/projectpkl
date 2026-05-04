import { apiClient } from "./client"
import type {
  CreatePostingPaymentRequest,
  CreatePostingPaymentCostItem,
  PostingPaymentsListResponse,
  PostingPaymentDetailResponse,
  PostingPaymentCostsResponse,
  PostingPaymentCostSaveResponse,
  PostingPaymentCostDeleteResponse,
  PostingPaymentSummaryJournalResponse,
  PostPostingOmzetRequest,
  PostPostingOmzetResponse,
} from "./types/posting-payments"

export async function getPostingPayments(): Promise<PostingPaymentsListResponse> {
  try {
    const response = await apiClient.get<PostingPaymentsListResponse>("/posting/payments")
    return response
  } catch (error) {
    console.error("Failed to fetch posting payments:", error)
    throw error
  }
}

export async function searchPostingPayments(query: string): Promise<PostingPaymentsListResponse> {
  try {
    const response = await apiClient.get<PostingPaymentsListResponse>(
      `/posting/payments/search?q=${encodeURIComponent(query)}`
    )
    return response
  } catch (error) {
    console.error("Failed to search posting payments:", error)
    throw error
  }
}

export async function getPostingPaymentById(id: number): Promise<PostingPaymentDetailResponse> {
  try {
    const response = await apiClient.get<PostingPaymentDetailResponse>(`/posting/payments/${id}`)
    return response
  } catch (error) {
    console.error(`Failed to fetch posting payment ${id}:`, error)
    throw error
  }
}

export async function getPostingPaymentSummaryJournal(
  id: number
): Promise<PostingPaymentSummaryJournalResponse> {
  try {
    const response = await apiClient.get<PostingPaymentSummaryJournalResponse>(
      `/posting/payments/${id}/summary-journal`
    )
    return response
  } catch (error) {
    console.error(`Failed to fetch posting payment summary journal ${id}:`, error)
    throw error
  }
}

export async function getPostingPaymentCosts(id: number): Promise<PostingPaymentCostsResponse> {
  try {
    const response = await apiClient.get<PostingPaymentCostsResponse>(`/posting/payments/${id}/costs`)
    return response
  } catch (error) {
    console.error(`Failed to fetch posting payment costs ${id}:`, error)
    throw error
  }
}

export async function createPostingPayment(data: CreatePostingPaymentRequest): Promise<PostingPaymentDetailResponse> {
  try {
    const response = await apiClient.post<PostingPaymentDetailResponse>("/posting/payments", data)
    return response
  } catch (error) {
    console.error("Failed to create posting payment:", error)
    throw error
  }
}

export async function createPostingPaymentCost(
  postingPaymentId: number,
  data: CreatePostingPaymentCostItem
): Promise<PostingPaymentCostSaveResponse> {
  try {
    const response = await apiClient.post<PostingPaymentCostSaveResponse>(
      `/posting/payments/${postingPaymentId}/costs`,
      data
    )
    return response
  } catch (error) {
    console.error(`Failed to create posting payment cost ${postingPaymentId}:`, error)
    throw error
  }
}

export async function updatePostingPaymentCost(
  postingPaymentId: number,
  costId: number,
  data: CreatePostingPaymentCostItem
): Promise<PostingPaymentCostSaveResponse> {
  try {
    const response = await apiClient.put<PostingPaymentCostSaveResponse>(
      `/posting/payments/${postingPaymentId}/costs/${costId}`,
      data
    )
    return response
  } catch (error) {
    console.error(`Failed to update posting payment cost ${postingPaymentId}/${costId}:`, error)
    throw error
  }
}

export async function deletePostingPaymentCost(
  postingPaymentId: number,
  costId: number
): Promise<PostingPaymentCostDeleteResponse> {
  try {
    const response = await apiClient.delete<PostingPaymentCostDeleteResponse>(
      `/posting/payments/${postingPaymentId}/costs/${costId}`
    )
    return response
  } catch (error) {
    console.error(`Failed to delete posting payment cost ${postingPaymentId}/${costId}:`, error)
    throw error
  }
}

export async function postPostingOmzet(
  data: PostPostingOmzetRequest
): Promise<PostPostingOmzetResponse> {
  try {
    const response = await apiClient.post<PostPostingOmzetResponse>("/posting/omzet", data)
    return response
  } catch (error) {
    console.error("Failed to post omzet:", error)
    throw error
  }
}
