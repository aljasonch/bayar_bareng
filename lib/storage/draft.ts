import type { Bill, BillMode } from '@/lib/types'

export type Draft = { bill: Bill; step: 'items' | 'promo' | 'result' }

// sessionStorage: survives reloads and the back gesture within the tab, gone when the tab closes.
const key = (mode: BillMode) => `bilbil-draft-${mode}`

export function loadDraft(mode: BillMode): Draft | null {
  if (typeof window === 'undefined') return null
  try {
    const d = JSON.parse(sessionStorage.getItem(key(mode)) ?? 'null') as Draft | null
    return d?.bill?.mode === mode && Array.isArray(d.bill.items) && Array.isArray(d.bill.people) ? d : null
  } catch {
    return null
  }
}

export function saveDraft(draft: Draft): void {
  sessionStorage.setItem(key(draft.bill.mode), JSON.stringify(draft))
}

export function clearDraft(mode: BillMode): void {
  sessionStorage.removeItem(key(mode))
}
