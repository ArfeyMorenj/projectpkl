# Module Integration Checklist

This checklist helps you systematically convert each module from static data to API calls.

## Module: {{ MODULE_NAME }}

### Step 1: Identify Static Data
- [ ] Find where data is initialized (usually in state: `useState(initialData)`)
- [ ] Identify the hardcoded data source (usually from `/lib/jpas/`)
- [ ] Note the data structure/types used

### Step 2: Identify Hooks Needed

**For View/List Operations:**
- [ ] `useClients()`, `useProducts()`, `useItems()`, etc.
  - Example: `const { data: response, loading, error } = useClients(page, limit)`

**For Create Operations:**
- [ ] `useCreateClient()`, `useCreateProduct()`, etc.
  - Example: `const { mutate: createClient, loading } = useCreateClient()`

**For Update Operations:**
- [ ] `useUpdateClient()`, `useUpdateProduct()`, etc.
  - Example: `const { mutate: updateClient, loading } = useUpdateClient()`

**For Delete Operations:**
- [ ] `useDeleteClient()`, `useDeleteProduct()`, etc.
  - Example: `const { mutate: deleteClient, loading } = useDeleteClient()`

### Step 3: Update Component

1. **Remove static data imports:**
   ```typescript
   // DELETE THIS:
   import { clientsMaster } from "@/lib/jpas/master-data"
   ```

2. **Add API hooks import:**
   ```typescript
   // ADD THIS:
   import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/lib/api/hooks"
   ```

3. **Remove useState for list data:**
   ```typescript
   // REPLACE THIS:
   const [clients, setClients] = useState<Client[]>(initialClientsData)
   
   // WITH THIS:
   const { data: clientsResponse, loading, error, refetch } = useClients(currentPage, 10)
   const clients = clientsResponse?.data || []
   ```

4. **Replace mutation handlers:**
   ```typescript
   // REPLACE: handleSaveClient = (formData) => { setClients([...]) }
   // WITH:
   const handleSaveClient = async (formData: any) => {
     try {
       if (selectedId) {
         await updateClient(selectedId, formData)
       } else {
         await createClient(formData)
       }
       refetch() // Refresh list
     } catch (err) {
       console.error("Save failed:", err)
     }
   }
   ```

5. **Replace delete handler:**
   ```typescript
   // REPLACE: handleDeleteClient = (id) => { setClients(oldClients.filter(...)) }
   // WITH:
   const handleDeleteClient = async (id: string) => {
     if (confirm("Delete this item?")) {
       try {
         await deleteClient(id)
         refetch()
       } catch (err) {
         console.error("Delete failed:", err)
       }
     }
   }
   ```

### Step 4: Add Loading/Error States

1. **Show loading spinner while fetching:**
   ```typescript
   if (loading) {
     return (
       <div className="flex items-center justify-center min-h-96">
         <Spinner />
       </div>
     )
   }
   ```

2. **Show error alert if fetch fails:**
   ```typescript
   if (error) {
     return (
       <Alert variant="destructive">
         <div>Error loading data: {error}</div>
       </Alert>
     )
   }
   ```

3. **Disable buttons during mutation:**
   ```typescript
   <Button 
     disabled={createLoading || updateLoading || deleteLoading}
     onClick={handleCreate}
   >
     {createLoading ? "Creating..." : "Create"}
   </Button>
   ```

### Step 5: Handle Pagination (if needed)

1. **Add page state:**
   ```typescript
   const [page, setPage] = useState(1)
   ```

2. **Update hook call:**
   ```typescript
   const { data: response } = useClients(page, 10)
   ```

3. **Add pagination UI:**
   ```typescript
   const totalPages = response?.pageInfo?.totalPages || 1
   
   return (
     <div>
       {/* Table */}
       
       {/* Pagination */}
       <div className="mt-4 flex gap-2">
         <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
           Previous
         </Button>
         <span>Page {page} of {totalPages}</span>
         <Button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
           Next
         </Button>
       </div>
     </div>
   )
   ```

### Step 6: Verify Type Compatibility

- [ ] Check response data types match what component expects
- [ ] Update TypeScript interfaces if needed
- [ ] Fix any type errors shown in IDE

### Step 7: Test Module

1. **Test Read Operations:**
   - [ ] Data loads when component mounts
   - [ ] Loading spinner appears while fetching
   - [ ] Data displays correctly in table/list
   - [ ] Search/filter still works with fetched data

2. **Test Create Operations:**
   - [ ] Add new item form opens
   - [ ] Form submits successfully
   - [ ] New item appears in list
   - [ ] List refreshes automatically

3. **Test Update Operations:**
   - [ ] Edit item form opens with current data
   - [ ] Form submits successfully
   - [ ] Item updates in list
   - [ ] List refreshes automatically

4. **Test Delete Operations:**
   - [ ] Delete confirmation appears
   - [ ] Item deleted from backend
   - [ ] Item removed from list
   - [ ] List refreshes automatically

5. **Test Error Handling:**
   - [ ] Invalid form shows error message
   - [ ] Network error shows error alert
   - [ ] Buttons disable during loading

### Step 8: Update Detail View (if applicable)

If module has a detail/modal view:

1. **Import mutation hooks in detail component:**
   ```typescript
   import { useCreateClient, useUpdateClient } from "@/lib/api/hooks"
   ```

2. **Update form submission:**
   ```typescript
   const { mutate: createClient, loading: createLoading } = useCreateClient()
   const { mutate: updateClient, loading: updateLoading } = useUpdateClient()
   
   const handleSubmit = async (formData) => {
     try {
       if (clientId) {
         await updateClient(clientId, formData)
       } else {
         await createClient(formData)
       }
       onSave?.() // Notify parent to refresh
     } catch (err) {
       console.error("Submit failed:", err)
     }
   }
   ```

### Step 9: Commit Changes

```bash
git add components/modules/YOUR-MODULE.tsx
git commit -m "refactor: integrate YOUR-MODULE with real API"
```

---

## Quick Reference: Hook Patterns

### Pattern 1: Simple List View
```typescript
const { data: response, loading, error } = useClients(1, 10)
const items = response?.data || []
```

### Pattern 2: Create with Refetch
```typescript
const { mutate: create, loading } = useCreateClient()
const { refetch } = useClients(1, 10)

await create(formData)
refetch()
```

### Pattern 3: Update with Optimistic UI
```typescript
const { mutate: update, loading } = useUpdateClient()

await update(id, formData)
// Component updates automatically from parent refetch
```

### Pattern 4: Delete with Confirmation
```typescript
const { mutate: delete: deleteItem, loading } = useDeleteClient()

if (confirm("Delete?")) {
  await deleteItem(id)
  refetch()
}
```

### Pattern 5: Search Filter on Client
```typescript
const [search, setSearch] = useState("")
const { data: response } = useClients(1, 10)
const items = (response?.data || [])
  .filter(item => 
    item.nama.toLowerCase().includes(search.toLowerCase())
  )
```

### Pattern 6: Pagination Navigation
```typescript
const [page, setPage] = useState(1)
const { data: response } = useClients(page, 10)
const hasNextPage = (response?.pageInfo?.currentPage || 1) < (response?.pageInfo?.totalPages || 1)
```

---

## Modules Checklist

- [ ] Clients Module
- [ ] Products Module
- [ ] Items Module
- [ ] Team Module
- [ ] Invoice Module
- [ ] Invoice Produk Module
- [ ] Receivables Module
- [ ] Invoice Register Module
- [ ] Fiscal Reports Module
- [ ] Payment Module
- [ ] Bank Module
- [ ] Setup Module
- [ ] Proteksi Module
- [ ] Installation Module
- [ ] Stop License Module
- [ ] Invoice History Module
- [ ] Bank Report Module
- [ ] Bank Register Module
- [ ] Client Receivables Detail Module
- [ ] Receivables Card Module
- [ ] Receivables By Item Module
- [ ] Nota Debet Kredit Module
- [ ] Payment Posting Module
- [ ] Dashboard Module
- [ ] Reports Module
- [ ] Work Order Module

---

## Tips & Troubleshooting

### Tip: Keep Detail Views Separate
- Keep detail/modal logic in separate component files
- Detail component receives data and mutation functions as props
- Parent component handles list logic and refetch

### Tip: Error Messages
- Always catch and log errors for debugging
- Show user-friendly error messages
- Use toast notifications for non-critical errors

### Tip: Loading States
- Disable form fields during submission
- Disable action buttons during mutation
- Show loading spinner for list loading
- Show "Loading..." text in buttons

### Troubleshooting: "Hook not found"
**Problem**: Import error for hook
```
Module not found: useSomeHook
```
**Solution**:
1. Check hook name in `/lib/api/hooks/index.ts`
2. Verify hook export exists
3. Check spelling matches exactly

### Troubleshooting: "Type mismatch"
**Problem**: Component expects different data structure
```
Property 'nama' does not exist on type 'any'
```
**Solution**:
1. Check API response structure in Postman
2. Update TypeScript interface in `/lib/api/types/`
3. Ensure hook returns correct type

### Troubleshooting: "Data not updating"
**Problem**: After create/update, list doesn't show new data
**Solution**:
1. Call `refetch()` after mutation
2. Or use parent component's state callback
3. Check mutation response status
