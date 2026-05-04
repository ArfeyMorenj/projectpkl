// Work Order Types & Interfaces

export interface WorkOrderTeamMember {
  id?: number
  team_member_id: number
  role:
    | 'implementor_1'
    | 'implementor_2'
    | 'programmer'
    | 'system_analyst'
    | 'supervisor'
    | 'client_spv'
  team_member?: {
    id: number
    code: string
    name: string
    position: string
    status: string
    is_active: boolean
  }
}

export interface WorkOrder {
  id: number
  number: string
  date: string
  date_install: string
  start_license: string
  client_id: number
  client_code?: string
  client_name?: string
  product_id: number
  product_code?: string
  product_name?: string
  version?: string | null
  item_id: number
  item_code?: string
  item_name?: string
  status: string
  amount: number | string
  description?: string | null
  item_count: number
  per_unit?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  cost?: number | string
  client?: {
    id: number
    code: string
    name: string
  }
  product?: {
    id: number
    code: string
    name: string
  }
  item?: {
    id: number
    code: string
    name: string
  }
  team?: WorkOrderTeamMember[]
}

export interface WorkOrderDetail extends WorkOrder {
  team: WorkOrderTeamMember[]
}

export interface CreateWorkOrderRequest {
  number: string
  date: string
  date_install: string
  start_license: string
  client_id: number
  product_id: number
  version?: string
  item_id: number
  status: string
  amount: number
  description?: string
  item_count: number
  per_unit?: string
  notes?: string
  team?: Array<{
    role: WorkOrderTeamMember['role']
    team_member_id: number
  }>
}

export interface UpdateWorkOrderRequest extends Partial<CreateWorkOrderRequest> {}

export interface AssignTeamRequest {
  team: Array<{
    role: WorkOrderTeamMember['role']
    team_member_id: number
  }>
}

// Response types
export interface WorkOrderResponse {
  id: number
  number: string
  date: string
  client_id: number
  client_name?: string
  client_code?: string
  product_id: number
  product_name?: string
  product_code?: string
  item_id: number
  item_name?: string
  item_code?: string
  amount: number | string
  status: string
  created_at: string
}

export interface WorkOrdersListResponse {
  success: boolean
  data: WorkOrder[]
  message?: string
}

export interface WorkOrdersSearchResponse {
  success: boolean
  data: WorkOrderResponse[]
  message?: string
}

export interface WorkOrderDetailResponse {
  success: boolean
  data: WorkOrderDetail
  message?: string
}

export interface WorkOrderSummary {
  total_work_orders: number
  by_status: Record<string, number>
  total_cost: number
  average_cost: number
}

export interface WorkOrderSummaryResponse {
  success: boolean
  data: WorkOrderSummary
  message?: string
}
