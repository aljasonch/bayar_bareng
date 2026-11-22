import type { Bill } from '@/lib/types'

export type BillValidation = { ok: boolean; unassignedItemIds: string[]; emptyPeopleIds: string[]; errors: string[] }

export function validateBill(bill: Bill): BillValidation {
  const errors: string[] = []
  if (bill.items.length === 0) errors.push('Belum ada item')
  const unassignedItemIds = bill.items.filter((item) => item.assignees.length === 0).map((item) => item.id)
  if (unassignedItemIds.length > 0) errors.push(`${unassignedItemIds.length} item belum dibagi`)
  const emptyPeopleIds = bill.people
    .filter((p) => !bill.items.some((item) => item.assignees.includes(p.id)))
    .map((p) => p.id)
  return { ok: errors.length === 0, unassignedItemIds, emptyPeopleIds, errors }
}
