'use client'

export function toBooleanFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'active', 'aktif', 'yes', 'y', 'on'].includes(normalized)
  }
  return false
}
