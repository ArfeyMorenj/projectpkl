export type Coa = {
  code: string
  name: string
}

export type Client = {
  code: string
  name: string
  address: string
  city?: string
  phone?: string
  npwp?: string
}

export type TeamMember = {
  code: string
  name: string
  position: string
}

export type Product = {
  code: string
  name: string
  groupCode: string
  authorCode: string
}

export type ProductItem = {
  code: string
  name: string
  unit: string
  price: number
  accRevenue: string
  accReceivable: string
  cofReceivable: string
}

export type InstallationItem = {
  code: string
  name: string
  accRevenue: string
  accReceivable: string
  cofRevenue: string
  cofReceivable: string
}

export type BankMaster = {
  code: string
  name: string
  type: "M" | "H"
  acc: string
  cof: string
}

export type InvoiceType = {
  code: string
  name: string
  isLicense: boolean
}

export const coaMaster: Coa[] = [
  { code: "1101", name: "Kas/Tunai" },
  { code: "1111", name: "Deposit In Transit" },
  { code: "1201", name: "Bank BCA" },
  { code: "1202", name: "Bank Mandiri 1" },
  { code: "1203", name: "Bank Mandiri 2" },
  { code: "1204", name: "Bank BRI" },
  { code: "1513", name: "Piutang Umum" },
  { code: "1532", name: "Piutang Jasa Implementasi" },
  { code: "1533", name: "Piutang Lain-lain" },
  { code: "1535", name: "Piutang LSA" },
  { code: "3213", name: "Hutang PPN Keluaran" },
  { code: "3214", name: "Hutang PPN Masukan (-)" },
  { code: "5011", name: "Pendapatan Hardware/Sales" },
  { code: "5019", name: "Pendapatan Produk Lain" },
  { code: "5032", name: "Pendapatan Jasa Implementasi" },
  { code: "5033", name: "Pendapatan Lain-lain" },
]

export const clientsMaster: Client[] = [
  { code: "00054", name: "FITNESS PLUS INDONESIA", address: "Surabaya", city: "Surabaya", npwp: "42.718.163.4-901.000" },
  { code: "00049", name: "PT INTERNET INI SAJA", address: "Surabaya" },
  { code: "00016", name: "PT. GEDUNG EXPO WIRA JATIM", address: "Surabaya" },
  { code: "0047", name: "PT Prambanan Dwipaka", address: "Jl. Ngagel Jaya Tengah No.26 Surabaya", npwp: "01.133.245.4-431.000" },
]

export const teamMaster: TeamMember[] = [
  { code: "01", name: "IMAM S ARIFIN", position: "MANAGER AREA" },
  { code: "02", name: "EDY PRANOTO", position: "SYSTEM ANALYST" },
  { code: "03", name: "IMANG INDAH AYUNINGRUM", position: "ADMINISTRASI" },
  { code: "04", name: "ADIT", position: "PROGRAMMER" },
  { code: "05", name: "FITRI AMALIA", position: "ADM. KEUANGAN" },
]

export const productsMaster: Product[] = [
  { code: "01", name: "KEUANGAN (SIGMA FAST)", groupCode: "LSA", authorCode: "03" },
  { code: "02", name: "SIRKULASI (SIGMA SIRKULASI)", groupCode: "LSA", authorCode: "03" },
  { code: "03", name: "IKLAN KOLOM (SIGMA KOLOM)", groupCode: "LSA", authorCode: "03" },
]

export const productItemsMaster: ProductItem[] = [
  { code: "001", name: "CETAK RESI", unit: "BOX", price: 0, accRevenue: "5011", accReceivable: "1511", cofReceivable: "1511" },
  { code: "006", name: "PRODUK LAIN-LAIN", unit: "UNIT", price: 0, accRevenue: "5019", accReceivable: "1513", cofReceivable: "1513" },
  { code: "LSA", name: "LISENSI APLIKASI SIGMA", unit: "UNIT", price: 0, accRevenue: "5033", accReceivable: "1535", cofReceivable: "1535" },
]

export const installationItemsMaster: InstallationItem[] = [
  { code: "1", name: "INSTALL", accRevenue: "5032", accReceivable: "1532", cofRevenue: "5032", cofReceivable: "1532" },
  { code: "2", name: "LICENSE", accRevenue: "5033", accReceivable: "1535", cofRevenue: "5033", cofReceivable: "1535" },
  { code: "3", name: "MAINTENANCE", accRevenue: "5032", accReceivable: "1532", cofRevenue: "5032", cofReceivable: "1532" },
]

export const bankMaster: BankMaster[] = [
  { code: "BM00", name: "DEPOSIT IN TRANSIT", type: "M", acc: "1111", cof: "1111" },
  { code: "BM01", name: "BANK BCA 5600247257", type: "M", acc: "1201", cof: "1201" },
  { code: "BM02", name: "BANK MANDIRI 9358201-4", type: "M", acc: "1202", cof: "1202" },
  { code: "KH", name: "TUNAI/KAS", type: "H", acc: "1101", cof: "1101" },
]

export const invoiceTypesMaster: InvoiceType[] = [
  { code: "S01", name: "PENJUALAN HARDWARE", isLicense: false },
  { code: "S02", name: "PENJUALAN SOFTWARE", isLicense: false },
  { code: "S03", name: "PENDAPATAN JASA", isLicense: false },
  { code: "S04", name: "PENDAPATAN LICENSE", isLicense: true },
  { code: "S05", name: "PEROLEHAN LAINNYA", isLicense: false },
]
