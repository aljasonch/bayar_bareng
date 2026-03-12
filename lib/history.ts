import { BillResult } from '@/types'

const STORAGE_KEY = 'bayar-bareng-history'
const MAX_ENTRIES = 20

export function getHistory(): BillResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as BillResult[]
  } catch {
    return []
  }
}

export function saveToHistory(result: BillResult): void {
  const history = getHistory()
  history.unshift(result)
  if (history.length > MAX_ENTRIES) {
    history.splice(MAX_ENTRIES)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((h) => h.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function getHistoryById(id: string): BillResult | undefined {
  return getHistory().find((h) => h.id === id)
}
