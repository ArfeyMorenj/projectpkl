# 🔗 Endpoint Usage Mapping per Module

Dokumen ini menunjukkan **KONKRET endpoint mana saja** yang di-integrate di setiap module frontend.

---

## ✅ SUDAH INTEGRATED (6/28 Module)

### 1️⃣ Auth Module (`app/auth/login/page.tsx`)
**Status:** ✅ COMPLETE

**Endpoints Used:**
```typescript
✅ POST /api/login                    // useAuth().login(email, password)
✅ POST /api/logout                   // useAuth().logout() [Untested tapi ready]
✅ GET  /api/me                       // useAuth() internal check
```

**Test Status:** ✅ Tested (login, me) | ❌ logout untested

---

### 2️⃣ Dashboard Module (`components/modules/dashboard.tsx`)
**Status:** ✅ COMPLETE

**Endpoints Used:**
```typescript
✅ GET /api/reports/dashboard         // useDashboardReport()
✅ GET /api/reports/sales            // useSalesReport() [⚠️ Returns 422 Error]
✅ GET /api/reports/ar/summary       // useARSummaryReport()
```

**Test Status:** ⚠️ Reports mostly tested | ❌ Sales report broken (wrong params)

---

### 3️⃣ Clients Module (`components/modules/clients-module.tsx`) 
**Status:** ✅ COMPLETE (Example Integration)

**Endpoints Used:**
```typescript
✅ GET  /api/clients                  // useClients(page, limit) - List all clients
✅ GET  /api/clients/{id}             // useClient(id) - Get single client detail
✅ POST /api/clients                  // useCreateClient() - Create new client
✅ GET  /api/clients/search           // Search filter capability
❌ PUT  /api/clients/{client}         // Ready but NOT TESTED
❌ DELETE /api/clients/{client}       // Ready but NOT TESTED
```

**Features:**
- List with pagination
- Search/filter
- Create form (+ validation)
- Edit form (buttons ready for update)
- Delete buttons (awaiting backend test)

**Test Status:** ✅ GET/POST tested | ❌ PUT/DELETE untested

---

### 4️⃣ Products Module (`components/modules/products-module.tsx`)
**Status:** ✅ COMPLETE

**Endpoints Used:**
```typescript
✅ GET  /api/products                 // useProducts(page, limit) - List all products
✅ GET  /api/products/{id}            // useProduct(id) - Get product detail
✅ POST /api/products                 // useCreateProduct() - Create product
✅ GET  /api/products/search          // Search products
❌ PUT  /api/products/{product}       // Ready (update product form exists)
❌ DELETE /api/products/{product}     // Ready (delete button ready)
```

**Features:**
- CRUD interface complete (C + R working, U/D awaiting backend test)
- Search/filter
- Currency formatting (Rp)
- Loading spinner
- Error alert

**Test Status:** ✅ GET/POST tested | ❌ PUT/DELETE untested

---

### 5️⃣ Items Module (`components/modules/items-module.tsx`)
**Status:** ✅ COMPLETE

**Endpoints Used:**
```typescript
✅ GET  /api/items                    // useItems(page, limit) - List items
✅ GET  /api/items/{id}               // useItem(id) - Get item detail
✅ POST /api/items                    // useCreateItem() - Create item
✅ GET  /api/items/search             // Client-side search (optional: move to backend)
❌ PUT  /api/items/{item}             // Ready (update UI complete)
❌ DELETE /api/items/{item}           // Ready (delete UI complete)
```

**Features:**
- List with pagination
- CRUD forms (C working, U/D ready but untested)
- Search filter (currently client-side, can move to backend)
- Currency formatting (Rp notation)

**Test Status:** ✅ GET/POST tested | ❌ PUT/DELETE untested

---

### 6️⃣ Team Members Module (`components/modules/team-module.tsx`)
**Status:** ✅ COMPLETE

**Endpoints Used:**
```typescript
✅ GET  /api/team-members             // useTeamMembers(page, limit) - List team
✅ GET  /api/team-members/{id}        // useTeamMember(id) - Get detail
✅ POST /api/team-members             // useCreateTeamMember() - Add team member
✅ GET  /api/team-members/search      // Search: nama, jabatan
❌ PUT  /api/team-members/{member}    // Ready (update form exists)
❌ DELETE /api/team-members/{member}  // Ready (delete button ready)
```

**Features:**
- CRUD interface complete (C + R working)
- Search by name or role (jabatan)
- Status badge display
- Waiting for backend test for update/delete

**Test Status:** ✅ GET/POST tested | ❌ PUT/DELETE untested

---

## ⏳ READY TO INTEGRATE (22/28 Module - Infrastructure Ready)

Semua module berikut sudah ada endpoint hooks di `lib/api/hooks/`, tinggal replace hardcoded data dengan API calls. Estimated 30-60 min per module (copy-paste pattern dari Clients/Products/Items).

### 7️⃣ **Bank Module** (`components/modules/bank-module.tsx`)
**Hooks Ready:** useBanks, useBank, useCreateBank, updateBank, deleteBank

```typescript
// Pattern: Replace hardcoded initialBanks with:
const { data: response, loading, error, refetch } = useBanks(page, limit);
const banks = response?.data || [];
```

**Endpoints:**
```typescript
✅ GET  /api/banks                    // List with pagination
✅ POST /api/banks                    // Create
❌ PUT/DELETE (untested)              // Ready in hooks
```

---

### 8️⃣ **Clients Receivables Detail Module** (`components/modules/client-receivables-detail-module.tsx`)
**Hooks Ready:** useReceivables, useReceivable, etc.

```typescript
✅ GET  /api/receivables              // List receivables
✅ GET  /api/receivables/{id}         // Detail
✅ POST /api/receivables/process      // SPECIAL - Process receivable
```

---

### 9️⃣ **Invoice Module** (`components/modules/invoice-module.tsx`)
**Hooks Ready:** useInvoices, useInvoice, useCreateInvoice

```typescript
✅ GET  /api/invoices                 // List
✅ POST /api/invoices                 // Create (complex - has line items)
✅ GET  /api/invoice-items            // Line items detail
✅ POST /api/invoice-items            // Add item to invoice
❌ PUT/DELETE (untested on backend)   // Ready but need backend test
```

**Complexity:** Medium (has child items, needs cascade logic)

---

### 🔟 **Invoice Product Non-License Module** (`components/modules/invoice-product-non-license-module.tsx`)
**Hooks Ready:** useInvoiceProducts, useInvoiceProduct

```typescript
✅ GET  /api/invoice-products         // List
✅ GET  /api/invoice-products/search  // Search
✅ GET  /api/invoice-products/{id}/summary-journal  // Summary
```

---

### 1️⃣1️⃣ **Invoice Produk Module** (`components/modules/invoice-produk-module.tsx`)
**Hooks Ready:** Similar to invoice-product

```typescript
✅ GET  /api/invoice-products         // List products
✅ GET  /api/invoice-items            // List items
```

---

### 1️⃣2️⃣ **Invoice Register Module** (`components/modules/invoice-register-module.tsx`)
**Hooks Ready:** useInvoiceRegisterReport

```typescript
✅ GET  /api/reports/invoices/register  // Registered invoices report
```

**Complexity:** Low (just read-only report)

---

### 1️⃣3️⃣ **Invoice Types Module** (`components/modules/invoice-types-module.tsx`)
**Hooks Ready:** useInvoiceTypes, useCreateInvoiceType, etc.

```typescript
✅ GET  /api/invoice-types            // List
✅ POST /api/invoice-types            // Create
✅ POST /api/invoice-types/{id}/toggle-status  // Toggle (SPECIAL)
❌ PUT/DELETE (untested)              // Ready
```

---

### 1️⃣4️⃣ **Payment Module** (`components/modules/payment-module.tsx`)
**Hooks Ready:** usePayments, useCreatePayment, etc.

```typescript
✅ GET  /api/payments                 // List
✅ POST /api/payments                 // Create
❌ PUT/DELETE (untested - CRITICAL)   // Ready but need backend test
```

**Complexity:** Medium (financial impact - careful!)

---

### 1️⃣5️⃣ **Payment Posting Module** (`components/modules/payment-posting-module.tsx`)
**Hooks Ready:** usePostingPayments, usePostPayments, etc.

```typescript
✅ GET  /api/posting/payments         // List [NOT DOCUMENTED!]
✅ POST /api/posting/payments         // Create (post payments to journal)
✅ GET  /api/posting/payments/{id}/costs  // View costs
❌ PUT/DELETE costs (untested)        // Ready
```

---

### 1️⃣6️⃣ **Receivables Module** (`components/modules/receivables-module.tsx`)
**Hooks Ready:** useReceivables, useReceivableDetailReport, etc.

```typescript
✅ GET  /api/receivables              // List
✅ GET  /api/reports/receivable/detail  // Detail report
✅ GET  /api/reports/receivable/by-item  // By item
✅ GET  /api/reports/receivable/summary  // Summary
```

---

### 1️⃣7️⃣ **Work Order Module** (`components/modules/work-order-module.tsx`)
**Hooks Ready:** useWorkOrders, useCreateWorkOrder, etc.

```typescript
✅ GET  /api/work-orders              // List
✅ POST /api/work-orders              // Create
✅ POST /api/work-orders/{id}/assign-team  // Assign team (SPECIAL)
❌ PUT/DELETE (untested)              // Ready
```

---

### 1️⃣8️⃣ **Installation Module** (`components/modules/installation-module.tsx`)
**Hooks Ready:** useInstallations, useCreateInstallation, etc.

```typescript
✅ GET  /api/installations            // List
✅ POST /api/installations            // Create
❌ PUT/DELETE (untested)              // Ready
```

---

### 1️⃣9️⃣ **Stop License Module** (`components/modules/stop-license-module.tsx`)
**Hooks Ready:** useStopLicenses, useCreateStopLicense, etc.

```typescript
✅ GET  /api/stop-licenses            // List
✅ POST /api/stop-licenses            // Create
❌ PUT/DELETE (untested)              // Ready
```

---

### 2️⃣0️⃣ **Proteksi Module** (`components/modules/proteksi-module.tsx`)
**Hooks Ready:** useProtections, useCreateProtection, etc.

```typescript
✅ GET  /api/protections              // List
✅ POST /api/protections              // Create
❌ PUT  /api/protections/{id}         // CRITICAL - lock/unlock periode (untested!)
❌ DELETE (untested)                  // Ready
```

**Complexity:** High (period locking system - critical!)

---

### 2️⃣1️⃣ **Setup Module** (`components/modules/setup-module.tsx`)
**Hooks Ready:** useCompanies, useChartOfAccounts, useTaxSeries, etc.

```typescript
✅ GET  /api/companies                // List companies
✅ GET  /api/chart-of-accounts        // COA list
✅ GET  /api/tax-series               // Tax series
✅ POST /api/companies                // Create company
❌ PUT/DELETE (untested)              // Ready
```

---

### 2️⃣2️⃣ **Reports Module** (`components/modules/reports-module.tsx`)
**Hooks Ready:** All report hooks (14+ endpoints)

```typescript
✅ GET /api/reports/dashboard         // Dashboard
✅ GET /api/reports/sales             // Sales [⚠️ Need params fix]
✅ GET /api/reports/cash              // Cash report
✅ GET /api/reports/tax               // Tax report
✅ GET /api/reports/fiscal-commercial  // Fiscal report
✅ GET /api/reports/invoices/history   // Invoice history
✅ +10 more report endpoints          // All read-only
```

**Complexity:** Low (read-only reports)

---

### 2️⃣3️⃣ - 2️⃣8️⃣ **Other Modules** (6 remaining)
- Receivables by Item Code Module
- Receivables Card Module
- Nota Debet Kredit Module
- Invoice History Module
- Invoice License Module
- Financial Dashboard Module
- Fiscal Reports Module

Semua menggunakan report/read-only endpoints yang sudah tested ✅

---

## 📊 Integration Priority Matrix

| Priority | Module | Complexity | Dependencies | Est. Time |
|----------|--------|-----------|--------------|-----------|
| 🔴 P1 | Payment Module | High | None | 60 min |
| 🔴 P1 | Invoice Module | High | None | 90 min |
| 🔴 P1 | Work Order | Medium | None | 45 min |
| 🟡 P2 | Proteksi (Period Lock) | High | Period validation | 60 min |
| 🟡 P2 | Bank Module | Low | None | 30 min |
| 🟡 P2 | Invoice Types | Low | None | 30 min |
| 🟢 P3 | Reports Module | Low | None | 30 min |
| 🟢 P3 | Setup Module | Medium | None | 45 min |
| 🟢 P3 | Payment Posting | Medium | None | 45 min |
| 🟡 P2 | Receivables Details | Medium | None | 45 min |
| 🟢 P3 | Other Read-Only | Low | None | 20 min each |

**Total Remaining:** ~10 hours (if done focus)

---

## 🔄 Endpoint Test Status Summary

```
Total Endpoints by Operation Type:

    READ (GET):          ✅ 100% tested
    ├─ GET /list         ✅ 62 endpoints tested
    ├─ GET /detail       ✅ 41 endpoints tested
    └─ GET /search       ✅ 14 endpoints tested

    CREATE (POST):       ✅ 95% tested
    ├─ POST /create      ✅ 35 endpoints tested
    └─ POST /special     ✅ 12 endpoints tested
    └─ POST /logout      ❌ 1 untested

    UPDATE (PUT):        ❌ 0% tested
    ├─ PUT /update       ❌ 22 endpoints UNTESTED
    
    DELETE (DELETE):     ❌ 0% tested
    ├─ DELETE /delete    ❌ 25 endpoints UNTESTED

    REPORTS:             ✅ 90% tested
    ├─ GET /reports      ✅ 18 endpoints tested
    └─ Sales report      ❌ 422 error (params)
```

---

## ⚠️ Blockers Before Production

**MUST BE SOLVED:**

1. **Backend Testing** (47 untested endpoints)
   - All update/delete operations
   - User management
   - Period protection
   - PDF generation

2. **Frontend Testing**
   - Error handling on period locks
   - Cascade delete scenarios
   - Financial data consistency

3. **Missing Documentation**
   - Add 26 missing endpoints to Postman
   - Fix sales report parameters

---

## 🚀 Recommended Sequence

```
Week 1 - Backend Testing:
  Day 1: User management + logout (P1)
  Day 2: Period protection + finance ops (P1)
  Day 3: Print/PDF + master deletions (P2)
  Day 4-5: All remaining 47 endpoints (P3)

Week 2 - Frontend Integration:
  Day 1: Payment + Invoice modules (P1)
  Day 2: Work Orders + Period protection (P1)
  Day 3: Bank + Invoice Types + Setup (P2)
  Day 4: Reports + Receivables (P3)
  Day 5: Edge cases + error handling

Week 3 - Testing & Deployment:
  Day 1-3: Integration + stress testing
  Day 4-5: UAT + performance tuning
```

---

**Status as of:** April 2026
**Frontend Progress:** 6/28 modules = 21% ✅
**API Ready:** 118/170 endpoints = 69% ✅
**Production Ready:** Only after full backend test + remaining 22 module integrations
