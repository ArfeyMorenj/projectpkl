# 📋 PANDUAN LENGKAP AUDIT & IMPLEMENTASI FITART JPAS

**Status Proyek:** 50% Complete (13 dari 26 modules)  
**Last Updated:** April 21, 2026  
**Compilation Status:** ⚠️ BROKEN (import errors)  
**Runtime Status:** 🟡 PARTIAL (beberapa fitur hilang)

---

## 📑 DAFTAR ISI

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Tech Stack & Arsitektur](#tech-stack--arsitektur)
3. [Status Proyek Lengkap](#status-proyek-lengkap)
4. [Bugs Kritis & Solusi](#bugs-kritis--solusi)
5. [Panduan Implementasi Modules](#panduan-implementasi-modules)
6. [Struktur File Standard](#struktur-file-standard)
7. [Checklist Fix Terlebih Dahulu](#checklist-fix-terlebih-dahulu)
8. [Roadmap Pengembangan](#roadmap-pengembangan)

---

## 🎯 RINGKASAN EKSEKUTIF

### Status Saat Ini
```
✅ 13 Modules selesai (50%)
🔧 5 Modules partial (19%)
❌ 8 Modules belum dimulai (31%)

📊 Total endpoints yang sudah jalan: ~90 dari 150+
⚠️ Compilation errors: 4 (import issues)
🔴 Critical bugs blocked: 3 files
```

### Modules Selesai (13)
1. ✅ Banks (CRUD + search + register + report)
2. ✅ Clients (CRUD + search + receivables views)
3. ✅ Products (CRUD + search) - partial groups
4. ✅ Items (CRUD + search)
5. ✅ Team Members (CRUD + search)
6. ✅ Receivables (Read-only + summary)
7. ✅ Invoices (Complex CRUD + posting + nested items)
8. ✅ Work Orders (CRUD + team assignment)
9. ✅ Payments (CRUD + posting + reversal)
10. ✅ Stop Licenses (CRUD + search)
11. ✅ Installations (CRUD - search missing)
12. ✅ Licenses (CRUD - search missing)
13. ✅ Debit/Credit Notes (CRUD + type-aware + journal summary)

### Modules Belum Dimulai (8)
- ❌ Invoice Types (05)
- ❌ Users Management (07)
- ❌ Companies (08)
- ❌ Product Groups (10)
- ❌ Master Item Products (11)
- ❌ Posting (21)
- ❌ Journals (22)
- ❌ Reports (23)

---

## 🏗️ TECH STACK & ARSITEKTUR

### Frontend Stack
```
Framework       : Next.js 16.0.7 + React 19.2.0
Routing         : App Router (files in /app)
Language        : TypeScript (strict mode)
HTTP Client     : Custom ApiClient with Fetch API
State Management: React hooks (useState, useContext)
UI Components   : Radix UI + shadcn/ui
Styling         : Tailwind CSS v3
Forms          : React Hook Form + validation
Toast Notif     : Sonner library
Charts         : Recharts
Authentication  : Custom Bearer Token (localStorage-based)
```

### Backend Integration
```
Base URL        : http://localhost:8000/api
Auth Method     : Authorization: Bearer {token}
Response Format : { success, data, message, errors }
Error Handling  : 423 (locked), 422 (validation), 500 (server)
Period Lock     : Returns 423 when period locked
```

### Struktur Folder
```
/lib
  /api
    /types            ← TypeScript interfaces untuk setiap module
    /hooks            ← Custom React hooks (queries + mutations)
    banks.ts          ← API functions (GET/POST/PUT/DELETE)
    clients.ts
    products.ts
    ... (semua modules)
    client.ts         ← Core API client class
    endpoints.ts      ← Constants untuk semua endpoints
    index.ts          ← Barrel export semua functions & types

/components
  /modules            ← UI components untuk setiap module
    banks-module.tsx
    clients-module.tsx
    ... (semua modules)
  /forms              ← Reusable form components
    bank-form.tsx
    ... (forms untuk setiap module)
  /layout
  /ui                 ← shadcn base components

/app
  /auth
    /login            ← Login page
  layout.tsx
  page.tsx            ← Main dashboard (semua modules di dalam ini)
  client-layout.tsx   ← Client-side layout wrapper
```

### Design Pattern yang Digunakan
```
API Service Pattern:
  lib/api/[module].ts
    → 6 async functions (get, getById, search, create, update, delete)
    → URLSearchParams untuk query params
    → Error handling dengan try-catch
    → Return unwrapped data (response.data)

Custom Hooks Pattern:
  lib/api/hooks/use-[module].ts
    → useQueries: useFetch() untuk GET
    → useMutations: useMutation() untuk POST/PUT/DELETE
    → Return: { data, loading, error, mutate/refetch }
    → Debounce search (300ms)
    → Toast notifications on success/error

Module UI Pattern:
  components/modules/[module]-module.tsx
    → Summary cards (totals, counts, status breakdown)
    → Filter & search bar
    → Data table/list dengan paginate
    → CRUD dialogs (create, edit, delete, detail)
    → Status badges dengan colors
    → Currency formatting (Rp)
```

---

## 📊 STATUS PROYEK LENGKAP

### Detail Setiap Module

#### ✅ MODULE 01: AUTH
```
Status: 🔧 PARTIAL (50%)

Completed:
  ✅ lib/api/hooks/auth-context.tsx - Token management
  ✅ lib/api/hooks/use-auth.ts - useAuth() hook
  ✅ /auth/login - Login page exists

Missing:
  ❌ lib/api/auth.ts - API functions (login/logout/me)
  ❌ lib/api/types/auth.ts - Type definitions
  ❌ Register page
  ❌ Forgot password page
  ❌ Role-based access control (frontend)
  ❌ middleware.ts - Route protection

Endpoints not implemented:
  - POST /api/login
  - POST /api/logout
  - GET /api/me
```

#### ✅ MODULE 02: LOOKUPS & SEARCHES
```
Status: ✅ DONE (95%)

All search endpoints work:
  ✅ /api/banks/search
  ✅ /api/clients/search
  ✅ /api/products/search
  ✅ /api/items/search
  ✅ /api/team-members/search
  ✅ All other search endpoints

Implemented in:
  - Debounced search in all modules (300ms)
  - Min 2 characters required
  - Results shown in dropdowns/form selections
```

#### ✅ MODULE 03: SETUP (Tax Series & Settings)
```
Status: 🔧 PARTIAL (40%)

Completed:
  ⚠️ setup-module.tsx exists but incomplete
  ⚠️ Tax series endpoints not fully implemented

Missing:
  ❌ lib/api/tax-series.ts API functions
  ❌ lib/api/types/tax-series.ts
  ❌ Complete tax series CRUD
  ❌ Company settings CRUD

Endpoints:
  - GET /api/tax-series
  - POST /api/tax-series
  - POST /api/tax-series/:id/next
  - DELETE /api/tax-series/:id
  - GET/POST /api/company/settings
```

#### ✅ MODULE 04: BANKS
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/banks.ts
  ✅ lib/api/banks.ts
  ✅ lib/api/hooks/use-banks.ts
  ✅ components/modules/bank-module.tsx
  ✅ components/modules/bank-register-module.tsx
  ✅ components/modules/bank-report-module.tsx
  ✅ forms/bank-form.tsx

Features:
  ✅ CRUD operations (create, read, update, delete)
  ✅ Search dengan debounce
  ✅ Bank register view (by date + bank code)
  ✅ Bank report view
  ✅ Status indicators
  ✅ Account codes & COA mapping

API Functions (6):
  ✅ getBanks()
  ✅ getBankById(id)
  ✅ searchBanks(query)
  ✅ createBank(data)
  ✅ updateBank(id, data)
  ✅ deleteBank(id)
```

#### ❌ MODULE 05: INVOICE TYPES
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/invoice-types.ts
  ❌ lib/api/invoice-types.ts
  ❌ lib/api/hooks/use-invoice-types.ts
  ❌ components/modules/invoice-types-module.tsx
  ❌ components/forms/invoice-types-form.tsx

Endpoints needed:
  - GET /api/invoice-types
  - GET /api/invoice-types/:id
  - GET /api/invoice-types/search?q=
  - POST /api/invoice-types
  - PUT /api/invoice-types/:id
  - POST /api/invoice-types/:id/toggle-status
  - DELETE /api/invoice-types/:id (BLOCKED - no Postman response)

Features:
  - CRUD with toggle-status action
  - Locked invoice types can't be deleted
  - License type flag
```

#### ✅ MODULE 06: ITEMS
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/items.ts
  ✅ lib/api/items.ts
  ✅ lib/api/hooks/use-items.ts (HAS ERROR: use-mutation import)
  ✅ components/modules/items-module.tsx
  ✅ components/forms/items-form.tsx

API Functions (6):
  ✅ getItems()
  ✅ getItemById(id)
  ✅ searchItems(query)
  ✅ createItem(data)
  ✅ updateItem(id, data)
  ✅ deleteItem(id)

⚠️ Known Issues:
  - use-items.ts line 10: Cannot find './use-mutation'
  - Item form validation incomplete
```

#### ❌ MODULE 07: USERS
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/users.ts
  ❌ lib/api/users.ts
  ❌ lib/api/hooks/use-users.ts
  ❌ components/modules/users-module.tsx
  ❌ components/forms/users-form.tsx

Role: super_admin only

Endpoints needed:
  - GET /api/users
  - GET /api/users/:id
  - POST /api/users
  - PUT /api/users/:id
  - DELETE /api/users/:id
  - POST /api/users/:id/assign-role
  - POST /api/users/:id/toggle-status
```

#### ❌ MODULE 08: COMPANIES
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/companies.ts
  ❌ lib/api/companies.ts
  ❌ lib/api/hooks/use-companies.ts
  ❌ components/modules/companies-module.tsx
  ❌ components/forms/companies-form.tsx

Role: super_admin only

Endpoints needed:
  - GET /api/companies
  - GET /api/companies/:id
  - GET /api/companies/search?q=
  - POST /api/companies
  - PUT /api/companies/:id
  - DELETE /api/companies/:id

Fields:
  id, name, code, address, phone, email, npwp,
  created_at, updated_at, deleted_at
```

#### ✅ MODULE 09: CLIENTS
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/clients.ts
  ✅ lib/api/clients.ts
  ✅ lib/api/hooks/use-clients.ts
  ✅ components/modules/clients-module.tsx
  ✅ components/forms/clients-form.tsx
  ✅ components/modules/client-receivables-detail-module.tsx
  ✅ components/modules/receivables-card-module.tsx

API Functions (6):
  ✅ getClients()
  ✅ getClientById(id)
  ✅ searchClients(query)
  ✅ createClient(data)
  ✅ updateClient(id, data)
  ✅ deleteClient(id)

Extra Features:
  ✅ Receivables by client card view
  ✅ Client detail with transaction history
  ✅ Credit term days configuration
  ✅ Tax info fields (NPWP, NPKP, tax address)
```

#### 🔧 MODULE 10: PRODUCTS & PRODUCT GROUPS
```
Status: 🔧 PARTIAL (60%)

Products - ✅ DONE:
  ✅ lib/api/types/products.ts
  ✅ lib/api/products.ts
  ✅ lib/api/hooks/use-products.ts
  ✅ components/modules/products-module.tsx
  ✅ components/forms/products-form.tsx

  API Functions (6):
    ✅ getProducts()
    ✅ getProductById(id)
    ✅ searchProducts(query)
    ✅ createProduct(data)
    ✅ updateProduct(id, data)
    ✅ deleteProduct(id)

Product Groups - ❌ MISSING:
  ❌ lib/api/types/product-groups.ts
  ❌ lib/api/product-groups.ts
  ❌ lib/api/hooks/use-product-groups.ts
  ❌ components/modules/product-groups-module.tsx

Fields for groups:
  id, code, name, created_at, updated_at
```

#### ❌ MODULE 11: MASTER ITEM PRODUCTS
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/master-item-products.ts
  ❌ lib/api/master-item-products.ts
  ❌ lib/api/hooks/use-master-item-products.ts
  ❌ components/modules/master-item-products-module.tsx

Endpoints needed:
  - GET /api/master-item-products
  - GET /api/master-item-products/:id
  - GET /api/master-item-products/search?q=
  - POST /api/master-item-products
  - POST /api/master-item-products/:id/toggle-status
  - PUT /api/master-item-products/:id
  - DELETE /api/master-item-products/:id

Note: Master item products = kombinasi item + product untuk invoice items
```

#### ✅ MODULE 12: TEAM MEMBERS
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/team-members.ts
  ✅ lib/api/team-members.ts
  ✅ lib/api/hooks/use-team-members.ts (HAS ERROR: use-mutation import)
  ✅ components/modules/team-module.tsx
  ✅ components/forms/team-member-form.tsx

API Functions (6):
  ✅ getTeamMembers()
  ✅ getTeamMemberById(id)
  ✅ searchTeamMembers(query)
  ✅ createTeamMember(data)
  ✅ updateTeamMember(id, data)
  ✅ deleteTeamMember(id)

⚠️ Known Issues:
  - use-team-members.ts line 10: Cannot find './use-mutation'
```

#### ✅ MODULE 13: WORK ORDERS
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/work-orders.ts
  ✅ lib/api/work-orders.ts
  ✅ lib/api/hooks/use-work-orders.ts
  ✅ components/modules/work-order-module.tsx
  ✅ components/forms/work-order-form.tsx

API Functions (8):
  ✅ getWorkOrders()
  ✅ getWorkOrderById(id)
  ✅ searchWorkOrders(query)
  ✅ createWorkOrder(data)
  ✅ updateWorkOrder(id, data)
  ✅ deleteWorkOrder(id)
  ✅ assignTeamToWorkOrder(id, teamMemberId, role)
  ✅ getWorkOrderSummary(id)

Features:
  ✅ Team assignment (implementator, programmer, etc)
  ✅ Status tracking (draft, in_progress, completed)
  ✅ License start date
  ✅ Summary cards by status
```

#### ✅ MODULE 14: INSTALLATIONS
```
Status: ✅ DONE (95%)

Files:
  ✅ lib/api/types/installations.ts
  ✅ lib/api/installations.ts
  ✅ lib/api/hooks/use-installations.ts
  ✅ components/modules/installation-module.tsx
  ✅ components/forms/installation-form.tsx

API Functions (5):
  ✅ getInstallations()
  ✅ getInstallationById(id)
  ✅ createInstallation(data)
  ✅ updateInstallation(id, data)
  ✅ deleteInstallation(id)

⚠️ Missing:
  ❌ searchInstallations() function
  → Add search endpoint: GET /api/installations/search?q=

Features:
  ✅ Status tracking (draft, completed)
  ✅ Date tracking
  ✅ Summary by status
```

#### ✅ MODULE 15: LICENSES & STOP LICENSES
```
Status: ✅ DONE (98%)

Licenses:
  ✅ lib/api/types/licenses.ts
  ✅ lib/api/licenses.ts
  ✅ lib/api/hooks/use-licenses.ts
  ✅ components/modules/licenses-module.tsx
  ✅ components/forms/licenses-form.tsx

  API Functions (5):
    ✅ getLicenses()
    ✅ getLicenseById(id)
    ✅ createLicense(data)
    ✅ updateLicense(id, data)
    ✅ deleteLicense(id)
  
  ⚠️ Missing: searchLicenses()
  
  Features:
    ✅ Status (active, expired, stopped)
    ✅ Period display with date range
    ✅ Currency formatting (Rp)
    ✅ Summary by status

Stop Licenses:
  ✅ lib/api/types/stop-licenses.ts
  ✅ lib/api/stop-licenses.ts
  ✅ lib/api/hooks/use-stop-licenses.ts
  ✅ components/modules/stop-license-module.tsx
  ✅ components/forms/stop-license-form.tsx

  API Functions (6):
    ✅ getStopLicenses()
    ✅ getStopLicenseById(id)
    ✅ searchStopLicenses(query)
    ✅ createStopLicense(data)
    ✅ updateStopLicense(id, data)
    ✅ deleteStopLicense(id)

  Features:
    ✅ Full search support
    ✅ Status indicators
    ✅ Date tracking
```

#### ✅ MODULE 16: INVOICES
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/invoices.ts
  ✅ lib/api/invoices.ts
  ✅ lib/api/hooks/use-invoices.ts (HAS ERROR: use-mutation import)
  ✅ components/modules/invoice-module.tsx
  ✅ components/modules/invoice-register-module.tsx
  ✅ components/modules/invoice-history-module.tsx
  ✅ components/modules/invoice-product-non-license-module.tsx
  ✅ components/forms/invoice-form.tsx

API Functions (8):
  ✅ getInvoices(filters)
  ✅ getInvoiceById(id)
  ✅ searchInvoices(query)
  ✅ createInvoice(data)
  ✅ updateInvoice(id, data)
  ✅ deleteInvoice(id)
  ✅ postInvoice(id, periodId)
  ✅ generateInvoiceNumber(prefix)

Features:
  ✅ Nested items with unit pricing
  ✅ Status tracking (draft, posted, paid, partial)
  ✅ Tax/PPn handling
  ✅ Journal posting with period lock check (423 error)
  ✅ Multiple invoice types (license, product, etc)
  ✅ Discount & tax calculations
  ✅ Register view (by date)
  ✅ History view (past invoices)

⚠️ Issue:
  - use-invoices.ts line 11: Cannot find './use-mutation'
  - Period lock error handling works but could be better
```

#### ✅ MODULE 17: INVOICE ITEMS
```
Status: 🔧 PARTIAL (60%)

Files:
  ✅ Types defined in invoices.ts (InvoiceItem)
  ⚠️ No separate API file
  ⚠️ No separate hooks file
  ✅ Form integration in invoice-form.tsx

Endpoints (should be separate):
  - GET /api/invoice-items
  - GET /api/invoice-items/:id
  - POST /api/invoice-items (period.unlocked)
  - PUT /api/invoice-items/:id (period.unlocked)
  - DELETE /api/invoice-items/:id (period.unlocked)

Issue: Items are nested in invoice module, not separate
Should be: Separate lib/api/invoice-items.ts file
```

#### ✅ MODULE 18: PAYMENTS
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/payments.ts
  ✅ lib/api/payments.ts
  ✅ lib/api/hooks/use-payments.ts
  ✅ components/modules/payment-module.tsx
  ✅ components/modules/payment-posting-module.tsx
  ✅ components/forms/payment-form.tsx

API Functions (8):
  ✅ getPayments(filters)
  ✅ getPaymentById(id)
  ✅ searchPayments(query)
  ✅ createPayment(data)
  ✅ updatePayment(id, data)
  ✅ deletePayment(id)
  ✅ postPayment(id, periodId)
  ✅ getPaymentSummary()

Features:
  ✅ Payment methods (cash, check, transfer, credit_card, other)
  ✅ Status tracking (draft, posted, reversed, cancelled)
  ✅ Invoice-to-payment mapping
  ✅ Journal posting with period lock
  ✅ Payment summary breakdown by method & status
  ✅ Reversal endpoint
  ✅ Posting module with detailed form
```

#### ✅ MODULE 19: DEBIT/CREDIT NOTES
```
Status: ✅ DONE (100%)

Files:
  ✅ lib/api/types/debit-credit-notes.ts
  ✅ lib/api/debit-credit-notes.ts
  ✅ lib/api/hooks/use-debit-credit-notes.ts
  ✅ components/modules/debit-credit-note-module.tsx
  ✅ components/modules/nota-debet-kredit-module.tsx (legacy)
  ✅ components/forms/debit-credit-note-form.tsx

API Functions (7):
  ✅ getDebitCreditNotes(filters)
  ✅ getDebitCreditNoteById(id)
  ✅ searchDebitCreditNotes(filters)
  ✅ createDebitCreditNote(data)
  ✅ updateDebitCreditNote(id, data)
  ✅ deleteDebitCreditNote(id)
  ✅ getDebitCreditNoteSummary(id)

Features:
  ✅ Type-aware (D = Debet, K = Kredit/Credit)
  ✅ Nested items with DPP/PPN separation
  ✅ Auto-journal option
  ✅ Toggle posted status
  ✅ GL summary view
  ✅ Type-aware toast messages
  ✅ Summary cards by type & status
```

#### ✅ MODULE 20: RECEIVABLES
```
Status: ✅ DONE (90%)

Files:
  ✅ lib/api/types/receivables.ts
  ✅ lib/api/receivables.ts
  ✅ lib/api/hooks/use-receivables.ts
  ✅ components/modules/receivables-module.tsx
  ✅ components/modules/receivables-card-module.tsx
  ✅ components/modules/receivables-by-item-code-module.tsx
  ✅ components/modules/client-receivables-detail-module.tsx

API Functions (4):
  ✅ getReceivables(filters)
  ✅ getReceivableById(id)
  ✅ searchReceivables(query)
  ✅ getReceivablesSummary()

Features:
  ✅ Read-only module (no mutations)
  ✅ Aging analysis (30/60/90 days)
  ✅ By client receivables card
  ✅ By item code breakdown
  ✅ Summary totals (amount, paid, outstanding)
  ✅ Multiple views (table, card, detail)

⚠️ Missing:
  ❌ Process endpoint: POST /api/receivables/process
  → For recording customer payments against invoices
```

#### ❌ MODULE 21: POSTING (OMZET & PAYMENTS)
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/posting.ts
  ❌ lib/api/posting.ts
  ❌ lib/api/hooks/use-posting.ts
  ❌ components/modules/posting-* modules

Endpoints needed:
  - POST /api/posting/omzet (period.unlocked)
  - POST /api/posting/payments (period.unlocked)
  - GET /api/posting/payments
  - GET /api/posting/payments/search?q=
  - GET /api/posting/payments/:id
  - GET /api/posting/payments/:id/summary-journal
  - GET /api/posting/payments/:id/costs
  - POST /api/posting/payments/:id/costs (period.unlocked)
  - PUT /api/posting/payments/:id/costs/:cost (period.unlocked)
  - DELETE /api/posting/payments/:id/costs/:cost (period.unlocked)

Complexity: High (GL posting, cost tracking, multi-step posting)
```

#### ❌ MODULE 22: JOURNALS
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/journals.ts
  ❌ lib/api/hooks/use-journals.ts
  ❌ components/modules/journals-module.tsx

Endpoint:
  - GET /api/journals

Purpose: Display GL journal entries (read-only)
```

#### ❌ MODULE 23: REPORTS (18 Endpoints)
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/reports.ts
  ❌ lib/api/reports.ts
  ❌ lib/api/hooks/use-reports.ts
  ❌ components/modules/reports-* modules (18 separate reports)

Endpoints (18 total):
  - GET /api/reports/dashboard
  - GET /api/reports/ar/summary
  - GET /api/reports/ar/ledger
  - GET /api/reports/invoices/register
  - GET /api/reports/invoices/history
  - GET /api/reports/tax
  - GET /api/reports/tax/vat
  - GET /api/reports/tax/summary
  - GET /api/reports/sales
  - GET /api/reports/sales/summary
  - GET /api/reports/sales/client
  - GET /api/reports/cash
  - GET /api/reports/fiscal-commercial
  - GET /api/reports/receivable/by-item
  - GET /api/reports/receivable/data
  - GET /api/reports/receivable/process-detail
  - GET /api/reports/receivable/summary
  - GET /api/reports/receivable/detail

Complexity: Very High (18 different report formats)
Recommendation: Create 1 module for all reports with tabs/sections
```

#### ❌ MODULE 24: PRINT & PDF
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/print.ts
  ❌ lib/api/hooks/use-print.ts
  ❌ Print components for each document

Endpoints:
  - GET /api/print/invoices/batch
  - POST /api/print/invoices/batch
  - GET /api/print/invoices/:id/pdf
  - GET /api/print/receipts/:postingPayment/pdf

Implementation: Binary response handling, blob URLs, window.open
```

#### ✅ MODULE 25: PROTECTIONS (Period Lock)
```
Status: ✅ DONE (90%)

Files:
  ✅ components/modules/proteksi-module.tsx

⚠️ Missing:
  ❌ lib/api/types/protections.ts
  ❌ lib/api/protections.ts
  ❌ lib/api/hooks/use-protections.ts

Endpoints:
  - GET /api/protections
  - GET /api/protections/:id
  - POST /api/protections
  - PUT /api/protections/:id
  - DELETE /api/protections/:id (BLOCKED - no response)

Fields:
  id, period, is_protected, protected_at, protected_by,
  created_at, updated_at

Purpose: Lock periods to prevent new entries in that month
Used by: All write endpoints return 423 when period locked
```

#### ❌ MODULE 26: RECURRING INVOICES
```
Status: ❌ NOT STARTED (0%)

Missing:
  ❌ lib/api/types/recurring.ts
  ❌ lib/api/recurring.ts
  ❌ lib/api/hooks/use-recurring.ts
  ❌ modules/recurring-invoice-module.tsx

Endpoint:
  - POST /api/recurring/invoices/generate (period.unlocked)

Purpose: Auto-generate invoices from recurring templates
```

---

## 🔴 BUGS KRITIS & SOLUSI

### Bug #1: use-mutation Import Error (CRITICAL)
**File affected:** 3 files
```
❌ lib/api/hooks/use-items.ts:10
❌ lib/api/hooks/use-team-members.ts:10
❌ lib/api/hooks/use-invoices.ts:11

Error: Cannot find module './use-mutation'
```

**Root Cause:**
These files import from `./use-mutation` but file doesn't exist or is located elsewhere.

**Solution:**
Check if `use-fetch.ts` has useMutation export. If yes:
```typescript
// CHANGE FROM:
import { useMutation } from './use-mutation'

// CHANGE TO:
import { useFetch, useMutation } from './use-fetch'
```

If use-fetch.ts doesn't export useMutation, create it:
```typescript
// lib/api/hooks/use-mutation.ts
export function useMutation<TData, TVariables>() {
  // Implementation based on use-fetch.ts pattern
}
```

---

### Bug #2: Export Conflicts in hooks/index.ts (HIGH)
**File:** lib/api/hooks/index.ts

**Error:**
```
Module './use-master-data' has already exported a member named
'useBanks', 'useBankDetail', 'useClients', etc.
```

**Root Cause:**
Both `use-master-data.ts` and individual `use-banks.ts`, `use-clients.ts` export same function names.

**Solution:**
Remove conflicting exports from `use-master-data`:
```typescript
// BEFORE (lib/api/hooks/index.ts):
export * from './use-master-data'  // ← REMOVE THIS
export * from './use-banks'        // ← KEEP THIS
export * from './use-clients'      // ← KEEP THIS
export * from './use-items'        // ← KEEP THIS
export * from './use-products'     // ← KEEP THIS
export * from './use-team-members' // ← KEEP THIS

// AFTER: Only keep individual exports
```

Or separate concerns in use-master-data:
```typescript
// lib/api/hooks/use-master-data.ts
// Remove bank/client/product/item/team functions
// Keep only non-conflicting lookups
```

---

### Bug #3: Missing middleware.ts (HIGH)
**Issue:** No route protection, no auth verification

**Solution:**
Create `middleware.ts` in root:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  
  // Protect all routes except /auth
  if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged-in users from /auth back to /
  if (token && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static).*)']
}
```

---

### Bug #4: Missing Search Functions
**Files affected:**
- `lib/api/installations.ts` - no searchInstallations()
- `lib/api/licenses.ts` - no searchLicenses()

**Solution:**
Add search functions:
```typescript
// lib/api/installations.ts
export async function searchInstallations(query: string): Promise<Installation[]> {
  if (!query || query.length < 2) return []
  
  try {
    let url = '/installations/search'
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    const response = await apiClient.get<InstallationSearchResponse>(url)
    return response.data || []
  } catch (error) {
    console.error('Error searching installations:', error)
    throw error
  }
}
```

Also add hooks for search:
```typescript
// lib/api/hooks/use-installations.ts
export function useInstallationsSearch(searchTerm: string) {
  const [debouncedTerm, setDebouncedTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const url = debouncedTerm.length >= 2
    ? `/installations/search?q=${encodeURIComponent(debouncedTerm)}`
    : null

  return useFetch<Installation[]>(url, { skip: !url })
}
```

---

## 📋 CHECKER BAGANKAN FIX TERLEBIH DAHULU

Sebelum mulai modules baru, **WAJIB** fix bugs ini dulu:

```
PRIORITY 1 (Breaking compilation):
☐ Fix use-mutation import di 3 files
  - lib/api/hooks/use-items.ts
  - lib/api/hooks/use-team-members.ts
  - lib/api/hooks/use-invoices.ts

☐ Fix export conflicts di hooks/index.ts
  - Resolve use-master-data duplication

PRIORITY 2 (Critical functionality):
☐ Create middleware.ts
  - Add auth route protection
  - Redirect logic for auth routes

☐ Add search functions
  - searchInstallations() in installations.ts
  - searchLicenses() in licenses.ts
  - Add hooks untuk search

PRIORITY 3 (Period lock handling):
☐ Add 423 error handling ke debit-credit-notes.ts
  - Currently only in invoices.ts & payments.ts

☐ Add role-based access control
  - Frontend module visibility checks
  - Role guard components

PRIORITY 4 (Type safety):
☐ Fix TypeScript errors di invoice hooks
  - Parameter implicit typing issues
  - Error parameter typing

☐ Complete auth types
  - Create lib/api/types/auth.ts
  - Define User, LoginResponse, etc
```

---

## 🎯 PANDUAN IMPLEMENTASI MODULES

### Struktur Standard untuk Module Baru

Setiap module baru harus mengikuti pattern ini (5 files per module):

#### 1. Type Definitions (lib/api/types/[module].ts)
```typescript
// lib/api/types/invoice-types.ts

// Main data interface
export interface InvoiceType {
  id: number
  code: string
  name: string
  is_license: boolean
  auto_create_number: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Request/Response interfaces
export interface CreateInvoiceTypeRequest {
  code: string
  name: string
  is_license: boolean
  auto_create_number: boolean
  is_active?: boolean
}

export interface UpdateInvoiceTypeRequest extends CreateInvoiceTypeRequest {}

export interface InvoiceTypeResponse {
  success: boolean
  data: InvoiceType
  message?: string
}

export interface InvoiceTypesListResponse {
  success: boolean
  data: InvoiceType[]
  message?: string
}

export interface InvoiceTypeToggleStatusResponse {
  success: boolean
  data: InvoiceType
  message: string
}
```

#### 2. API Service (lib/api/[module].ts)
```typescript
// lib/api/invoice-types.ts
import { apiClient } from './client'
import type {
  InvoiceType,
  CreateInvoiceTypeRequest,
  UpdateInvoiceTypeRequest,
  InvoiceTypeResponse,
  InvoiceTypesListResponse,
  InvoiceTypeToggleStatusResponse,
} from './types/invoice-types'

export async function getInvoiceTypes(): Promise<InvoiceType[]> {
  try {
    const response = await apiClient.get<InvoiceTypesListResponse>('/invoice-types')
    return response.data || []
  } catch (error) {
    console.error('Error fetching invoice types:', error)
    throw error
  }
}

export async function getInvoiceTypeById(id: number): Promise<InvoiceType> {
  try {
    const response = await apiClient.get<InvoiceTypeResponse>(`/invoice-types/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching invoice type ${id}:`, error)
    throw error
  }
}

export async function searchInvoiceTypes(query: string): Promise<InvoiceType[]> {
  if (!query || query.length < 2) return []

  try {
    const response = await apiClient.get<InvoiceTypesListResponse>(
      `/invoice-types/search?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  } catch (error) {
    console.error('Error searching invoice types:', error)
    throw error
  }
}

export async function createInvoiceType(data: CreateInvoiceTypeRequest): Promise<InvoiceType> {
  try {
    const response = await apiClient.post<InvoiceTypeResponse>('/invoice-types', data)
    return response.data
  } catch (error) {
    console.error('Error creating invoice type:', error)
    throw error
  }
}

export async function updateInvoiceType(
  id: number,
  data: UpdateInvoiceTypeRequest
): Promise<InvoiceType> {
  try {
    const response = await apiClient.put<InvoiceTypeResponse>(`/invoice-types/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating invoice type ${id}:`, error)
    throw error
  }
}

export async function deleteInvoiceType(id: number): Promise<void> {
  try {
    await apiClient.delete(`/invoice-types/${id}`)
  } catch (error) {
    console.error(`Error deleting invoice type ${id}:`, error)
    throw error
  }
}

export async function toggleInvoiceTypeStatus(id: number): Promise<InvoiceType> {
  try {
    const response = await apiClient.post<InvoiceTypeToggleStatusResponse>(
      `/invoice-types/${id}/toggle-status`,
      {}
    )
    return response.data
  } catch (error) {
    console.error(`Error toggling invoice type status ${id}:`, error)
    throw error
  }
}
```

#### 3. Custom Hooks (lib/api/hooks/use-[module].ts)
```typescript
// lib/api/hooks/use-invoice-types.ts
'use client'

import { useEffect, useState } from 'react'
import { useFetch, useMutation } from './use-fetch'
import * as invoiceTypesAPI from '@/lib/api/invoice-types'
import type { InvoiceType, CreateInvoiceTypeRequest, UpdateInvoiceTypeRequest } from '@/lib/api/types/invoice-types'
import { toast } from 'sonner'

// ==================== QUERIES ====================

export function useInvoiceTypes() {
  return useFetch<InvoiceType[]>('/invoice-types', { skip: false })
}

export function useInvoiceTypeDetail(id: number | null) {
  return useFetch<InvoiceType>(id ? `/invoice-types/${id}` : null, { skip: !id })
}

export function useInvoiceTypesSearch(searchTerm: string) {
  const [debouncedTerm, setDebouncedTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const url = debouncedTerm.length >= 2
    ? `/invoice-types/search?q=${encodeURIComponent(debouncedTerm)}`
    : null

  return useFetch<InvoiceType[]>(url, { skip: !url })
}

// ==================== MUTATIONS ====================

export function useCreateInvoiceType() {
  return useMutation<InvoiceType, CreateInvoiceTypeRequest>({
    mutationFn: (data) => invoiceTypesAPI.createInvoiceType(data),
    onSuccess: () => {
      toast.success('Tipe invoice berhasil dibuat')
    },
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })
}

export function useUpdateInvoiceType(id: number) {
  return useMutation<InvoiceType, UpdateInvoiceTypeRequest>({
    mutationFn: (data) => invoiceTypesAPI.updateInvoiceType(id, data),
    onSuccess: () => {
      toast.success('Tipe invoice berhasil diperbarui')
    },
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })
}

export function useDeleteInvoiceType() {
  return useMutation<void, number>({
    mutationFn: (id) => invoiceTypesAPI.deleteInvoiceType(id),
    onSuccess: () => {
      toast.success('Tipe invoice berhasil dihapus')
    },
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })
}

export function useToggleInvoiceTypeStatus() {
  return useMutation<InvoiceType, number>({
    mutationFn: (id) => invoiceTypesAPI.toggleInvoiceTypeStatus(id),
    onSuccess: () => {
      toast.success('Status tipe invoice berhasil diubah')
    },
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })
}
```

#### 4. Form Component (components/forms/[module]-form.tsx)
```typescript
// components/forms/invoice-type-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InvoiceTypeFormProps {
  invoiceType?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: Error | null
}

export function InvoiceTypeForm({
  invoiceType,
  onSubmit,
  onCancel,
  loading,
  error,
}: InvoiceTypeFormProps) {
  const [formData, setFormData] = useState({
    code: invoiceType?.code || '',
    name: invoiceType?.name || '',
    is_license: invoiceType?.is_license || false,
    auto_create_number: invoiceType?.auto_create_number || false,
    is_active: invoiceType?.is_active ?? true,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.code || formData.code.trim().length === 0) {
      errors.code = 'Kode tipe invoice harus diisi'
    }
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Nama tipe invoice harus diisi'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error.message}</div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Tipe Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="INV001"
                  disabled={loading}
                />
                {formErrors.code && (
                  <p className="text-xs text-red-500">{formErrors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Invoice Produk"
                  disabled={loading}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id="is_license"
                  type="checkbox"
                  checked={formData.is_license}
                  onChange={(e) =>
                    setFormData({ ...formData, is_license: e.target.checked })
                  }
                  disabled={loading}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_license" className="mb-0 cursor-pointer">
                  Tipe Invoice Lisensi
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="auto_create_number"
                  type="checkbox"
                  checked={formData.auto_create_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      auto_create_number: e.target.checked,
                    })
                  }
                  disabled={loading}
                  className="w-4 h-4"
                />
                <Label
                  htmlFor="auto_create_number"
                  className="mb-0 cursor-pointer"
                >
                  Buat Nomor Otomatis
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  disabled={loading}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="mb-0 cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : invoiceType ? 'Perbarui' : 'Buat'}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

#### 5. Module UI Component (components/modules/invoice-types-module.tsx)
```typescript
// components/modules/invoice-types-module.tsx
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { AlertCircle, Eye, Edit2, Trash2, Plus, Toggle2 } from 'lucide-react'
import { InvoiceTypeForm } from '@/components/forms/invoice-type-form'
import {
  useInvoiceTypes,
  useInvoiceTypeDetail,
  useCreateInvoiceType,
  useUpdateInvoiceType,
  useDeleteInvoiceType,
  useToggleInvoiceTypeStatus,
  useInvoiceTypesSearch,
} from '@/lib/api/hooks'

export function InvoiceTypesModule() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<number | null>(null)
  const [editingType, setEditingType] = useState<any>(null)

  // Fetch list
  const { data: types, loading: typesLoading, error: typesError, refetch } = useInvoiceTypes()

  // Search
  const {
    data: searchResults,
    loading: searchLoading,
  } = useInvoiceTypesSearch(debouncedQuery)

  // Mutations
  const { mutate: createType, loading: createLoading, error: createError } = useCreateInvoiceType()
  const {
    mutate: updateType,
    loading: updateLoading,
    error: updateError,
  } = useUpdateInvoiceType(editingType?.id)
  const {
    mutate: deleteType,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteInvoiceType()
  const {
    mutate: toggleStatus,
    loading: toggleLoading,
  } = useToggleInvoiceTypeStatus()

  // Calculate summary
  const summary = useMemo(() => {
    const list = searchQuery && debouncedQuery ? searchResults : types

    return {
      total: list.length,
      active: list.filter((t: any) => t.is_active).length,
      inactive: list.filter((t: any) => !t.is_active).length,
      licenses: list.filter((t: any) => t.is_license).length,
    }
  }, [types, searchResults, searchQuery, debouncedQuery])

  // Handle search debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        setDebouncedQuery(value)
      } else if (value.length === 0) {
        setDebouncedQuery('')
      }
    }, 300)
    return () => clearTimeout(timer)
  }

  const handleCreate = async (data: any) => {
    await createType(data)
    setShowCreateDialog(false)
    refetch()
  }

  const handleUpdate = async (data: any) => {
    await updateType(data)
    setShowEditDialog(false)
    refetch()
  }

  const handleDelete = async () => {
    if (typeToDelete) {
      await deleteType(typeToDelete)
      setShowDeleteDialog(false)
      setTypeToDelete(null)
      refetch()
    }
  }

  const handleToggleStatus = async (id: number) => {
    await toggleStatus(id)
    refetch()
  }

  const displayList = searchQuery && debouncedQuery ? searchResults : types
  const displayLoading = searchQuery && debouncedQuery ? searchLoading : typesLoading
  const displayError = searchQuery && debouncedQuery ? typesError : typesError

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{summary.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lisensi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.licenses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Cari tipe invoice..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tipe Baru
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(displayError || createError || updateError || deleteError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            {displayError?.message ||
              createError?.message ||
              updateError?.message ||
              deleteError?.message}
          </div>
        </Alert>
      )}

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Daftar Tipe Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          {displayLoading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada tipe invoice</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold">Kode</th>
                    <th className="px-4 py-2 text-left font-semibold">Nama</th>
                    <th className="px-4 py-2 text-center font-semibold">Lisensi</th>
                    <th className="px-4 py-2 text-center font-semibold">Auto Number</th>
                    <th className="px-4 py-2 text-center font-semibold">Status</th>
                    <th className="px-4 py-2 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map((type: any) => (
                    <tr key={type.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{type.code}</td>
                      <td className="px-4 py-2">{type.name}</td>
                      <td className="px-4 py-2 text-center">
                        {type.is_license ? (
                          <Badge className="bg-blue-500">Ya</Badge>
                        ) : (
                          <Badge variant="outline">Tidak</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {type.auto_create_number ? (
                          <Badge className="bg-green-500">Ya</Badge>
                        ) : (
                          <Badge variant="outline">Tidak</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge
                          variant={type.is_active ? 'default' : 'secondary'}
                        >
                          {type.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(type.id)}
                            disabled={toggleLoading}
                            title="Toggle status"
                          >
                            <Toggle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingType(type)
                              setShowEditDialog(true)
                            }}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTypeToDelete(type.id)
                              setShowDeleteDialog(true)
                            }}
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Tipe Invoice Baru</DialogTitle>
          </DialogHeader>
          <InvoiceTypeForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            loading={createLoading}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tipe Invoice: {editingType?.name}</DialogTitle>
          </DialogHeader>
          <InvoiceTypeForm
            invoiceType={editingType}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditDialog(false)
              setEditingType(null)
            }}
            loading={updateLoading}
            error={updateError}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Tipe Invoice?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus tipe invoice ini? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```

#### 6. Update Barrel Exports
```typescript
// lib/api/index.ts
// ADD:
export * from './invoice-types'
export * from './types/invoice-types'

// lib/api/hooks/index.ts
// ADD:
export * from './use-invoice-types'

// components/modules/index.tsx
// ADD:
export { InvoiceTypesModule } from './invoice-types-module'
```

---

## 🗺️ ROADMAP PENGEMBANGAN

### Phase 1: FIX BUGS (1-2 hari)
```
✓ Fix use-mutation imports
✓ Fix export conflicts  
✓ Create middleware.ts
✓ Add search functions
✓ Add period lock handling
✓ Fix TypeScript errors
```

### Phase 2: MASTER DATA MODULES (3-5 hari)
```
5 - Invoice Types (CRUD + toggle-status)
7 - Users (CRUD + assign-role + toggle-status)
8 - Companies (CRUD + search)
10 - Product Groups (CRUD + search)
11 - Master Item Products (CRUD + search + toggle-status)
```

### Phase 3: POSTING & JOURNALS (5-7 hari)
```
21 - Posting (Omzet + Payments + Costs)
22 - Journals (GL entries view)
```

### Phase 4: REPORTS (7-10 hari) - LARGEST MODULE
```
23 - Reports (18 different report endpoints)
     Consider: Tabs/sections for each report type
```

### Phase 5: PRINT & ADVANCED (2-3 hari)
```
24 - Print / PDF (batch + individual + receipt)
26 - Recurring Invoices (auto-generate endpoint)
```

### Phase 6: ENHANCEMENTS & QA (3-5 hari)
```
- Role-based access control (frontend checks)
- Pagination UI (backend supports, UI needs work)
- Bulk operations
- Performance optimization
- Loading skeletons
- Error messages standardization
```

---

## 📝 NOTES

### API Pattern yang Sudah Terbukti

Jangan deviate dari pattern ini. Semua modules yang selesai menggunakan pattern ini dan berfungsi dengan baik:

```typescript
API Function Pattern:
- 1 file per module (lib/api/[module].ts)
- 6 standar functions (get, getById, search, create, update, delete)
- URLSearchParams untuk query params
- try-catch error handling
- Return unwrapped data (response.data)
- Debounce search di 300ms

Hook Pattern:
- useFetch untuk queries
- useMutation untuk mutations
- Toast notifications
- Return objects dengan {data, loading, error, mutate/refetch}

UI Pattern:
- Summary cards dengan totals
- Search + filter bar
- Data table dengan actions
- CRUD dialogs
- Status badges dengan colors
- Currency formatting untuk Rp
- Modal untuk detail/edit/delete
```

### Field Naming Convention

Gunakan snake_case untuk API responses (dari backend):
````
invoice_number, invoice_date, client_id, is_active, created_at
```

Gunakan camelCase untuk TypeScript:
```
invoiceNumber, invoiceDate, clientId, isActive, createdAt
```

### Indonesian Language

Semua label, button, messages dalam **Bahasa Indonesia**:
- Labels: Klien, Produk, Tanggal, Nomor, Aksi, Buat, Edit, Hapus
- Messages: "Buat berhasil", "Perbarui berhasil", "Dihapus berhasil"
- Placeholders: "Cari klien...", "Pilih tanggal..."
- Validation: "Harus diisi", "Format tidak valid", "Minimal 2 karakter"

### Error Handling

1. **Validation Errors (422):**
   - Display field-level errors
   - Show in toast: "Validasi gagal: [errors]"

2. **Period Lock (423):**
   - Show user-friendly msg: "Periode terkunci - tidak dapat posting"
   - Disable submit buttons during locked period

3. **Server Errors (500):**
   - Generic msg: "Terjadi kesalahan server"
   - Log actual error in console

4. **Network Errors:**
   - Show: "Koneksi terputus, silakan coba lagi"

---

## ✅ Sekarang Anda Siap!

Gunakan guide ini untuk:
1. **Fix bugs** yang critical terlebih dahulu
2. **Implement modules baru** mengikuti pattern yang ada  
3. **Reference arsitektur** untuk konsistensi

Good luck! 🚀

