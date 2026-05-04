// Debit/Credit Note Types
export interface DebitCreditNoteItem {
  id?: number
  sequence?: number
  item_code?: string
  item_name?: string
  description?: string
  dpp_amount: number
  ppn_amount: number
  dpp_nota?: number
  ppn_nota?: number
  total_amount?: number
}

export interface DebitCreditNote {
  id: number
  jenis?: string
  type: 'D' | 'K'
  number: string
  date: string
  invoice_id: number
  client_id: number
  client_code?: string
  client_name?: string
  description: string
  dpp_amount: number
  ppn_amount: number
  total_amount: number
  auto_journal: boolean
  is_posted: boolean
  detail_invoice?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface DebitCreditNoteDetail {
  header: {
    id: number
    jenis: 'D' | 'K'
    number: string
    date: string
    client_code: string
    client_name: string
    description: string
    auto_journal: boolean
    detail_invoice: string
    total_dpp: number
    total_ppn: number
    total_amount: number
    is_posted: boolean
  }
  items: DebitCreditNoteItem[]
}

export interface DebitCreditNoteListRow {
  note_id: number
  type: 'D' | 'K'
  number: string
  date: string
  client_code: string
  client_name: string
  description: string
  nominal_dpp: number
  nominal_ppn: number
  is_posted?: boolean
}

export interface CreateDebitCreditNoteRequest {
  type: 'D' | 'K'
  number: string
  date: string
  invoice_id: number
  client_id: number
  description: string
  dpp_amount: number
  ppn_amount: number
  total_amount: number
  auto_journal?: boolean
  is_posted?: boolean
  items?: DebitCreditNoteItem[]
}

export interface UpdateDebitCreditNoteRequest extends Partial<CreateDebitCreditNoteRequest> {}

// Response types
export interface DebitCreditNotesListResponse {
  success: boolean
  filter?: {
    date_from: string | null
    date_to: string | null
    number: string | null
    client_name: string | null
    q: string | null
  }
  total: number
  data: DebitCreditNoteListRow[]
  pageInfo?: {
    currentPage: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface DebitCreditNoteDetailResponse {
  success: boolean
  data: DebitCreditNoteDetail
}

export interface DebitCreditNoteMutationResponse {
  success: boolean
  message?: string
  data: DebitCreditNoteDetail
}

export interface DebitCreditNoteSummaryResponse {
  success: boolean
  note_number: string
  total_debit: number
  total_credit: number
  data: DebitCreditNoteSummaryRow[]
}

export interface DebitCreditNoteSummaryRow {
  no_bukti: string
  tgl: string
  seq: string
  kode_acc: string
  keterangan: string
  debet: number
  kredit: number
}
