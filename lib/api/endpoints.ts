// API Endpoints Constants
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    ME: '/me',
  },

  // Lookups
  LOOKUPS: {
    COMPANIES: '/companies/search',
    CLIENTS: '/clients/search',
    PRODUCTS: '/products/search',
    ITEMS: '/items/search',
    BANKS: '/banks/search',
    TEAM_MEMBERS: '/team-members/search',
    INVOICE_TYPES: '/invoice-types/search',
    MASTER_ITEM_PRODUCTS: '/master-item-products/search',
    PRODUCT_GROUPS: '/product-groups/search',
    CHART_OF_ACCOUNTS: '/chart-of-accounts/search',
    COA: '/chart-of-accounts',
  },

  // Setup
  SETUP: {
    COMPANY_SETTINGS: '/company/settings',
    TAX_SERIES: '/tax-series',
    TAX_SERIES_NEXT: (id: string | number) => `/tax-series/${id}/next`,
  },

  // Master Data - Clients
  CLIENTS: {
    LIST: '/clients',
    GET: (id: string | number) => `/clients/${id}`,
    CREATE: '/clients',
    UPDATE: (id: string | number) => `/clients/${id}`,
    DELETE: (id: string | number) => `/clients/${id}`,
    SEARCH: '/clients/search',
  },

  // Master Data - Products
  PRODUCTS: {
    LIST: '/products',
    GET: (id: string | number) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
    SEARCH: '/products/search',
  },

  // Master Data - Product Groups
  PRODUCT_GROUPS: {
    LIST: '/product-groups',
    GET: (id: string | number) => `/product-groups/${id}`,
    CREATE: '/product-groups',
    UPDATE: (id: string | number) => `/product-groups/${id}`,
    DELETE: (id: string | number) => `/product-groups/${id}`,
    SEARCH: '/product-groups/search',
  },

  // Master Data - Items
  ITEMS: {
    LIST: '/items',
    GET: (id: string | number) => `/items/${id}`,
    CREATE: '/items',
    UPDATE: (id: string | number) => `/items/${id}`,
    DELETE: (id: string | number) => `/items/${id}`,
    SEARCH: '/items/search',
  },

  // Master Data - Master Item Products
  MASTER_ITEM_PRODUCTS: {
    LIST: '/master-item-products',
    GET: (id: string | number) => `/master-item-products/${id}`,
    CREATE: '/master-item-products',
    UPDATE: (id: string | number) => `/master-item-products/${id}`,
    DELETE: (id: string | number) => `/master-item-products/${id}`,
    TOGGLE_STATUS: (id: string | number) => `/master-item-products/${id}/toggle-status`,
    SEARCH: '/master-item-products/search',
  },

  // Master Data - Team Members
  TEAM_MEMBERS: {
    LIST: '/team-members',
    GET: (id: string | number) => `/team-members/${id}`,
    CREATE: '/team-members',
    UPDATE: (id: string | number) => `/team-members/${id}`,
    DELETE: (id: string | number) => `/team-members/${id}`,
    SEARCH: '/team-members/search',
  },

  // Master Data - Banks
  BANKS: {
    LIST: '/banks',
    GET: (id: string | number) => `/banks/${id}`,
    CREATE: '/banks',
    UPDATE: (id: string | number) => `/banks/${id}`,
    DELETE: (id: string | number) => `/banks/${id}`,
    SEARCH: '/banks/search',
  },

  // Master Data - Invoice Types
  INVOICE_TYPES: {
    LIST: '/invoice-types',
    GET: (id: string | number) => `/invoice-types/${id}`,
    CREATE: '/invoice-types',
    UPDATE: (id: string | number) => `/invoice-types/${id}`,
    DELETE: (id: string | number) => `/invoice-types/${id}`,
    TOGGLE_STATUS: (id: string | number) => `/invoice-types/${id}/toggle-status`,
    SEARCH: '/invoice-types/search',
  },

  // Master Data - Companies
  COMPANIES: {
    LIST: '/companies',
    GET: (id: string | number) => `/companies/${id}`,
    CREATE: '/companies',
    UPDATE: (id: string | number) => `/companies/${id}`,
    DELETE: (id: string | number) => `/companies/${id}`,
    SEARCH: '/companies/search',
  },

  // Master Data - Users
  USERS: {
    LIST: '/users',
    GET: (id: string | number) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    ASSIGN_ROLE: (id: string | number) => `/users/${id}/assign-role`,
    TOGGLE_STATUS: (id: string | number) => `/users/${id}/toggle-status`,
  },

  // Sales - Work Orders
  WORK_ORDERS: {
    LIST: '/work-orders',
    GET: (id: string | number) => `/work-orders/${id}`,
    CREATE: '/work-orders',
    UPDATE: (id: string | number) => `/work-orders/${id}`,
    DELETE: (id: string | number) => `/work-orders/${id}`,
    SEARCH: '/work-orders/search',
    ASSIGN_TEAM: (id: string | number) => `/work-orders/${id}/assign-team`,
  },

  // Sales - Installations
  INSTALLATIONS: {
    LIST: '/installations',
    GET: (id: string | number) => `/installations/${id}`,
    CREATE: '/installations',
    UPDATE: (id: string | number) => `/installations/${id}`,
    DELETE: (id: string | number) => `/installations/${id}`,
  },

  // Sales - Licenses
  LICENSES: {
    LIST: '/licenses',
    GET: (id: string | number) => `/licenses/${id}`,
    CREATE: '/licenses',
    UPDATE: (id: string | number) => `/licenses/${id}`,
    DELETE: (id: string | number) => `/licenses/${id}`,
  },

  // Sales - Stop Licenses
  STOP_LICENSES: {
    LIST: '/stop-licenses',
    GET: (id: string | number) => `/stop-licenses/${id}`,
    CREATE: '/stop-licenses',
    UPDATE: (id: string | number) => `/stop-licenses/${id}`,
    DELETE: (id: string | number) => `/stop-licenses/${id}`,
    SEARCH: '/stop-licenses/search',
  },

  // Finance - Invoices (License)
  INVOICES_LICENSE: {
    LIST: '/invoice-license',
    GET: (id: string | number) => `/invoice-license/${id}`,
    SUMMARY_JOURNAL: (id: string | number) => `/invoice-license/${id}/summary-journal`,
    SEARCH: '/invoice-license/search',
  },

  // Finance - Invoices (Product)
  INVOICES_PRODUCT: {
    LIST: '/invoice-products',
    GET: (id: string | number) => `/invoice-products/${id}`,
    SUMMARY_JOURNAL: (id: string | number) => `/invoice-products/${id}/summary-journal`,
    SEARCH: '/invoice-products/search',
  },

  // Finance - Invoices (General)
  INVOICES: {
    LIST: '/invoices',
    GET: (id: string | number) => `/invoices/${id}`,
    CREATE: '/invoices',
    UPDATE: (id: string | number) => `/invoices/${id}`,
    DELETE: (id: string | number) => `/invoices/${id}`,
  },

  // Finance - Invoice Items
  INVOICE_ITEMS: {
    LIST: '/invoice-items',
    GET: (id: string | number) => `/invoice-items/${id}`,
    CREATE: '/invoice-items',
    UPDATE: (id: string | number) => `/invoice-items/${id}`,
    DELETE: (id: string | number) => `/invoice-items/${id}`,
  },

  // Finance - Payments
  PAYMENTS: {
    LIST: '/payments',
    GET: (id: string | number) => `/payments/${id}`,
    CREATE: '/payments',
    UPDATE: (id: string | number) => `/payments/${id}`,
    DELETE: (id: string | number) => `/payments/${id}`,
  },

  // Finance - Debit Credit Notes
  DEBIT_CREDIT_NOTES: {
    LIST: '/debit-credit-notes',
    GET: (id: string | number) => `/debit-credit-notes/${id}`,
    CREATE: '/debit-credit-notes',
    UPDATE: (id: string | number) => `/debit-credit-notes/${id}`,
    DELETE: (id: string | number) => `/debit-credit-notes/${id}`,
    SUMMARY_JOURNAL: (id: string | number) => `/debit-credit-notes/${id}/summary-journal`,
    SEARCH: '/debit-credit-notes/search',
  },

  // Finance - Receivables
  RECEIVABLES: {
    LIST: '/receivables',
    GET: (id: string | number) => `/receivables/${id}`,
    PROCESS: '/receivables/process',
  },

  // Posting - Payments
  POSTING_PAYMENTS: {
    LIST: '/posting/payments',
    GET: (id: string | number) => `/posting/payments/${id}`,
    CREATE: '/posting/payments',
    UPDATE: (id: string | number) => `/posting/payments/${id}`,
    DELETE: (id: string | number) => `/posting/payments/${id}`,
    SEARCH: '/posting/payments/search',
    COSTS: (id: string | number) => `/posting/payments/${id}/costs`,
    SUMMARY_JOURNAL: (id: string | number) => `/posting/payments/${id}/summary-journal`,
  },

  // Posting - Payment Costs
  POSTING_PAYMENT_COSTS: {
    LIST: (paymentId: string | number) => `/posting/payments/${paymentId}/costs`,
    GET: (paymentId: string | number, costId: string | number) =>
      `/posting/payments/${paymentId}/costs/${costId}`,
    CREATE: (paymentId: string | number) => `/posting/payments/${paymentId}/costs`,
    UPDATE: (paymentId: string | number, costId: string | number) =>
      `/posting/payments/${paymentId}/costs/${costId}`,
    DELETE: (paymentId: string | number, costId: string | number) =>
      `/posting/payments/${paymentId}/costs/${costId}`,
  },

  // Posting - Omzet
  POSTING_OMZET: {
    POST: '/posting/omzet',
  },

  // Journals
  JOURNALS: {
    LIST: '/journals',
  },

  // Reports
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    AR_SUMMARY: '/reports/ar/summary',
    AR_LEDGER: '/reports/ar/ledger',
    CASH: '/reports/cash',
    TAX: '/reports/tax',
    TAX_VAT: '/reports/tax/vat',
    TAX_SUMMARY: '/reports/tax/summary',
    SALES: '/reports/sales',
    SALES_SUMMARY: '/reports/sales/summary',
    SALES_CLIENT: '/reports/sales/client',
    INVOICES_REGISTER: '/reports/invoices/register',
    INVOICES_HISTORY: '/reports/invoices/history',
    FISCAL_COMMERCIAL: '/reports/fiscal-commercial',
    RECEIVABLE_DATA: '/reports/receivable/data',
    RECEIVABLE_DETAIL: '/reports/receivable/detail',
    RECEIVABLE_PROCESS_DETAIL: '/reports/receivable/process-detail',
    RECEIVABLE_SUMMARY: '/reports/receivable/summary',
    RECEIVABLE_BY_ITEM: '/reports/receivable/by-item',
  },

  // Print
  PRINT: {
    INVOICE_PDF: (id: string | number) => `/print/invoices/${id}/pdf`,
    BATCH_INVOICES: '/print/invoices/batch',
    QUEUE_BATCH_INVOICES: '/print/invoices/batch',
    RECEIPT_PDF: (id: string | number) => `/print/receipts/${id}/pdf`,
  },

  // Recurring
  RECURRING: {
    GENERATE_INVOICES: '/recurring/invoices/generate',
  },

  // Protection
  PROTECTIONS: {
    LIST: '/protections',
    GET: (id: string | number) => `/protections/${id}`,
    CREATE: '/protections',
    UPDATE: (id: string | number) => `/protections/${id}`,
    DELETE: (id: string | number) => `/protections/${id}`,
  },
}
