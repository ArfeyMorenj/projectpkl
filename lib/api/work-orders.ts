import { apiClient } from './client'
import type {
  WorkOrder,
  WorkOrderDetail,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  AssignTeamRequest,
  WorkOrderResponse,
  WorkOrdersListResponse,
  WorkOrdersSearchResponse,
  WorkOrderDetailResponse,
  WorkOrderSummary,
  WorkOrderSummaryResponse,
} from './types/work-orders'

function normalizeWorkOrder<T extends { amount?: number | string; cost?: number | string }>(
  workOrder: T
): T & { cost: number } {
  return {
    ...workOrder,
    cost: Number(workOrder.cost ?? workOrder.amount ?? 0),
  }
}

/**
 * Fetch all work orders with pagination
 */
export async function getWorkOrders(filters?: {
  status?: string
  client_id?: number
  from_date?: string
  to_date?: string
  page?: number
  per_page?: number
}): Promise<WorkOrder[]> {
  try {
    let url = '/work-orders'
    const params = new URLSearchParams()

    params.append('page', (filters?.page || 1).toString())
    params.append('per_page', (filters?.per_page || 10).toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_id) params.append('client_id', filters.client_id.toString())
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<WorkOrdersListResponse>(url)
    return (response.data || []).map((item) => normalizeWorkOrder(item))
  } catch (error) {
    console.error('Failed to fetch work orders:', error)
    throw error
  }
}

/**
 * Fetch single work order by ID
 */
export async function getWorkOrderById(id: number): Promise<WorkOrderDetail> {
  try {
    const response = await apiClient.get<WorkOrderDetailResponse>(`/work-orders/${id}`)
    return normalizeWorkOrder(response.data)
  } catch (error) {
    console.error(`Failed to fetch work order ${id}:`, error)
    throw error
  }
}

/**
 * Search work orders by query
 */
export async function searchWorkOrders(query: string): Promise<WorkOrderResponse[]> {
  if (!query || query.length < 2) return []

  try {
    let url = '/work-orders/search'
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.get<WorkOrdersSearchResponse>(url)
    return (response.data || []).map((item) => normalizeWorkOrder(item))
  } catch (error) {
    console.error('Failed to search work orders:', error)
    throw error
  }
}

/**
 * Create new work order
 */
export async function createWorkOrder(data: CreateWorkOrderRequest): Promise<WorkOrderDetail> {
  try {
    const response = await apiClient.post<WorkOrderDetailResponse>('/work-orders', data)
    return normalizeWorkOrder(response.data)
  } catch (error) {
    console.error('Failed to create work order:', error)
    throw error
  }
}

/**
 * Update existing work order
 */
export async function updateWorkOrder(
  id: number,
  data: UpdateWorkOrderRequest
): Promise<WorkOrderDetail> {
  try {
    const response = await apiClient.put<WorkOrderDetailResponse>(`/work-orders/${id}`, data)
    return normalizeWorkOrder(response.data)
  } catch (error) {
    console.error(`Failed to update work order ${id}:`, error)
    throw error
  }
}

/**
 * Delete work order (draft only)
 */
export async function deleteWorkOrder(id: number): Promise<void> {
  try {
    await apiClient.delete(`/work-orders/${id}`)
  } catch (error) {
    console.error(`Failed to delete work order ${id}:`, error)
    throw error
  }
}

/**
 * Assign team member to work order
 */
export async function assignTeamToWorkOrder(
  id: number,
  team: AssignTeamRequest['team']
): Promise<WorkOrderDetail> {
  try {
    const response = await apiClient.post<WorkOrderDetailResponse>(`/work-orders/${id}/assign-team`, {
      team,
    })
    return normalizeWorkOrder(response.data)
  } catch (error) {
    console.error(`Failed to assign team to work order ${id}:`, error)
    throw error
  }
}

/**
 * Get work order summary
 */
export async function getWorkOrderSummary(
  fromDate?: string,
  toDate?: string
): Promise<WorkOrderSummary> {
  try {
    const workOrders = await getWorkOrders({
      from_date: fromDate,
      to_date: toDate,
      page: 1,
      per_page: 1000,
    })

    const summary = workOrders.reduce<WorkOrderSummary>(
      (acc, item) => {
        acc.total_work_orders += 1
        acc.total_cost += Number(item.cost || item.amount || 0)
        acc.by_status[item.status] = (acc.by_status[item.status] || 0) + 1
        return acc
      },
      {
        total_work_orders: 0,
        by_status: {},
        total_cost: 0,
        average_cost: 0,
      }
    )

    summary.average_cost = summary.total_work_orders
      ? summary.total_cost / summary.total_work_orders
      : 0

    return summary
  } catch (error) {
    console.error('Failed to fetch work order summary:', error)
    return {
      total_work_orders: 0,
      by_status: {},
      total_cost: 0,
      average_cost: 0,
    }
  }
}
