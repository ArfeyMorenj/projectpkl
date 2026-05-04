# GUIDE TESTING FRONTEND FITART - DATABASE AKTUAL

Dokumen ini disusun dari snapshot database lokal FitArt per 27 April 2026.
Tujuannya supaya testing frontend selalu nyambung ke backend asli, field yang dipakai benar, dan contoh datanya memang ada atau valid terhadap data yang ada di database.

## 1. Cara Pakai Guide Ini

Urutan aman:
1. Buka menu frontend yang mau dites.
2. Cek `GET` list dulu.
3. Cocokkan field form dengan response backend.
4. Pakai code dan ID yang memang ada di database.
5. Submit create/update/delete.
6. Cek request dan response di tab `Network`.
7. Kalau muncul `422`, baca `errors` dari backend.

Aturan penting:
- jangan isi field berdasarkan asumsi
- jangan kirim field yang tidak diminta controller
- untuk relasi, pilih data yang memang sudah ada
- kalau periode terkunci, gunakan periode yang masih terbuka atau login sebagai role yang memang boleh

Catatan UI yang sering bikin bingung:
- `Tax Series` tidak tampil sebagai menu sidebar terpisah
- menu sidebar yang dipakai adalah `Setup`
- setelah masuk `Setup`, pilih tab `No. Seri Faktur Pajak`
- jadi alurnya adalah `Setup > No. Seri Faktur Pajak`

## 1.1 Cakupan Guide

Guide ini sudah mencakup modul yang muncul di sidebar frontend saat ini, yaitu:
- Dashboard
- Products
- Item Product
- Product Groups
- Invoice Types
- Chart of Accounts
- Companies
- Users
- Master Item Products
- Work Order
- Clients
- Team Member
- Installation
- Proteksi
- Manajemen Piutang
- Register Invoice
- Historis Invoice
- Payments
- Posting Pembayaran Invoice
- Laporan Fiskal
- Sales Reports
- AR Ledger
- Journals
- Print Center
- Recurring Invoices
- Laporan KAS/BANK
- Register KAS/BANK
- Detail Piutang Klien
- Kartu Piutang
- Piutang Dasar Item
- Invoices
- Invoice Items
- Invoice License
- Invoice Produk / Non License
- Nota Debet/Kredit
- Stop License
- Bank Master
- Setup

Catatan:
- tidak semua modul punya aksi create/update/delete
- modul seperti Dashboard, Chart of Accounts, Journals, dan sebagian Reports sifatnya read-only atau verify-only
- untuk modul `Setup`, testing seri faktur ada di tab `No. Seri Faktur Pajak`, bukan sidebar utama

## 1.2 Urutan Testing Aman

Ikuti urutan ini supaya relasi data tidak gagal dan backend tidak menolak request karena data pendukung belum ada:

1. Auth
2. Team Member
3. Product Groups
4. Products
5. Companies
6. Banks
7. Clients
8. Invoice Types
9. Items
10. Master Item Products
11. Users
12. Setup > Setting Perusahaan
13. Setup > No. Seri Faktur Pajak
14. Work Order
15. Installation
16. Stop License
17. Proteksi
18. Invoices
19. Invoice Items
20. Payments
21. Debit/Credit Note
22. Receivables
23. Posting Pembayaran Invoice
24. Posting Omzet
25. Journals
26. Reports
27. Print Center

Catatan urutan:
- `Team Member`, `Product Groups`, `Companies`, `Banks`, `Clients`, `Invoice Types`, `Items`, dan `Master Item Products` harus aman dulu karena dipakai oleh modul transaksi
- `Setup` dicek setelah master data karena dia dipakai untuk perusahaan dan seri faktur
- `Work Order` harus ada sebelum `Installation`, `Stop License`, dan banyak transaksi finance
- `Proteksi` sebaiknya dicek sebelum create/update transaksi finance supaya kamu tahu periode mana yang boleh dipakai
- `Reports`, `Journals`, dan `Print Center` paling aman dicek setelah transaksi contoh berhasil dibuat

## 1.3 Alias UI vs Backend

Kalau nama di sidebar atau tab beda dengan nama backend, pakai patokan ini:

| Yang kamu lihat di UI | Maknanya di backend / guide |
|---|---|
| `Setup` | Grup menu untuk pengaturan perusahaan, pajak, dan akun |
| `Setting Perusahaan` | `company/settings` |
| `No. Seri Faktur Pajak` | `tax-series` |
| `Setting Kode Akun` | akun pajak untuk `acc_ppn_kes`, `acc_ppn_mas`, `acc_discount` |
| `Akun & Bank` | rekening bank yang tersimpan di `company/settings` |
| `Bank Master` | `banks` |
| `Item Product` | `items` |
| `Master Item Products` | `master-item-products` |
| `Team Member` | `team-members` |
| `Product Groups` | `product-groups` |
| `Invoice Types` | `invoice-types` |
| `Invoices` | invoice umum / `invoices` |
| `Invoice Items` | sidebar baru untuk kelola detail item invoice setelah header invoice disimpan |
| `Invoice License` | `invoice-license` |
| `Invoice Produk / Non License` | `invoice-products` |
| `Register Invoice` | daftar invoice / read-only |
| `Historis Invoice` | histori invoice / read-only |
| `Payments` | create/edit pembayaran invoice |
| `Posting Pembayaran Invoice` | riwayat posting pembayaran / read-only |
| `Manajemen Piutang` | `receivables` |
| `Proteksi` | `protections` |
| `Stop License` | `stop-licenses` |
| `Client SPV` | role backend `client_spv` di Work Order / Stop License |
| `Print Center` | cetak invoice / receipt |
| `Laporan Fiskal` | `reports/fiscal-commercial` |

Catatan:
- di guide ini saya akan tulis nama UI dulu, lalu kalau perlu saya tulis nama backend-nya di belakang
- kalau kamu cari menu di sidebar, pakai nama yang ada di kolom kiri tabel di atas

## 2. Snapshot Database Saat Ini

### Ringkasan Tabel

| Tabel | Count Aktif | Catatan |
|---|---:|---|
| `users` | 6 | Ada `super_admin`, `finance_admin`, `ar_collector`, `sales_operator`, `manager` |
| `team_members` | 5 | Kode aktif: `01`, `03`, `04`, `05`, `06` |
| `product_groups` | 3 | `LSA`, `LSATEST`, `SERVICE` |
| `products` | 2 | `026724`, `05` |
| `chart_of_accounts` | 39 | Banyak kode valid untuk test COA |
| `companies` | 4 | `FITART`, `FITNES`, `COMP01`, `CMP001` |
| `company_settings` | 1 | Setup operasional aktif |
| `banks` | 6 | `BM02`, `BM03`, `BM04`, `KH`, `BM01X`, `BK01` |
| `clients` | 3 | `CLTEST00`, `CLTEST000`, `CL001` |
| `invoice_types` | 5 | `501`, `503`, `504`, `S04`, `500` |
| `items` | 8 | `1`, `3`, `4`, `5`, `6`, `7`, `ITEM122`, `ITMTEST01` |
| `master_item_products` | 9 | `MIP-1` s/d `MIP-7`, `LSA`, `02`, `MIP001` |
| `work_orders` | 1 | Ada `WO-042026-0001` |
| `installations` | 0 | Belum ada data aktif |
| `licenses` | 0 | Belum ada data aktif |
| `stop_licenses` | 0 | Belum ada data aktif |
| `invoices` | 0 | Tidak ada invoice aktif saat snapshot |
| `invoice_items` | 0 | Belum ada detail invoice aktif |
| `payments` | 0 | Belum ada payment aktif |
| `debit_credit_notes` | 0 | Belum ada note aktif |
| `receivables` | 0 | Belum ada receivable aktif |
| `journals` | 5 | Sudah ada posting invoice dan posting payment |
| `protection_periods` | 1 | Periode `2026-03` sudah terkunci |
| `invoice_series` | 1 | Series pajak aktif untuk `03-2026` |
| `posting_payments` | 0 | Belum ada batch posting baru |
| `posting_payment_costs` | 0 | Belum ada cost detail aktif |
| `posting_omzet` | 0 | Belum ada posting omzet baru |

## 3. Data Aman Untuk Testing

### Users yang Bisa Dipakai

- `superadmin@fitart.co.id`
- `financeadmin@fitart.co.id`
- `arcollector@fitart.co.id`
- `salesoperator@fitart.co.id`
- `manager@fitart.co.id`
- `admin@fitart.co.id`

### Team Member Aktif

| ID | Code | Name | Position | Status |
|---|---|---|---|---|
| 1 | `01` | IMAM S ARIFIN | MANAGER AREA | `STATUS1` |
| 6 | `03` | IMANG INDAH AYUNINGRUM | ADMINISTRASI | `STATUS1` |
| 4 | `04` | ADIT | PROGRAMMER | `STATUS1` |
| 5 | `05` | FITRI AMALIA | ADM.KEUANGAN | `STATUS1` |
| 7 | `06` | AGUS HERMAWAN | MARKETING MANAGER | `STATUS1` |

Catatan:
- field backend team member adalah `code`, `name`, `position`, `status`, `is_active`
- status existing di database memakai string `STATUS1`

### Product Group Aktif

| ID | Code | Name | acc_omzet | cdf_piutang |
|---|---|---|---|---|
| 1 | `LSA` | LISENSI APLIKASI SIGMA | `5033` | `1535` |
| 3 | `LSATEST` | LISENSI TEST | `5033` | `1535` |
| 5 | `SERVICE` | SERVICE DAN MANTENANCE | `5033` | `1535` |

### Products Aktif

| ID | Code | Name | author_code | author_name | product_group_id |
|---|---|---|---|---|---|
| 4 | `026724` | Arfey Moreno Jazzua | `03` | IMANG INDAH AYUNINGRUM | null |
| 5 | `05` | INVOICE MANAGEMENT SYSTEM | `03` | IMANG INDAH AYUNINGRUM | `1` |

### Company Records

| ID | Code | Name | City |
|---|---|---|---|
| 1 | `FITART` | PT. Fit Art Technology | Kedungkandang Sawojajar |
| 5 | `FITNES` | ELEK | Malang |
| 6 | `COMP01` | PT FITART NUSANTARA | SURABAYA |
| 7 | `CMP001` | PT FitArt Technology | Jakarta |

### Banks

| ID | Code | Name | type | acc_code | cdf_code |
|---|---|---|---|---|---|
| 3 | `BM02` | BANK MANDIRI 8358201-4 | `M` | `1202` | `1202` |
| 4 | `BM03` | BANK BNI 9457201-4 | `M` | `1203` | `1203` |
| 5 | `BM04` | BANK BRI 567567790 | `M` | `1204` | `1204` |
| 6 | `KH` | TUNAI/KAS | `H` | `1101` | `1101` |
| 8 | `BM01X` | BANK BCA TEST | `M` | `1201` | `1201` |
| 9 | `BK01` | BANK BCA | `M` | `1201` | `1201` |

### Clients

| ID | Code | Name | Status | City |
|---|---|---|---|---|
| 5 | `CLTEST00` | PT CUSTOMER TESTING | `NON GROUP` | Jakarta |
| 6 | `CLTEST000` | PT CUSTOMER TESTING | `NON GROUP` | Jakarta |
| 7 | `CL001` | PT INDO JAYA MAKMUR | `NON GROUP` | SURABAYA |

### Invoice Types

| ID | Code | Name | is_license | auto_create_number | is_active |
|---|---|---|---|---|---|
| 1 | `501` | PENJUALAN HARDWARE | false | true | true |
| 3 | `503` | PENDAPATAN JASA | false | true | true |
| 4 | `504` | PENDAPATAN LICENSE | true | true | true |
| 6 | `S04` | PENDAPATAN LICENSE | true | true | false |
| 7 | `500` | Arfey Moreno Jazzua | true | true | true |

### Items

| ID | Code | Name | acc_omzet | acc_piutang | cdf_omzet | cdf_piutang |
|---|---|---|---|---|---|---|
| 1 | `1` | INSTALL | `5032` | `1532` | `5032` | `1532` |
| 3 | `3` | MAINTENANCE | `5035` | `1535` | `5035` | `1535` |
| 4 | `4` | HARDWARE | `5011` | `1511` | `5011` | `1511` |
| 5 | `5` | DEVELOPMENT SYSTEM | `5019` | `1519` | `5019` | `1519` |
| 6 | `6` | NETWORK SERVICE | `5032` | `1532` | `5032` | `1532` |
| 7 | `7` | PRODUK LAINNYA | `5032` | `1532` | `5032` | `1532` |
| 9 | `ITEM122` | REno | `5033` | `1535` | `5033` | `1535` |
| 10 | `ITMTEST01` | LICENSE TEST | `5033` | `1535` | `5033` | `1535` |

### Master Item Products

| ID | Code | Name | Unit | Price | acc_omzet | acc_omzet_np | acc_piutang | cdf_piutang | is_active |
|---|---|---|---|---:|---|---|---|---|---|
| 1 | `MIP-1` | INSTALL | UNIT | 0 | `5032` | `5032` | `1532` | `1532` | false |
| 3 | `MIP-3` | MAINTENANCE | UNIT | 0 | `5035` | `5035` | `1535` | `1535` | false |
| 4 | `MIP-4` | HARDWARE | UNIT | 0 | `5011` | `5011` | `1511` | `1511` | true |
| 5 | `MIP-5` | DEVELOPMENT SYSTEM | UNIT | 0 | `5019` | `5019` | `1519` | `1519` | true |
| 6 | `MIP-6` | NETWORK SERVICE | UNIT | 0 | `5032` | `5032` | `1532` | `1532` | false |
| 7 | `MIP-7` | PRODUK LAINNYA | UNIT | 0 | `5032` | `5032` | `1532` | `1532` | false |
| 8 | `LSA` | LISENSI APLIKASI SIGMA | UNIT | 0 | `5033` | `5033` | `1535` | `1535` | true |
| 9 | `02` | ELEK | PCS | 100000 | `5033` | `5033` | `1535` | `1535` | false |
| 12 | `MIP001` | LICENSI APLIKASI | PCS | 1000000 | `5033` | `5033` | `1535` | `1535` | true |

### Current Setup Data

#### Company Settings

Tampilan UI:
- `Setup > Setting Perusahaan`

Record aktif saat ini:

- `company_name`: `PT FitArt Technology`
- `address`: `Jakarta`
- `city`: `Jakarta`
- `phone`: `0211234567`
- `period_start`: `2026-01-01`
- `acc_ppn_kes`: `3213`
- `acc_ppn_mas`: `3214`
- `acc_discount`: `5090`
- `bank1`: `BCA`
- `bank1_sn`: `Cabang Utama`
- `bank1_ac`: `1234567890`
- `bank2`: `Mandiri`
- `bank2_sn`: `Cabang Pusat`
- `bank2_ac`: `0987654321`

#### Tax Series / No. Seri Faktur Pajak

Tampilan UI:
- `Setup > No. Seri Faktur Pajak`

Record aktif saat ini:

- `filled_date`: `2026-03-08`
- `period`: `03-2026`
- `tax_code`: `010`
- `start_number`: `04239178`
- `end_number`: `04239205`
- `current_number`: `04239179`
- `ppn_percentage`: `11`
- `dpp_percentage`: `1.11`

Makna untuk testing:
- kalau tombol `next number` dipakai, angka berikutnya harus lanjut dari `04239180`

#### Protection Period

Record aktif saat ini:

- `period`: `2026-03`
- `is_protected`: true
- `protected_at`: `2026-03-31`
- `protected_by`: `1`

Makna untuk testing:
- transaksi write di periode `2026-03` kemungkinan akan ditolak
- untuk uji create/update, pakai periode `2026-04` atau periode lain yang belum terkunci

#### Work Order

Record aktif saat ini:

- `id`: `4`
- `number`: `WO-042026-0001`
- `client_id`: `7`
- `product_id`: `5`
- `item_id`: `1`
- `status`: `AKTIF`
- `amount`: `1000000.00`

Ini adalah data paling aman untuk testing:
- client: `CL001`
- product: `05`
- item: `1`

#### Journals

Record jurnal yang sudah ada:

- Invoice posting untuk `001/504/LP/1025`
  - debit `1532` = `3330000.00`
  - credit `5032` = `3000000.00`
  - credit `3213` = `330000.00`
- Receipt posting untuk `BP-202603-0001`
  - debit `1111` = `1054500.00`
  - credit `1532` = `1054500.00`

Ini berguna untuk testing:
- `Journals`
- `AR Ledger`
- `Sales Report`
- `Cash Report`
- `Print Receipt`

## 4. Peta Menu Frontend ke Backend

### Auth

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

### Setup

- `GET /api/company/settings`
- `POST /api/company/settings`
- `GET /api/tax-series`
- `POST /api/tax-series`
- `POST /api/tax-series/{taxSeries}/next`
- `DELETE /api/tax-series/{taxSeries}`

### Master Data

- `GET/POST/PUT/DELETE /api/users`
- `GET/POST/PUT/DELETE /api/companies`
- `GET/POST/PUT/DELETE /api/clients`
- `GET/POST/PUT/DELETE /api/team-members`
- `GET/POST/PUT/DELETE /api/product-groups`
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST/PUT/DELETE /api/items`
- `GET/POST/PUT/DELETE /api/banks`
- `GET/POST/PUT/DELETE /api/invoice-types`
- `GET/POST/PUT/DELETE /api/master-item-products`

### Sales

- `GET/POST/PUT/DELETE /api/work-orders`
- `POST /api/work-orders/{work_order}/assign-team`
- `GET/POST/PUT/DELETE /api/installations`
- `GET/POST/PUT/DELETE /api/licenses`
- `GET/POST/PUT/DELETE /api/stop-licenses`

### Finance

- `GET/POST/PUT/DELETE /api/invoices`
- `GET/POST/PUT/DELETE /api/invoice-items`
- `GET /api/invoice-license`
- `GET /api/invoice-license/{invoice}`
- `GET /api/invoice-license/{invoice}/summary-journal`
- `GET /api/invoice-products`
- `GET /api/invoice-products/{invoice}`
- `GET /api/invoice-products/{invoice}/summary-journal`
- `GET/POST/PUT/DELETE /api/payments`
- `GET/POST/PUT/DELETE /api/debit-credit-notes`
- `GET /api/debit-credit-notes/{debitCreditNote}/summary-journal`
- `GET /api/receivables`
- `GET /api/receivables/{receivable}`
- `POST /api/receivables/process`

### Posting

- `GET /api/posting/payments`
- `GET /api/posting/payments/{postingPayment}`
- `GET /api/posting/payments/{postingPayment}/summary-journal`
- `GET /api/posting/payments/{postingPayment}/costs`
- `POST /api/posting/payments`
- `POST /api/posting/payments/{postingPayment}/costs`
- `PUT /api/posting/payments/{postingPayment}/costs/{cost}`
- `DELETE /api/posting/payments/{postingPayment}/costs/{cost}`
- `POST /api/posting/omzet`

Catatan UI:
- `Payments` dipakai untuk create, edit, dan delete payment invoice
- `Posting Pembayaran Invoice` dipakai untuk riwayat posting, detail, dan jurnal posting
- tab `Buat Posting` mengirim `number`, `date`, `bank_id`, `client_id`, `invoices[]`, dan `costs[]`
- tab `Posting Omzet` cukup kirim `invoice_id`

### Reports

- `GET /api/reports/dashboard`
- `GET /api/reports/fiscal-commercial`
- `GET /api/reports/sales`
- `GET /api/reports/sales/summary`
- `GET /api/reports/sales/client`
- `GET /api/reports/ar/ledger`
- `GET /api/reports/ar/summary`
- `GET /api/reports/cash`
- `GET /api/reports/invoices/register`
- `GET /api/reports/invoices/history`
- `GET /api/reports/tax`
- `GET /api/reports/tax/summary`
- `GET /api/reports/tax/vat`
- `GET /api/reports/receivable/detail`
- `GET /api/reports/receivable/summary`
- `GET /api/reports/receivable/by-item`
- `GET /api/reports/receivable/data`
- `GET /api/reports/receivable/process-detail`

### Print

- `GET /api/print/invoices/batch`
- `POST /api/print/invoices/batch`
- `GET /api/print/invoices/{invoice}/pdf`
- `GET /api/print/receipts/{posting_payment}/pdf`

### Protection

- `GET/POST/PUT/DELETE /api/protections`

## 5. Skenario Testing Per Modul

## 5.1 Auth

Tampilan UI:
- halaman `Login`

Yang dicek:
- login sukses
- token tersimpan
- `GET /api/me` mengembalikan user yang sedang login
- logout menghapus session/token

Flow:
1. Login dengan `superadmin@fitart.co.id`.
2. Refresh halaman.
3. Pastikan user tetap login.
4. Logout.
5. Pastikan kembali ke halaman login.

## 5.2 Team Member

Tampilan UI:
- sidebar `Team Member`

Field backend:
- `code`
- `name`
- `position`
- `status`
- `is_active`

Data existing yang aman:
- `01`
- `03`
- `04`
- `05`
- `06`

Contoh payload create A:
```json
{
  "code": "07",
  "name": "BUDI SETIAWAN",
  "position": "SUPPORT",
  "status": "STATUS1",
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "08",
  "name": "SITI NURHAYATI",
  "position": "QA ANALYST",
  "status": "STATUS1",
  "is_active": true
}
```

Yang dicek:
1. List tampil dulu.
2. Create team member baru.
3. Edit `ADIT` atau `AGUS HERMAWAN`.
4. Search by code atau name.

## 5.3 Product Groups

Tampilan UI:
- sidebar `Product Groups`

Field backend:
- `code`
- `name`
- `acc_omzet`
- `cdf_piutang`
- `is_active`

Data existing yang aman:
- `LSA`
- `LSATEST`
- `SERVICE`

Contoh payload create A:
```json
{
  "code": "SUPPORT",
  "name": "SUPPORT DAN MAINTENANCE",
  "acc_omzet": "5033",
  "cdf_piutang": "1535",
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "CONSULT",
  "name": "CONSULTING DAN IMPLEMENTASI",
  "acc_omzet": "5033",
  "cdf_piutang": "1535",
  "is_active": true
}
```

Yang dicek:
1. Dropdown COA harus ambil data dari `chart_of_accounts`.
2. Kode group harus uppercase / disimpan uppercase.
3. Relasi product ke group harus muncul setelah refresh.

## 5.4 Products

Tampilan UI:
- sidebar `Products`

Field backend:
- `code`
- `name`
- `specification`
- `description`
- `author_code`
- `author_name`
- `compiler`
- `year`
- `product_group_id`
- `is_active`

Data existing yang aman:
- product `05`
- author code `03`
- product group `1` (`LSA`)

Contoh payload create A:
```json
{
  "code": "06",
  "name": "INVOICE PORTAL",
  "specification": "BILLING SYSTEM",
  "description": "Testing product frontend A",
  "author_code": "03",
  "compiler": "LARAVEL 10",
  "year": "2026",
  "product_group_id": 1,
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "07",
  "name": "SERVICE PORTAL",
  "specification": "SERVICE SYSTEM",
  "description": "Testing product frontend B",
  "author_code": "06",
  "compiler": "NEXTJS 15",
  "year": "2026",
  "product_group_id": 5,
  "is_active": true
}
```

Yang dicek:
1. `author_code` harus code team member, bukan ID.
2. `product_group_id` harus ID product group yang valid.
3. Backend akan mengisi `author_name` otomatis dari code.

## 5.5 Companies

Tampilan UI:
- sidebar `Companies`

Field backend:
- `code`
- `name`
- `address`
- `address_invoice`
- `city`
- `city_invoice`
- `phone`
- `fax`
- `email`
- `website`
- `npwp`
- `npkp`
- `tax_name`
- `tax_position`
- `invoice_name`
- `invoice_position`
- `invoice_name_2`
- `invoice_position_2`
- `invoice_tolerance_days`
- `upgrade_days`
- `letterhead_top`
- `letterhead_bottom`

Data existing yang aman:
- `FITART`
- `CMP001`

Contoh payload create A:
```json
{
  "code": "CMP002",
  "name": "PT FitArt Demo",
  "address": "Jl. Sudirman No. 1",
  "address_invoice": "Jl. Sudirman No. 1",
  "city": "Jakarta",
  "city_invoice": "Jakarta",
  "phone": "021-1234567",
  "fax": "021-1234568",
  "email": "finance@fitart.co.id",
  "website": "https://fitart.co.id",
  "npwp": "01.234.567.8-901.000",
  "npkp": "PKP-CMP002",
  "tax_name": "PT FitArt Demo",
  "tax_position": "Direktur",
  "invoice_name": "Andi Pratama",
  "invoice_position": "Finance Manager",
  "invoice_name_2": "Sinta Lestari",
  "invoice_position_2": "Supervisor AR",
  "invoice_tolerance_days": "60",
  "upgrade_days": "30",
  "letterhead_top": "PT FitArt Demo",
  "letterhead_bottom": "Head Office"
}
```

Contoh payload create B:
```json
{
  "code": "CMP003",
  "name": "PT FitArt Testing",
  "address": "Jl. Merdeka No. 9",
  "address_invoice": "Jl. Merdeka No. 9",
  "city": "Surabaya",
  "city_invoice": "Surabaya",
  "phone": "031-1234567",
  "fax": "031-1234568",
  "email": "admin@fitart-testing.co.id",
  "website": "https://fitart-testing.co.id",
  "npwp": "02.345.678.9-012.000",
  "npkp": "PKP-CMP003",
  "tax_name": "PT FitArt Testing",
  "tax_position": "Owner",
  "invoice_name": "Rina Putri",
  "invoice_position": "Finance Lead",
  "invoice_name_2": "Dedi Saputra",
  "invoice_position_2": "AR Staff",
  "invoice_tolerance_days": "45",
  "upgrade_days": "14",
  "letterhead_top": "PT FitArt Testing",
  "letterhead_bottom": "Branch Office"
}
```

## 5.6 Banks

Tampilan UI:
- sidebar `Bank Master`

Field backend:
- `code`
- `name`
- `account_number`
- `account_name`
- `type`
- `acc_code`
- `cdf_code`
- `is_active`

Data existing yang aman:
- `BK01`
- `BM01X`
- `BM02`
- `BM03`
- `BM04`
- `KH`

Contoh payload create A:
```json
{
  "code": "BK02",
  "name": "BANK BCA 2",
  "account_number": "1234567891",
  "account_name": "PT FITART NUSANTARA",
  "type": "M",
  "acc_code": "1201",
  "cdf_code": "1201",
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "BK03",
  "name": "BANK BNI TEST",
  "account_number": "9876543210",
  "account_name": "PT FITART TESTING",
  "type": "H",
  "acc_code": "1101",
  "cdf_code": "1101",
  "is_active": true
}
```

Yang dicek:
- `type` hanya `M` atau `H`
- `acc_code` dan `cdf_code` harus ada di COA

## 5.7 Clients

Tampilan UI:
- sidebar `Clients`

Field backend:
- `code`
- `status`
- `name`
- `address`
- `city`
- `phone`
- `fax`
- `npwp`
- `npkp`
- `tax_name`
- `tax_address`
- `credit_term_days`
- `is_active`

Data existing yang aman:
- `CLTEST00`
- `CLTEST000`
- `CL001`

Contoh payload create A:
```json
{
  "code": "CL002",
  "status": "NON GROUP",
  "name": "PT CUSTOMER DEMO",
  "address": "Jl. Raya No. 10",
  "city": "SURABAYA",
  "phone": "0311234567",
  "fax": "0311234568",
  "npwp": "00.000.000.0-000.000",
  "npkp": "01.234.567.8",
  "tax_name": "PT CUSTOMER DEMO",
  "tax_address": "Jl. Raya No. 10",
  "credit_term_days": 30,
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "CL003",
  "status": "NON GROUP",
  "name": "PT CUSTOMER TESTING B",
  "address": "Jl. Diponegoro No. 22",
  "city": "JAKARTA",
  "phone": "02187654321",
  "fax": "02187654322",
  "npwp": "11.111.111.1-111.111",
  "npkp": "PKP-CL003",
  "tax_name": "PT CUSTOMER TESTING B",
  "tax_address": "Jl. Diponegoro No. 22",
  "credit_term_days": 14,
  "is_active": true
}
```

## 5.8 Invoice Types

Tampilan UI:
- sidebar `Invoice Types`

Field backend:
- `code`
- `name`
- `is_license`
- `auto_create_number`
- `is_active`

Data existing yang aman:
- `504` untuk license
- `501` atau `503` untuk non-license
- `500` data test aktif

Contoh payload create A:
```json
{
  "code": "506",
  "name": "PENDAPATAN DEMO",
  "is_license": false,
  "auto_create_number": true,
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "507",
  "name": "PENDAPATAN LICENSE TEST",
  "is_license": true,
  "auto_create_number": true,
  "is_active": true
}
```

Catatan:
- `S04` ada tetapi saat ini nonaktif
- menu frontend harus cek list aktif dulu supaya tidak memilih data yang sudah nonaktif

## 5.9 Items

Tampilan UI:
- sidebar `Item Product`

Field backend:
- `code`
- `name`
- `acc_omzet`
- `acc_piutang`
- `cdf_omzet`
- `cdf_piutang`
- `is_active`

Data existing yang aman:
- `1` INSTALL
- `3` MAINTENANCE
- `4` HARDWARE
- `5` DEVELOPMENT SYSTEM
- `6` NETWORK SERVICE
- `7` PRODUK LAINNYA
- `ITEM122`
- `ITMTEST01`

Contoh payload create A:
```json
{
  "code": "ITMTEST02",
  "name": "MODULE TEST",
  "acc_omzet": "5033",
  "acc_piutang": "1535",
  "cdf_omzet": "5033",
  "cdf_piutang": "1535",
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "ITMTEST03",
  "name": "MODULE TEST B",
  "acc_omzet": "5032",
  "acc_piutang": "1532",
  "cdf_omzet": "5032",
  "cdf_piutang": "1532",
  "is_active": true
}
```

## 5.10 Master Item Products

Tampilan UI:
- sidebar `Master Item Products`

Field backend yang benar dari controller:
- `code`
- `name`
- `unit`
- `price`
- `acc_omzet`
- `acc_omzet_np`
- `acc_piutang`
- `cdf_piutang`
- `is_active`

Catatan penting:
- `cdf_omzet` ada di tabel lama, tetapi controller create/update tidak memakainya
- jadi frontend jangan kirim `cdf_omzet` kalau mau aman

Data existing yang aman:
- `MIP001`
- `LSA`
- `MIP-4`
- `MIP-5`

Contoh payload create A:
```json
{
  "code": "MIP002",
  "name": "LICENSI DEMO",
  "unit": "PCS",
  "price": 1000000,
  "acc_omzet": "5033",
  "acc_omzet_np": "5033",
  "acc_piutang": "1535",
  "cdf_piutang": "1535",
  "is_active": true
}
```

Contoh payload create B:
```json
{
  "code": "MIP003",
  "name": "SERVICE DEMO",
  "unit": "UNIT",
  "price": 250000,
  "acc_omzet": "5032",
  "acc_omzet_np": "5032",
  "acc_piutang": "1532",
  "cdf_piutang": "1532",
  "is_active": true
}
```

Yang dicek:
1. price harus numeric.
2. COA harus valid di `chart_of_accounts`.
3. List aktif di frontend harus hanya menampilkan yang `is_active = true`.

## 5.11 Users

Tampilan UI:
- sidebar `Users`

Field backend:
- `username`
- `name`
- `email`
- `password`
- `role`
- `status` atau `is_active` di response

Role valid:
- `super_admin`
- `finance_admin`
- `sales_operator`
- `ar_collector`
- `auditor_viewer`
- `manager`

Data login aman:
- `superadmin@fitart.co.id`
- `financeadmin@fitart.co.id`
- `arcollector@fitart.co.id`
- `salesoperator@fitart.co.id`
- `manager@fitart.co.id`
- `admin@fitart.co.id`

Contoh payload create A:
```json
{
  "name": "QA Tester",
  "email": "qa.tester@fitart.co.id",
  "password": "secret123",
  "role": "manager",
  "status": "active"
}
```

Contoh payload create B:
```json
{
  "name": "Finance Tester",
  "email": "finance.tester@fitart.co.id",
  "password": "secret123",
  "role": "finance_admin",
  "status": "active"
}
```

Catatan:
- username boleh digenerate dari email kalau tidak diisi
- frontend harus mengikuti role yang valid dari backend

## 5.12 Setup

Tampilan UI:
- sidebar `Setup`
- di dalamnya ada tab `Setting Perusahaan`, `No. Seri Faktur Pajak`, `Setting Kode Akun`, dan `Akun & Bank`

### Company Settings

Yang tampil di UI tab `Setting Perusahaan`:
- `Nama Perusahaan`
- `Kota`
- `Alamat`
- `No. Telp`
- `NPWP`
- `Periode Start`

Mapping UI ke backend:

| UI label | Backend key |
|---|---|
| Nama Perusahaan | `company_name` |
| Kota | `city` |
| Alamat | `address` |
| No. Telp | `phone` |
| NPWP | `npwp` |
| Periode Start | `period_start` |

Data existing:
- `company_name = PT FitArt Technology`
- `address = Jakarta`
- `city = Jakarta`
- `phone = 0211234567`
- `npwp = null`
- `period_start = 2026-01-01`
- `acc_ppn_kes = 3213`
- `acc_ppn_mas = 3214`
- `acc_discount = 5090`
- `bank1 = BCA`
- `bank1_sn = Cabang Utama`
- `bank1_ac = 1234567890`
- `bank2 = Mandiri`
- `bank2_sn = Cabang Pusat`
- `bank2_ac = 0987654321`

Catatan:
- field akun pajak ada di tab `Setting Kode Akun`
- field rekening bank ada di tab `Akun & Bank`
- jadi kalau kamu cari `acc_ppn_kes` atau bank, jangan cari di tab `Setting Perusahaan`

Contoh payload update A:
```json
{
  "company_name": "PT FitArt Technology",
  "address": "Jakarta",
  "city": "Jakarta",
  "phone": "0211234567",
  "period_start": "2026-01-01",
  "acc_ppn_kes": "3213",
  "acc_ppn_mas": "3214",
  "acc_discount": "5090",
  "bank1": "BCA",
  "bank1_sn": "Cabang Utama",
  "bank1_ac": "1234567890",
  "bank2": "Mandiri",
  "bank2_sn": "Cabang Pusat",
  "bank2_ac": "0987654321"
}
```

Contoh payload update B:
```json
{
  "company_name": "PT FitArt Technology",
  "address": "Jakarta",
  "city": "Jakarta",
  "phone": "0211234568",
  "period_start": "2026-01-01",
  "acc_ppn_kes": "3213",
  "acc_ppn_mas": "3214",
  "acc_discount": "5090",
  "bank1": "BCA",
  "bank1_sn": "Cabang Pusat",
  "bank1_ac": "1234567890",
  "bank2": "Mandiri",
  "bank2_sn": "Cabang Utama",
  "bank2_ac": "0987654321"
}
```

### Tax Series

Yang tampil di UI:
- `Tgl. Isi`
- `Periode`
- `Kode Pajak`
- `No. Awal`
- `No. Akhir`
- `No. Aktif`
- `PPN %`
- `DPP %`

Field backend:
- `filled_date`
- `period`
- `tax_code`
- `start_number`
- `end_number`
- `current_number`
- `ppn_percentage`
- `dpp_percentage`

Data existing:
- `filled_date = 2026-03-08`
- `period = 03-2026`
- `tax_code = 010`
- `current_number = 04239179`

Catatan:
- `current_number` adalah nilai yang dipantau backend, jadi di UI cukup ditampilkan sebagai read-only
- tombol `next number` dipakai untuk menaikkan `current_number`
- form create/edit di UI sekarang sebaiknya mengikuti field di atas, bukan field lama seperti `koddek` atau `kdsptp`

Contoh payload create A:
```json
{
  "filled_date": "2026-04-27",
  "period": "04-2026",
  "tax_code": "010",
  "start_number": "04239206",
  "end_number": "04239250",
  "ppn_percentage": 11,
  "dpp_percentage": 1.11
}
```

Contoh payload create B:
```json
{
  "filled_date": "2026-04-27",
  "period": "05-2026",
  "tax_code": "010",
  "start_number": "05239201",
  "end_number": "05239250",
  "ppn_percentage": 11,
  "dpp_percentage": 1.11
}
```

Catatan:
- kalau `next number` dipakai, angka berikutnya harus lanjut dari `04239180`
- jangan test create tax series di periode yang sudah terkunci kecuali memang ingin cek error

## 5.13 Work Order

Tampilan UI:
- sidebar `Work Order`

Field backend:
- `number`
- `date`
- `date_install`
- `start_license`
- `client_id`
- `product_id`
- `item_id`
- `status`
- `amount`
- `description`
- `item_count`
- `per_unit`
- `notes`
- `team` array

Role team valid:
- `implementor_1`
- `implementor_2`
- `programmer`
- `system_analyst`
- `supervisor`
- `client_spv`

Catatan role tim:
- di response backend, role yang belum diisi bisa muncul sebagai `null`
- itu normal, jadi `implementor_2`, `system_analyst`, `supervisor`, dan `client_spv` tidak wajib selalu ada di setiap Work Order
- label UI tetap boleh tampil sebagai `Client SPV`, tetapi payload backend memakai key `client_spv`
- tanggal dari response backend sering berbentuk timestamp penuh seperti `2026-04-27T00:00:00.000000Z`
- di form frontend, nilai itu harus di-normalize jadi `2026-04-27` sebelum update supaya input `type="date"` dan payload backend tetap cocok

Data aman:
- client `CL001` => `client_id = 7`
- product `05` => `product_id = 5`
- item `1` => `item_id = 1`

Contoh payload create A:
```json
{
  "number": "WO-042026-0002",
  "date": "2026-04-27",
  "date_install": "2026-04-28",
  "start_license": "2026-04-28",
  "client_id": 7,
  "product_id": 5,
  "item_id": 1,
  "status": "AKTIF",
  "amount": 1000000,
  "description": "Implementasi modul keuangan",
  "item_count": 1,
  "per_unit": "UNIT",
  "notes": "Testing frontend A",
  "team": [
    { "role": "implementor_1", "team_member_id": 1 },
    { "role": "programmer", "team_member_id": 4 },
    { "role": "system_analyst", "team_member_id": 6 },
    { "role": "supervisor", "team_member_id": 5 }
  ]
}
```

Contoh payload create B:
```json
{
  "number": "WO-042026-0003",
  "date": "2026-04-27",
  "date_install": "2026-04-29",
  "start_license": "2026-04-29",
  "client_id": 7,
  "product_id": 5,
  "item_id": 3,
  "status": "AKTIF",
  "amount": 1500000,
  "description": "Implementasi service dan maintenance",
  "item_count": 2,
  "per_unit": "UNIT",
  "notes": "Testing frontend B",
  "team": [
    { "role": "implementor_2", "team_member_id": 7 },
    { "role": "programmer", "team_member_id": 4 },
    { "role": "client_spv", "team_member_id": 6 }
  ]
}
```

Yang dicek:
1. `team` harus array of role + team_member_id.
2. frontend jangan kirim field team terpisah seperti `programmer_id` atau `system_analyst_id`.
3. cari work order existing `WO-042026-0001` untuk validasi detail.

## 5.14 Installation

Tampilan UI:
- sidebar `Installation`

Field backend:
- `work_order_id`
- `client_id`
- `install_date`
- `implementor_1`
- `implementor_2`
- `implementor_3`
- `notes`

Contoh payload create A:
```json
{
  "work_order_id": 4,
  "client_id": 7,
  "install_date": "2026-04-28",
  "implementor_1": "ADIT",
  "implementor_2": "IMANG INDAH AYUNINGRUM",
  "implementor_3": "AGUS HERMAWAN",
  "notes": "Go live batch A"
}
```

Contoh payload create B:
```json
{
  "work_order_id": "<id hasil create WO-042026-0002>",
  "client_id": 7,
  "install_date": "2026-04-29",
  "implementor_1": "IMAM S ARIFIN",
  "implementor_2": "ADIT",
  "implementor_3": "FITRI AMALIA",
  "notes": "Go live batch B"
}
```

Yang dicek:
- `work_order_id` wajib ada
- `client_id` wajib valid
- data existing installation saat snapshot masih kosong, jadi ini test create dulu

## 5.15 Stop License

Tampilan UI:
- sidebar `Stop License`

Field backend:
- `number`
- `date`
- `stop_date`
- `work_order_id`
- `client_id`
- `product_id`
- `client_spv_id`
- `client_spv_code`
- `notes`
- `is_stopped`

Contoh payload create A:
```json
{
  "number": "SL-202604-0001",
  "date": "2026-04-27",
  "stop_date": "2026-04-27",
  "work_order_id": 4,
  "client_spv_code": "03",
  "notes": "BERHENTI",
  "is_stopped": true
}
```

Contoh payload create B:
```json
{
  "number": "SL-202604-0002",
  "date": "2026-04-27",
  "stop_date": "2026-04-27",
  "work_order_id": "<id hasil create WO-042026-0002>",
  "client_spv_code": "05",
  "notes": "BERHENTI PERMANEN",
  "is_stopped": true
}
```

Yang dicek:
- backend akan ambil `client_id` dan `product_id` dari work order kalau belum diisi
- `client_spv_code` akan di-resolve menjadi `client_spv_id` dan nama team member

## 5.16 Invoice, Invoice Items, Payment, Debit/Credit Note

Tampilan UI:
- sidebar `Invoices`
- sidebar `Invoice Items`
- sidebar `Payments`
- sidebar `Nota Debet/Kredit`
- sidebar `Invoice License`
- sidebar `Invoice Produk / Non License`

### Invoice

Tampilan UI:
- sidebar `Invoices`

Field backend:
- `number`
- `invoice_type_id`
- `client_id`
- `bank_id`
- `work_order_id`
- `period`
- `date`
- `due_date`
- `tax_date`
- `tax_number`
- `tax_note`
- `invoice_note`
- `client_address`
- `description`
- `invoice_category`
- `invoice_mode`
- `tax_type`
- `instance`
- `invoice_bm_km`
- `invoice_bm_km_date`
- `bruto`
- `discount`
- `dpp`
- `ppn`
- `ppn_percentage`
- `dp`
- `other`
- `total`
- `include_ppn`
- `use_old_letterhead`
- `without_payment_posting`
- `stamp_and_signature`
- `auto_journal`
- `pass_protelasi`
- `is_paid`

UI create invoice yang harus kamu lihat di frontend:
- `Nomor Invoice` -> `number`
- `Tanggal Invoice` -> `date`
- `Tanggal Jatuh Tempo` -> `due_date`
- `Periode` -> `period`
- `Invoice Type` -> `invoice_type_id`
- `Bank` -> `bank_id`
- `Work Order` -> `work_order_id`
- `Klien` -> `client_id`  | biasanya ikut terisi dari work order
- `Kategori Invoice` -> `invoice_category`
- `Mode Invoice` -> `invoice_mode`
- `Jangka Waktu Kredit` -> `terms_days`, dipakai untuk hitung `due_date`
- `Include PPN` -> `include_ppn`
- `Auto Journal` -> `auto_journal`
- `Sudah Lunas` -> `is_paid`
- `Deskripsi / Catatan` -> `description` dan tetap kompatibel ke `notes`

Catatan penting:
- create invoice hanya boleh untuk `finance_admin` dan `super_admin`
- periode `2026-03` sudah locked, jadi pakai `2026-04` untuk testing create
- form create invoice minimal harus pilih `Invoice Type`, `Bank`, `Work Order`, `Klien`, dan `Periode`
- `Invoice Type`, `Bank`, dan `Work Order` harus ambil data aktif yang memang sudah ada di backend
- kalau `Klien` belum muncul, cek dulu apakah `Work Order` yang dipilih valid
- `number` boleh kosong kalau frontend memang auto-generate
- `terms_days` boleh diisi atau diabaikan kalau UI menghitung `due_date` otomatis, tapi di form ini nilainya tetap dipakai agar tanggal jatuh tempo konsisten
- kalau item invoice belum siap, simpan header invoice dulu lalu lanjut ke menu `Invoice Items`

Contoh payload create A:
```json
{
  "number": "INV-202604-0001",
  "invoice_type_id": 4,
  "client_id": 7,
  "bank_id": 9,
  "work_order_id": 4,
  "period": "2026-04",
  "date": "2026-04-27",
  "due_date": "2026-05-27",
  "terms_days": 30,
  "description": "Testing invoice frontend A",
  "invoice_category": "LICENSE",
  "invoice_mode": "NORMAL",
  "include_ppn": true,
  "auto_journal": true,
  "is_paid": false
}
```

Contoh payload create B:
```json
{
  "number": "INV-202604-0002",
  "invoice_type_id": 3,
  "client_id": 7,
  "bank_id": 3,
  "work_order_id": 4,
  "period": "2026-04",
  "date": "2026-04-27",
  "due_date": "2026-05-12",
  "terms_days": 15,
  "description": "Testing invoice frontend B",
  "invoice_category": "PRODUCT",
  "invoice_mode": "NORMAL",
  "include_ppn": true,
  "auto_journal": true,
  "is_paid": false
}
```

### Invoice Items

Tampilan UI:
- sidebar `Invoice Items`

Menu ini ada di sidebar sebagai fitur terpisah, bukan di modal `Invoices`.

Field backend:
- `invoice_id`
- `master_item_product_id`
- `item_code`
- `item_name`
- `description`
- `qty`
- `unit`
- `price`
- `bruto`
- `months`

UI invoice item yang kamu isi di frontend:
- pilih `Invoice` yang sudah disimpan
- pilih `Master Item Product`
- isi `Qty`
- isi `Price`
- isi `Months`
- isi `Description` jika perlu
- `Unit`, `item_code`, `item_name`, dan `bruto` diikuti dari master item product / hasil hitung frontend

Catatan alur:
- simpan invoice header dulu dari menu `Invoices`
- buka sidebar `Invoice Items`
- pilih invoice yang sudah ada
- tambahkan detail item di sana
- item tidak lagi dimasukkan dari modal invoice header

Contoh payload create A:
```json
{
  "invoice_id": "<id invoice INV-202604-0001>",
  "master_item_product_id": 12,
  "item_code": "MIP001",
  "item_name": "LICENSI APLIKASI",
  "description": "Biaya lisensi bulanan",
  "qty": 1,
  "unit": "PCS",
  "price": 1000000,
  "months": 1
}
```

Contoh payload create B:
```json
{
  "invoice_id": "<id invoice INV-202604-0002>",
  "master_item_product_id": 8,
  "item_code": "LSA",
  "item_name": "LISENSI APLIKASI SIGMA",
  "description": "Biaya service dan maintenance",
  "qty": 2,
  "unit": "UNIT",
  "price": 250000,
  "months": 1
}
```

Catatan:
- kalau `bruto` tidak dikirim, backend akan hitung dari `qty x price`
- invoice item tidak boleh diubah jika invoice sudah posted
- beberapa master item product bisa `is_active = false`, tapi tetap bisa muncul di data existing untuk testing

### Payments

Tampilan UI:
- sidebar `Payments`

Field backend:
- `number`
- `date`
- `invoice_id`
- `client_id`
- `description`
- `amount`

Contoh payload create A:
```json
{
  "number": "PAY-202604-0001",
  "date": "2026-04-27",
  "invoice_id": "<id invoice INV-202604-0001>",
  "client_id": 7,
  "description": "Pembayaran transfer BCA",
  "amount": 1054500
}
```

Contoh payload create B:
```json
{
  "number": "PAY-202604-0002",
  "date": "2026-04-27",
  "invoice_id": "<id invoice INV-202604-0002>",
  "client_id": 7,
  "description": "Pembayaran transfer Mandiri",
  "amount": 1110000
}
```

Catatan:
- `client_id` harus sama dengan client invoice
- dropdown invoice di frontend bisa menampilkan `number`, `invoice_number`, atau `no_invoice` tergantung response list
- create payment hanya boleh `finance_admin`, `ar_collector`, atau `super_admin`

### Debit/Credit Note

Tampilan UI:
- sidebar `Nota Debet/Kredit`

Field backend:
- `type`
- `number`
- `date`
- `invoice_id`
- `client_id`
- `description`
- `dpp_amount`
- `ppn_amount`
- `total_amount`
- `auto_journal`
- `is_posted`
- `items[]`

Catatan UI:
- `items[]` adalah detail baris nota, misalnya rincian adjustment per item atau per komponen nominal
- saat create, frontend fokus ke header nota dulu
- `items[]` bersifat opsional saat create jika backend belum menerima detail item
- kalau backend create sudah mengembalikan `items: []`, itu artinya header berhasil dibuat walaupun detail item belum diisi
- item nota bisa dilengkapi saat edit, supaya alur tetap aman dan sesuai response backend
- response item detail bisa memakai field `dpp_nota` dan `ppn_nota`

Contoh payload create A:
```json
{
  "type": "D",
  "number": "DCN-202604-0001",
  "date": "2026-04-27",
  "invoice_id": "<id invoice INV-202604-0001>",
  "client_id": 7,
  "description": "Adjustment test A",
  "dpp_amount": 100000,
  "ppn_amount": 11000,
  "total_amount": 111000,
  "auto_journal": true,
  "is_posted": false
}
```

Contoh payload create B:
```json
{
  "type": "K",
  "number": "DCN-202604-0002",
  "date": "2026-04-27",
  "invoice_id": "<id invoice INV-202604-0002>",
  "client_id": 7,
  "description": "Adjustment test B",
  "dpp_amount": 200000,
  "ppn_amount": 22000,
  "total_amount": 222000,
  "auto_journal": true,
  "is_posted": false
}
```

Yang dicek:
1. `type` hanya `D` atau `K`.
2. total amount harus konsisten dengan item.
3. summary journal harus balance.

Catatan tambahan:
- di backend ini, create tanpa `items[]` tetap valid
- kalau nanti mau kirim detail item, formatnya bisa seperti contoh berikut:

```json
{
  "type": "D",
  "number": "DCN-202604-0003",
  "date": "2026-04-27",
  "invoice_id": 10,
  "client_id": 7,
  "description": "Adjustment with item detail",
  "dpp_amount": 100000,
  "ppn_amount": 11000,
  "total_amount": 111000,
  "auto_journal": true,
  "is_posted": false,
  "items": [
    {
      "sequence": 1,
      "item_code": "ITEM-001",
      "item_name": "Adjustment Service",
      "dpp_amount": 100000,
      "ppn_amount": 11000
    }
  ]
}
```

### Invoice License / Invoice Produk

Tampilan UI:
- sidebar `Invoice License`
- sidebar `Invoice Produk / Non License`

Menu ini **GET-only** di frontend.

Yang dipakai saat testing:
- `GET /api/invoice-license` atau `GET /api/invoice-products` untuk daftar invoice
- `GET /api/invoice-license/{invoice}` atau `GET /api/invoice-products/{invoice}` untuk detail invoice
- `GET /api/invoice-license/{invoice}/summary-journal` atau `GET /api/invoice-products/{invoice}/summary-journal` untuk jurnal ringkas

Alur test kalau invoice-nya banyak:
1. buka tab `List / Daftar`
2. cari nomor invoice, kode klien, atau nama klien
3. klik ikon mata untuk membuka detail invoice yang dipilih
4. pindah ke tab `Detail`
5. tekan `Print` kalau mau cetak versi browser
6. kalau mau PDF, gunakan `Print Center`

Catatan:
- `Invoice License` khusus invoice license
- `Invoice Produk / Non License` khusus invoice produk / non license
- print di halaman detail mengambil data dari invoice yang sedang dipilih, bukan dari form create

## 5.17 Protection

Tampilan UI:
- sidebar `Proteksi`

Field backend:
- `period`
- `is_protected`
- `protected_at`
- `protected_by`

Contoh payload create A:
```json
{
  "period": "2026-04",
  "is_protected": true,
  "protected_at": "2026-04-27",
  "protected_by": 1
}
```

Contoh payload create B:
```json
{
  "period": "2026-05",
  "is_protected": true,
  "protected_at": "2026-05-01",
  "protected_by": 1
}
```

Yang dicek:
1. create proteksi periode baru.
2. pastikan write request ke periode terkunci ditolak.
3. `protected_by` harus user valid.

## 5.18 Reports, Journals, Print

Tampilan UI:
- sidebar `Laporan Fiskal`
- sidebar `Sales Reports`
- sidebar `AR Ledger`
- sidebar `Journals`
- sidebar `Print Center`

### Journals

Data yang sudah ada:
- invoice posting `001/504/LP/1025`
- posting payment `BP-202603-0001`

Yang dicek:
- debit dan kredit balance
- filter tanggal dan document number jalan

### Reports

Yang paling penting untuk diverifikasi:
- `Dashboard`
- `AR Ledger`
- `Sales Reports`
- `Invoice Register`
- `Invoice History`
- `Fiscal Report`
- `Cash Report`

Tips:
- kalau report kosong, cek dulu apakah transaksi sudah ada dan/atau sudah diposting

### Print Center

Tampilan UI:
- sidebar `Print Center`

Yang dicek:
- print invoice PDF
- print receipt PDF
- batch print jalan

Tips:
- print invoice satuan mengambil data dari invoice yang dipilih di `Invoice License` / `Invoice Produk / Non License`
- `GET /api/print/invoices/batch` dipakai untuk daftar batch invoice berdasarkan tanggal
- `POST /api/print/invoices/batch` dipakai untuk queue batch print
- `GET /api/print/invoices/{invoice}/pdf` dipakai untuk download PDF invoice per invoice
- `GET /api/print/receipts/{posting_payment}/pdf` dipakai untuk download PDF receipt
- kalau invoice sangat banyak, pakai filter tanggal di `Print Center` dulu supaya daftar print-nya lebih ringkas

## 6. Payload Cepat Yang Aman

### Team Member
```json
{
  "code": "07",
  "name": "BUDI SETIAWAN",
  "position": "SUPPORT",
  "status": "STATUS1",
  "is_active": true
}
```

### Product Group
```json
{
  "code": "SUPPORT",
  "name": "SUPPORT DAN MAINTENANCE",
  "acc_omzet": "5033",
  "cdf_piutang": "1535",
  "is_active": true
}
```

### Product
```json
{
  "code": "06",
  "name": "INVOICE PORTAL",
  "specification": "BILLING SYSTEM",
  "description": "Testing product frontend",
  "author_code": "03",
  "compiler": "LARAVEL 10",
  "year": "2026",
  "product_group_id": 1,
  "is_active": true
}
```

### Item
```json
{
  "code": "ITMTEST02",
  "name": "MODULE TEST",
  "acc_omzet": "5033",
  "acc_piutang": "1535",
  "cdf_omzet": "5033",
  "cdf_piutang": "1535",
  "is_active": true
}
```

### Master Item Product
```json
{
  "code": "MIP002",
  "name": "LICENSI DEMO",
  "unit": "PCS",
  "price": 1000000,
  "acc_omzet": "5033",
  "acc_omzet_np": "5033",
  "acc_piutang": "1535",
  "cdf_piutang": "1535",
  "is_active": true
}
```

### Client
```json
{
  "code": "CL002",
  "status": "NON GROUP",
  "name": "PT CUSTOMER DEMO",
  "address": "Jl. Raya No. 10",
  "city": "SURABAYA",
  "phone": "0311234567",
  "fax": "0311234568",
  "npwp": "00.000.000.0-000.000",
  "npkp": "01.234.567.8",
  "tax_name": "PT CUSTOMER DEMO",
  "tax_address": "Jl. Raya No. 10",
  "credit_term_days": 30,
  "is_active": true
}
```

### Bank
```json
{
  "code": "BK02",
  "name": "BANK BCA 2",
  "account_number": "1234567891",
  "account_name": "PT FITART NUSANTARA",
  "type": "M",
  "acc_code": "1201",
  "cdf_code": "1201",
  "is_active": true
}
```

### Work Order
```json
{
  "number": "WO-042026-0002",
  "date": "2026-04-27",
  "date_install": "2026-04-28",
  "start_license": "2026-04-28",
  "client_id": 7,
  "product_id": 5,
  "item_id": 1,
  "status": "AKTIF",
  "amount": 1000000,
  "description": "Implementasi modul keuangan",
  "item_count": 1,
  "per_unit": "UNIT",
  "notes": "Testing frontend",
  "team": [
    { "role": "implementor_1", "team_member_id": 1 },
    { "role": "programmer", "team_member_id": 4 },
    { "role": "system_analyst", "team_member_id": 6 }
  ]
}
```

### Debit/Credit Note
```json
{
  "type": "D",
  "number": "DCN-202604-0001",
  "date": "2026-04-27",
  "invoice_id": 10,
  "client_id": 7,
  "description": "Adjustment test A",
  "dpp_amount": 100000,
  "ppn_amount": 11000,
  "total_amount": 111000,
  "auto_journal": true,
  "is_posted": false
}
```

```json
{
  "type": "K",
  "number": "DCN-202604-0002",
  "date": "2026-04-27",
  "invoice_id": 10,
  "client_id": 7,
  "description": "Adjustment test B",
  "dpp_amount": 200000,
  "ppn_amount": 22000,
  "total_amount": 222000,
  "auto_journal": true,
  "is_posted": false
}
```

Catatan:
- `items[]` tidak wajib saat create
- `type` memakai `D` untuk Debit dan `K` untuk Kredit
- kalau backend belum mengisi detail item, response `items: []` sudah dianggap normal

### Stop License
```json
{
  "number": "SL-202604-0001",
  "date": "2026-04-27",
  "stop_date": "2026-04-27",
  "work_order_id": 4,
  "client_spv_code": "03",
  "notes": "BERHENTI",
  "is_stopped": true
}
```

### Tax Series / No. Seri Faktur Pajak
```json
{
  "filled_date": "2026-04-27",
  "period": "04-2026",
  "tax_code": "010",
  "start_number": "04239206",
  "end_number": "04239250",
  "ppn_percentage": 11,
  "dpp_percentage": 1.11
}
```

### Protection Period
```json
{
  "period": "2026-04",
  "is_protected": true,
  "protected_at": "2026-04-27",
  "protected_by": 1
}
```

## 7. Cara Membaca Error

### 422
Validasi gagal.

Penyebab umum:
- field wajib kosong
- nama field salah
- ID atau code relasi tidak ada
- code duplikat
- nilai tidak sesuai enum

### 401
Token atau login bermasalah.

### 403
Role tidak punya akses ke endpoint.

### 404
Endpoint salah atau ID yang dikirim tidak ada.

### 409
Data sudah posted / terkunci / tidak boleh diubah.

### 423
Periode terkunci oleh protection.

## 8. Checklist Final

- [ ] Login pakai user valid
- [ ] `GET` list tampil sebelum create
- [ ] Team Member CRUD dites
- [ ] Product Group CRUD dites
- [ ] Product CRUD dites
- [ ] Company CRUD dites
- [ ] Bank CRUD dites
- [ ] Client CRUD dites
- [ ] Invoice Type CRUD dites
- [ ] Item CRUD dites
- [ ] Master Item Product CRUD dites
- [ ] Company Settings simpan berhasil
- [ ] Tax Series bisa create dan next number
- [ ] Protection period mengunci periode
- [ ] Work Order create dan assign team jalan
- [ ] Installation create jalan
- [ ] Stop License create jalan
- [ ] Invoice create jalan di periode yang tidak terkunci
- [ ] Invoice Item create jalan
- [ ] Payment validasi client matching invoice
- [ ] Debit/Credit Note summary journal balance
- [ ] Journals, reports, dan print bisa dibuka

## 9. Catatan Penting

- Guide ini disusun dari data database lokal yang benar-benar ada saat 27 April 2026.
- `Companies` dan `Setup > Company Settings` adalah dua tabel yang berbeda.
- `author_code` pada Product harus mengarah ke `team_members.code`.
- `client_spv_code` pada Stop License juga mengarah ke `team_members.code`.
- `Master Item Product` tidak perlu mengirim `cdf_omzet` dari frontend, karena controller tidak memakainya.
- untuk modul yang punya `deleted_at`, hapus data dari UI sebaiknya dianggap soft delete, bukan purge permanen
- jadi record masih tersimpan di database sebagai data terhapus dan bisa dipakai untuk audit atau restore
- Periode `2026-03` sudah terkunci, jadi pakai periode lain untuk testing create/update finance.
