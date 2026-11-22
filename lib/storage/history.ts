import type { Bill, BillTotals } from '@/lib/types'

// v1 entries (key 'bilbil-history') have an incompatible shape and are intentionally not read.
const KEY = 'bilbil-history-v2'
const MAX = 20

export type HistoryEntry = { bill: Bill; totals: BillTotals }

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((e) => e?.bill?.id && e?.totals) : []
  } catch {
    return []
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  const rest = getHistory().filter((e) => e.bill.id !== entry.bill.id)
  localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX)))
}

export function deleteFromHistory(billId: string): void {
  localStorage.setItem(KEY, JSON.stringify(getHistory().filter((e) => e.bill.id !== billId)))
}
