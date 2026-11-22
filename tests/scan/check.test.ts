import { expect, test } from 'vitest'
import { checkReceipt } from '@/lib/scan/check'
import { receipt1, receipt2 } from './fixtures'

test('both real receipts reconcile', () => {
  expect(checkReceipt(receipt1)).toEqual({ itemsDiff: 0, totalDiff: 0, ok: true })
  // receipt 2: items 85 000 + take away 1 500 = subtotal 86 500 on the receipt
  expect(checkReceipt(receipt2).ok).toBe(true)
})

test('a total off by 1000 is flagged', () => {
  const r = checkReceipt({ ...receipt1, total: 70000 })
  expect(r.totalDiff).toBe(-1000)
  expect(r.ok).toBe(false)
})

test('items that do not add up to the subtotal are flagged', () => {
  const r = checkReceipt({ ...receipt1, subtotal: 70000, total: 70000 })
  expect(r.itemsDiff).toBe(-1000)
  expect(r.ok).toBe(false)
})
