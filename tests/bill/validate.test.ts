import { expect, test } from 'vitest'
import { validateBill } from '@/lib/bill/validate'
import { initialBill } from '@/lib/bill/reducer'
import type { Bill } from '@/lib/types'

const base = (): Bill => ({
  ...initialBill('umum'),
  people: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }],
})

test('no items is not ok', () => {
  const v = validateBill(base())
  expect(v.ok).toBe(false)
  expect(v.errors).toEqual(['Belum ada item'])
})

test('unassigned items block calculation', () => {
  const v = validateBill({ ...base(), items: [{ id: 'x', name: 'x', price: 1, assignees: [] }, { id: 'y', name: 'y', price: 1, assignees: ['A'] }] })
  expect(v.ok).toBe(false)
  expect(v.unassignedItemIds).toEqual(['x'])
})

test('person with no items does not block calculation', () => {
  const v = validateBill({ ...base(), items: [{ id: 'y', name: 'y', price: 1, assignees: ['A'] }] })
  expect(v.ok).toBe(true)
})

test('an item whose only assignee was removed counts as unassigned', () => {
  const v = validateBill({ ...base(), items: [{ id: 'g', name: 'Nasi', price: 20000, assignees: ['ghost'] }] })
  expect(v.ok).toBe(false)
  expect(v.unassignedItemIds).toEqual(['g'])
})
