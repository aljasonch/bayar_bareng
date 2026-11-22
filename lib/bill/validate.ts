import type { Bill } from '@/lib/types'

export type BillValidation = { ok: boolean; unassignedItemIds: string[]; errors: string[] }

export function validateBill(bill: Bill): BillValidation {
  const errors: string[] = []
  if (bill.items.length === 0) errors.push('Belum ada item')
  const ids = new Set(bill.people.map((p) => p.id))
  const unassignedItemIds = bill.items.filter((item) => !item.assignees.some((a) => ids.has(a))).map((item) => item.id)
  if (unassignedItemIds.length > 0) errors.push(`${unassignedItemIds.length} item belum dibagi`)
  return { ok: errors.length === 0, unassignedItemIds, errors }
}
