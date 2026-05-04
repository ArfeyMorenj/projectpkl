'use client'

import { useEffect, useState } from 'react'

type IdentifiedRow = {
  id: string | number
}

function readRowsFromStorage<T extends IdentifiedRow>(storageKey: string): T[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeRowsToStorage<T extends IdentifiedRow>(storageKey: string, rows: T[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(rows))
  } catch {
    // Ignore storage quota and serialization issues.
  }
}

export function mergePersistedRows<T extends IdentifiedRow>(currentRows: T[], incomingRows: T[]) {
  const merged = new Map<string | number, T>()

  for (const row of incomingRows) {
    merged.set(row.id, row)
  }

  for (const row of currentRows) {
    if (!merged.has(row.id)) {
      merged.set(row.id, row)
    }
  }

  return Array.from(merged.values())
}

export function upsertPersistedRow<T extends IdentifiedRow>(rows: T[], nextRow: T) {
  const merged = rows.filter((row) => row.id !== nextRow.id)
  merged.push(nextRow)
  return merged
}

export function removePersistedRow<T extends IdentifiedRow>(rows: T[], id: string | number) {
  return rows.filter((row) => row.id !== id)
}

export function softDeletePersistedRow<T extends IdentifiedRow & { deleted_at?: string | null }>(
  rows: T[],
  id: string | number
) {
  const deletedAt = new Date().toISOString()

  return rows.map((row) =>
    row.id === id
      ? {
          ...row,
          deleted_at: deletedAt,
        }
      : row
  )
}

export function usePersistedRows<T extends IdentifiedRow>(
  storageKey: string,
  remoteRows?: T[] | null
) {
  const [rows, setRows] = useState<T[]>(() => readRowsFromStorage<T>(storageKey))

  useEffect(() => {
    if (!remoteRows) {
      return
    }

    setRows((currentRows) => mergePersistedRows(currentRows, remoteRows))
  }, [remoteRows])

  useEffect(() => {
    writeRowsToStorage(storageKey, rows)
  }, [rows, storageKey])

  return {
    rows,
    setRows,
  }
}
