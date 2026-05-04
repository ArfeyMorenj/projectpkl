# API Integration Guide

## Overview

This project now has a complete API abstraction layer that replaces all hardcoded data with real backend API calls. The infrastructure consists of:

- **ApiClient** - Low-level fetch wrapper with error handling
- **Type Definitions** - Full TypeScript types for all endpoints  
- **Custom Hooks** - Pre-built hooks for data fetching and mutations
- **Environment Configuration** - Configurable base URL

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_PATH=/api
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NEXT_PUBLIC_AUTH_USER_KEY=auth_user
```

### 2. Start Backend

Ensure your Laravel backend is running on `http://localhost:8000` with the API routes available at `/api`.

### 3. Authentication

The authentication is now integrated with the real backend API.

**Login Page** (`app/auth/login/page.tsx`):
- Updated to use `useAuth()` hook
- Makes real API call to `/login` endpoint
- Stores token in localStorage
- Auto-redirects on 401 (unauthorized)

**Demo Credentials:**
- Email: `admin@example.com`
- Password: `password`

## Using the API Hooks

### 1. Authentication Hook

```typescript
import { useAuth } from "@/lib/api/hooks"

export function MyComponent() {
  const { user, isAuthenticated, loading, login, logout, hasRole, hasPermission } = useAuth()

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  // Login
  const handleLogin = async () => {
    try {
      await login("email@example.com", "password")
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  // Logout
  const handleLogout = () => {
    logout()
  }

  // Check permissions
  if (hasRole("super_admin")) {
    // Show admin features
  }

  return (
    <div>
      Welcome, {user?.name}!
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
```

### 2. Master Data Hooks

```typescript
import { useClients, useProducts, useItems, useTeamMembers } from "@/lib/api/hooks"

export function MyComponent() {
  // Fetch clients (page 1, 10 per page)
  const { data: clientsResponse, loading, error, refetch } = useClients(1, 10)
  const clients = clientsResponse?.data || []

  // Fetch products
  const { data: productsResponse } = useProducts(1, 10)
  const products = productsResponse?.data || []

  // Fetch items
  const { data: itemsResponse } = useItems(1, 10)
  const items = itemsResponse?.data || []

  // Fetch team members
  const { data: teamResponse } = useTeamMembers(1, 10)
  const teamMembers = teamResponse?.data || []

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {clients.map((client) => (
        <li key={client.id}>{client.nama}</li>
      ))}
    </ul>
  )
}
```

### 3. Transaction Hooks

```typescript
import { useInvoices, usePayments, useWorkOrders } from "@/lib/api/hooks"

export function MyComponent() {
  // Fetch invoices
  const { data: invoicesResponse, loading, error, refetch } = useInvoices(1, 10)
  const invoices = invoicesResponse?.data || []

  // Fetch payments
  const { data: paymentsResponse } = usePayments(1, 10)
  const payments = paymentsResponse?.data || []

  // Fetch work orders
  const { data: workOrdersResponse } = useWorkOrders(1, 10)
  const workOrders = workOrdersResponse?.data || []

  return (
    <div>
      <h2>Invoices ({invoices.length})</h2>
      {/* render invoices */}
    </div>
  )
}
```

### 4. Create/Update/Delete Operations

```typescript
import { useCreateClient, useUpdateClient, useDeleteClient } from "@/lib/api/hooks"

export function ClientForm() {
  const { mutate: createClient, loading: createLoading } = useCreateClient()
  const { mutate: updateClient, loading: updateLoading } = useUpdateClient()
  const { mutate: deleteClient, loading: deleteLoading } = useDeleteClient()

  // Create
  const handleCreate = async () => {
    try {
      const result = await createClient({
        nama: "PT. Baru",
        alamat: "Jl. Merdeka No.1",
        telepon: "021-123456",
        npwp: "12.345.678.9-012.345"
      })
      console.log("Created:", result)
    } catch (error) {
      console.error("Create failed:", error)
    }
  }

  // Update
  const handleUpdate = async (clientId: string) => {
    try {
      const result = await updateClient(clientId, {
        nama: "PT. Updated",
        alamat: "Jl. Baru No.2"
      })
      console.log("Updated:", result)
    } catch (error) {
      console.error("Update failed:", error)
    }
  }

  // Delete
  const handleDelete = async (clientId: string) => {
    try {
      await deleteClient(clientId)
      console.log("Deleted successfully")
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  return (
    <div>
      <button onClick={handleCreate} disabled={createLoading}>
        {createLoading ? "Creating..." : "Create Client"}
      </button>
      <button onClick={() => handleUpdate("1")} disabled={updateLoading}>
        {updateLoading ? "Updating..." : "Update Client"}
      </button>
      <button onClick={() => handleDelete("1")} disabled={deleteLoading}>
        {deleteLoading ? "Deleting..." : "Delete Client"}
      </button>
    </div>
  )
}
```

### 5. Report Hooks

```typescript
import { useDashboardReport, useSalesReport, useReceivableDetailReport } from "@/lib/api/hooks"

export function ReportsComponent() {
  // Dashboard report
  const { data: dashboardData, loading: dashLoading } = useDashboardReport({
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  })

  // Sales report
  const { data: salesData, loading: salesLoading } = useSalesReport(1, 10, {
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  })

  // Receivable detail report
  const { data: receivableData } = useReceivableDetailReport(1, 10, {
    clientId: "1",
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  })

  return (
    <div>
      {dashboardData && <p>Total Revenue: {dashboardData.totalRevenue}</p>}
    </div>
  )
}
```

### 6. Using useFetch and useMutation (Advanced)

```typescript
import { useFetch, useMutation } from "@/lib/api/hooks"
import { ENDPOINTS } from "@/lib/api/endpoints"
import { apiClient } from "@/lib/api"

// Simple fetch
export function SimpleExample() {
  const { data, loading, error } = useFetch(ENDPOINTS.LOOKUPS.PROVINCES)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>Data: {JSON.stringify(data)}</div>
}

// Custom mutation
export function CustomMutation() {
  const { mutate, loading } = useMutation(async (formData) => {
    return await apiClient.post(ENDPOINTS.CLIENTS.CREATE, formData)
  })

  return (
    <button 
      onClick={() => mutate({ nama: "New Client" })}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create"}
    </button>
  )
}
```

## Example: Integrating a Module

Here's how to convert the Clients Module from static data to API calls:

### Before (Static Data)
```typescript
import { clientsMaster } from "@/lib/jpas/master-data"

const initialClientsData = clientsMaster.map((client, idx) => ({
  id: String(idx + 1).padStart(3, "0"),
  kode: client.code,
  nama: client.name,
  // ...
}))

export function ClientsModule() {
  const [clients, setClients] = useState(initialClientsData)
  // Manual CRUD operations
}
```

### After (API Integration)
```typescript
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/lib/api/hooks"

export function ClientsModule() {
  const { data: clientsResponse, loading, error, refetch } = useClients(1, 10)
  const clients = clientsResponse?.data || []
  
  const { mutate: createClient } = useCreateClient()
  const { mutate: updateClient } = useUpdateClient()
  const { mutate: deleteClient } = useDeleteClient()

  const handleSave = async (formData) => {
    try {
      await createClient(formData)
      refetch() // Refresh the list
    } catch (error) {
      console.error("Save failed:", error)
    }
  }
}
```

## Available Hooks

### Master Data Hooks
- `useClients(page, limit)`
- `useCreateClient()`
- `useUpdateClient()`
- `useDeleteClient()`
- `useProducts(page, limit)`
- `useCreateProduct()`
- `useUpdateProduct()`
- `useDeleteProduct()`
- `useItems(page, limit)`
- `useCreateItem()`
- `useUpdateItem()`
- `useDeleteItem()`
- `useTeamMembers(page, limit)`
- `useCreateTeamMember()`
- `useUpdateTeamMember()`
- `useDeleteTeamMember()`
- `useBanks(page, limit)` and mutations
- `useCompanies(page, limit)` and mutations
- `useInvoiceTypes(page, limit)` and mutations

### Transaction Hooks
- `useInvoices(page, limit)`
- `useCreateInvoice()`
- `useUpdateInvoice()`
- `useDeleteInvoice()`
- `usePayments(page, limit)` and mutations
- `useWorkOrders(page, limit)` and mutations
- `useStopLicenses(page, limit)` and mutations
- `useReceivables(page, limit)` and mutations
- `useDebitCreditNotes(page, limit)` and mutations

### Report Hooks
- `useDashboardReport(params)`
- `useSalesReport(page, limit, params)`
- `useReceivableDetailReport(page, limit, params)`
- `useReceivableSummaryReport(params)`
- `useReceivableAgeingReport(params)`
- `useInvoiceDetailReport(page, limit, params)`
- `usePaymentDetailReport(page, limit, params)`
- `useJournalReport(page, limit, params)`

### Utility Hooks
- `useFetch<T>(url)` - Generic fetch hook
- `useMutation<T>(fn)` - Generic mutation hook

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean
  message: string
  data: T | T[]
  pageInfo?: {
    currentPage: number
    perPage: number
    total: number
    totalPages: number
  }
}
```

## Error Handling

Errors are automatically handled by the ApiClient:

1. **Network Errors**: Displayed as toast notifications
2. **401 Unauthorized**: Auto-redirects to `/auth/login`
3. **Validation Errors**: Included in error response with `errors` field
4. **Server Errors**: Displayed as toast with error message

Custom error handling:

```typescript
const { data, error, loading } = useClients(1, 10)

useEffect(() => {
  if (error) {
    // Handle error
    console.error("Failed to load clients:", error)
  }
}, [error])
```

## Loading States

All hooks provide a `loading` state:

```typescript
const { data, loading } = useClients(1, 10)

if (loading) {
  return <Spinner /> // Show loading spinner
}

return <ClientsList data={data} />
```

## Pagination

Handle pagination with page and limit parameters:

```typescript
const [page, setPage] = useState(1)
const { data: response } = useClients(page, 10)

const totalPages = response?.pageInfo?.totalPages || 1

return (
  <div>
    <PaginationButtons 
      current={page}
      total={totalPages}
      onChange={setPage}
    />
  </div>
)
```

## Token Management

Token is automatically managed by the ApiClient:

- **Stored in**: localStorage (key: `auth_token`)
- **Sent in**: `Authorization: Bearer {token}` header
- **On logout**: Token is cleared automatically

## Troubleshooting

### API Connection Issues
**Problem**: "Failed to fetch from http://localhost:8000/api"

**Solution**:
1. Check Laravel backend is running: `php artisan serve`
2. Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check CORS configuration in Laravel
4. Test endpoint with curl: `curl http://localhost:8000/api/auth/me`

### 401 Unauthorized
**Problem**: Redirected to login unexpectedly

**Solution**:
1. Check token is valid: `localStorage.getItem('auth_token')`
2. Re-login with correct credentials
3. Check backend token expiration settings

### Module Not Working
**Problem**: Component shows "Error: ..."

**Solution**:
1. Check browser console for detailed error
2. Verify endpoint exists in backend Postman collection
3. Check request payload matches backend expectations
4. Test endpoint manually with Postman

## Progress Tracking

### Modules Updated to Use API ✅
- ✅ Authentication (`app/auth/login/page.tsx`)
- ✅ Dashboard (`app/page.tsx`)
- ✅ Clients Module (`components/modules/clients-module.tsx`)

### Modules Still Using Static Data (TODO)
- ⏳ Products Module
- ⏳ Items Module
- ⏳ Team Module
- ⏳ Invoice Module
- ⏳ Payments Module
- ⏳ Work Orders Module
- ⏳ All other 22 modules...

## Next Steps

1. **Environment Setup**
   ```bash
   # Copy template to create actual config
   cp .env.local.example .env.local
   
   # Edit .env.local with your backend URL
   ```

2. **Test Authentication**
   - Navigate to http://localhost:3000/auth/login
   - Login with provided credentials
   - Check localStorage for `auth_token`

3. **Integrate Next Module**
   - Choose a module (e.g., Products)
   - Replace static data with `useProducts()`, `useCreateProduct()`, etc.
   - Test create/edit/delete operations

4. **Backend Testing**
   - Ensure UPDATE/DELETE endpoints are tested
   - Current status: 80% tested (only GET/POST working)
   - Coordinate with backend team to complete testing

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review the actual hook implementation: `lib/api/hooks/`
3. Check API endpoint constants: `lib/api/endpoints.ts`
4. Review type definitions: `lib/api/types/`
