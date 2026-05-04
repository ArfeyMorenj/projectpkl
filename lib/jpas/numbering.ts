function mmYY(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yy = String(date.getFullYear()).slice(-2)
  return `${mm}${yy}`
}

function mm(date: Date) {
  return String(date.getMonth() + 1).padStart(2, "0")
}

function yy(date: Date) {
  return String(date.getFullYear()).slice(-2)
}

export function formatWorkOrderNo(sequence: number, date = new Date()) {
  return `${String(sequence).padStart(3, "0")}/MIS-JP/${mmYY(date)}`
}

export function formatStopLicenseNo(sequence: number, date = new Date()) {
  return `${String(sequence).padStart(3, "0")}/MIS-${mm(date)}/${yy(date)}`
}

export function formatInvoiceLicenseNo(sequence: number, sourceCode: string, date = new Date()) {
  return `${String(sequence).padStart(3, "0")}/${sourceCode}/LP/${mmYY(date)}`
}

export function formatInvoiceProductNo(sequence: number, sourceCode: string, date = new Date()) {
  return `${String(sequence).padStart(3, "0")}/${sourceCode}/PP/${mmYY(date)}`
}

export function formatPostingNo(bankCode: string, sequence: number, date = new Date()) {
  return `${bankCode}-JA${String(sequence).padStart(3, "0")}/${mmYY(date)}`
}

export function formatPaymentNo(sequence: number, date = new Date()) {
  return `${String(sequence).padStart(3, "0")}/MIS/T${mmYY(date)}`
}
