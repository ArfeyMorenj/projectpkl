export type InvoiceKind = "license" | "product"

export type InvoiceSummary = {
  noInvoice: string
  kind: InvoiceKind
  sourceCode: string
  tanggal: string
  jatuhTempo: string
  kodeKlien: string
  namaKlien: string
  keterangan: string
  dpp: number
  ppn: number
  total: number
}

export type PaymentSummary = {
  noPembayaran: string
  tanggal: string
  noInvoice: string
  kodeKlien: string
  namaKlien: string
  nominal: number
  keterangan: string
}

export type PostingSummary = {
  noPosting: string
  bankCode: string
  tanggal: string
  keterangan: string
  kodeKlien: string
  namaKlien: string
  totalInvoice: number
  kredit: number
  totalBayar: number
  invoices: string[]
}

export const invoiceSummaries: InvoiceSummary[] = [
  {
    noInvoice: "001/S04/LP/1025",
    kind: "license",
    sourceCode: "S04",
    tanggal: "2025-10-11",
    jatuhTempo: "2025-10-18",
    kodeKlien: "0047",
    namaKlien: "PT Prambanan Dwipaka",
    keterangan: "BIAYA SERVER, LICENSE & MAINTENANCE OKT 25",
    dpp: 3000000,
    ppn: 330000,
    total: 3330000,
  },
  {
    noInvoice: "007/S04/LP/1025",
    kind: "license",
    sourceCode: "S04",
    tanggal: "2025-10-07",
    jatuhTempo: "2025-10-17",
    kodeKlien: "00054",
    namaKlien: "FITNESS PLUS INDONESIA",
    keterangan: "LICENSE Okt 2025",
    dpp: 11250000,
    ppn: 1237500,
    total: 12487500,
  },
  {
    noInvoice: "001/S05/PP/0925",
    kind: "product",
    sourceCode: "S05",
    tanggal: "2025-09-02",
    jatuhTempo: "2025-09-09",
    kodeKlien: "0047",
    namaKlien: "PT Prambanan Dwipaka",
    keterangan: "UPGRADE JARINGAN LAN",
    dpp: 3013874,
    ppn: 331526,
    total: 3345400,
  },
]

export const paymentSummaries: PaymentSummary[] = [
  {
    noPembayaran: "001/MIS/T0925",
    tanggal: "2025-09-10",
    noInvoice: "001/S04/LP/1025",
    kodeKlien: "0047",
    namaKlien: "PT Prambanan Dwipaka",
    nominal: 3330000,
    keterangan: "PEMBAYARAN LICENSE 001/S04/LP/1025",
  },
]

export const postingSummaries: PostingSummary[] = [
  {
    noPosting: "BM01-JA001/0925",
    bankCode: "BM01",
    tanggal: "2025-09-10",
    keterangan: "PEMBAYARAN LICENSE 001/S04/LP/1025",
    kodeKlien: "0047",
    namaKlien: "PT Prambanan Dwipaka",
    totalInvoice: 3330000,
    kredit: 0,
    totalBayar: 3330000,
    invoices: ["001/S04/LP/1025"],
  },
]

