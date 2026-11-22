import { expect, test } from 'vitest'
import { receiptToBill } from '@/lib/scan/to-bill'
import { computeBill } from '@/lib/bill/compute'
import { initialBill } from '@/lib/bill/reducer'
import { catalog } from './catalog-fixture'
import { receipt1, receipt2 } from './fixtures'

test('receipt 2 becomes items, fees and a fixed promo', () => {
  const out = receiptToBill(receipt2, catalog, 'normal')
  expect(out.items).toHaveLength(3)
  expect(out.items[0]).toMatchObject({ name: 'Kopi Kenangan Mantan', price: 25000, detail: 'Large · Normal Ice', assignees: [], catalog: { menuItemId: 'mantan', size: 'L', modifierIds: [] } })
  expect(out.items[0].needsCheck).toBeFalsy()
  expect(out.items[1]).toMatchObject({ name: 'Kopi Kenangan Mantan Ice...', price: 28000, detail: 'Normal Ice', needsCheck: true })
  expect(out.fees.delivery).toBe(11500)
  expect(out.fees.others.map((f) => [f.name, f.amount])).toEqual([['Take Away 2', 1500]])
  expect(out.appPromo).toEqual({ kind: 'discountFixed', amount: 34000 })
  expect(out.suggestedOrderType).toBe('delivery')
})

test('receipt 2 through the bill engine pays exactly the receipt total', () => {
  const out = receiptToBill(receipt2, catalog, 'normal')
  const people = [{ id: 'A', name: 'A' }]
  const bill = { ...initialBill('kopken'), people, items: out.items.map((i) => ({ ...i, assignees: ['A'] })), fees: out.fees, appPromo: out.appPromo }
  expect(computeBill(bill).paid).toBe(receipt2.total)
})

test('receipt 1 cashback becomes a cashback promo', () => {
  expect(receiptToBill(receipt1, catalog, 'normal').appPromo).toEqual({ kind: 'cashbackPct', pct: 30, max: 30000 })
})

test('qty 2 line becomes two unit items', () => {
  const out = receiptToBill({ ...receipt1, items: [{ qty: 2, name: 'Kopi Kenangan Mantan Ice...', lineTotal: 50000 }] }, catalog, 'normal')
  expect(out.items.map((i) => i.price)).toEqual([25000, 25000])
  expect(new Set(out.items.map((i) => i.id)).size).toBe(2)
})

test('no promo and no cashback gives none', () => {
  const { cashbackPct, cashbackMax, ...plain } = receipt1
  void [cashbackPct, cashbackMax]
  expect(receiptToBill(plain, catalog, 'normal').appPromo).toEqual({ kind: 'none' })
})

test('every scanned item is marked as coming from the receipt', () => {
  expect(receiptToBill(receipt2, catalog, 'normal').items.every((i) => i.fromReceipt)).toBe(true)
})
