'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DebouncedSearchProps<T> {
  searchFn: (query: string) => Promise<T[]>
  onSelect: (item: T) => void
  getLabel: (item: T) => string
  getValue: (item: T) => string
  placeholder?: string
  minChars?: number
  debounceMs?: number
}

/**
 * Reusable debounced search component
 * Usage:
 * <DebouncedSearch<Bank>
 *   searchFn={searchBanks}
 *   onSelect={(bank) => {...}}
 *   getLabel={(bank) => bank.name}
 *   getValue={(bank) => bank.id.toString()}
 *   placeholder="Cari bank..."
 * />
 */
export function DebouncedSearch<T>({
  searchFn,
  onSelect,
  getLabel,
  getValue,
  placeholder = 'Cari...',
  minChars = 2,
  debounceMs = 300,
}: DebouncedSearchProps<T>) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search
  useEffect(() => {
    if (searchTerm.length < minChars) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await searchFn(searchTerm)
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Pencarian gagal')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, minChars, debounceMs, searchFn])

  const handleSelect = useCallback(
    (item: T) => {
      onSelect(item)
      setSearchTerm('')
      setOpen(false)
    },
    [onSelect]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="w-full"
        />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : results.length === 0 ? (
            <CommandEmpty>
              {searchTerm.length < minChars
                ? `Ketik minimal ${minChars} karakter`
                : 'Tidak ada hasil'}
            </CommandEmpty>
          ) : (
            <CommandGroup>
              {results.map((item) => (
                <CommandItem
                  key={getValue(item)}
                  value={getValue(item)}
                  onSelect={() => handleSelect(item)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      getValue(item) === getValue(item) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {getLabel(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
