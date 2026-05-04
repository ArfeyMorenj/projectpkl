export function toNumber(value: string | number) {
  if (typeof value === "number") return value
  if (!value) return 0
  const normalized = value.replace(/[^\d.-]/g, "")
  const num = Number(normalized)
  return Number.isNaN(num) ? 0 : num
}

export function calculateDpp(bruto: string | number, discount: string | number) {
  const result = toNumber(bruto) - toNumber(discount)
  return result < 0 ? 0 : result
}

export function calculatePpn(dpp: string | number, ppnPct: string | number) {
  return (toNumber(dpp) * toNumber(ppnPct)) / 100
}

export function calculateTotal(dpp: string | number, ppn: string | number) {
  return toNumber(dpp) + toNumber(ppn)
}

export function calculateTotalTagihan(total: string | number, dp: string | number, lain1: string | number, lain2: string | number) {
  return toNumber(total) - toNumber(dp) - toNumber(lain1) - toNumber(lain2)
}

export function idr(value: number) {
  return value.toLocaleString("id-ID")
}
