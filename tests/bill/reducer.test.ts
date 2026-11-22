import { describe, expect, test } from 'vitest'
import { billReducer, initialBill } from '@/lib/bill/reducer'
import type { BillItem, PromoCombo } from '@/lib/types'

const item = (id: string, assignees: string[] = []): BillItem => ({ id, name: id, price: 1000, assignees })

describe('billReducer', () => {
  test('initialBill has today, normal outlet, empty fees, no promos', () => {
    const b = initialBill('kopken')
    expect(b.mode).toBe('kopken')
    expect(b.outlet).toBe('normal')
    expect(b.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(b.fees).toEqual({ delivery: 0, others: [] })
    expect(b.appPromo).toEqual({ kind: 'none' })
    expect(b.paymentPromo).toEqual({ kind: 'none' })
  })

  test('removePerson also removes them from item assignees', () => {
    let b = initialBill('umum')
    b = billReducer(b, { type: 'addPerson', person: { id: 'A', name: 'A' } })
    b = billReducer(b, { type: 'addPerson', person: { id: 'B', name: 'B' } })
    b = billReducer(b, { type: 'addItems', items: [item('x', ['A', 'B'])] })
    b = billReducer(b, { type: 'removePerson', id: 'A' })
    expect(b.people.map((p) => p.id)).toEqual(['B'])
    expect(b.items[0].assignees).toEqual(['B'])
  })

  test('toggleAssignee adds then removes', () => {
    let b = billReducer(initialBill('umum'), { type: 'addItems', items: [item('x')] })
    b = billReducer(b, { type: 'toggleAssignee', itemId: 'x', personId: 'A' })
    expect(b.items[0].assignees).toEqual(['A'])
    b = billReducer(b, { type: 'toggleAssignee', itemId: 'x', personId: 'A' })
    expect(b.items[0].assignees).toEqual([])
  })

  test('assignAll assigns every person', () => {
    let b = initialBill('umum')
    b = billReducer(b, { type: 'addPerson', person: { id: 'A', name: 'A' } })
    b = billReducer(b, { type: 'addPerson', person: { id: 'B', name: 'B' } })
    b = billReducer(b, { type: 'addItems', items: [item('x')] })
    b = billReducer(b, { type: 'assignAll', itemId: 'x' })
    expect(b.items[0].assignees).toEqual(['A', 'B'])
  })

  test('applyCombo sets both promos and comboId; manual app promo clears comboId', () => {
    const combo: PromoCombo = {
      id: 'c1', name: 'Pickup', orderType: 'pickup', sortOrder: 0,
      appPromo: { kind: 'cashbackPct', pct: 30, max: 30000 },
      paymentPromo: { kind: 'discountPct', pct: 40, max: 25000, minSpend: 50000 },
    }
    let b = billReducer(initialBill('kopken'), { type: 'applyCombo', combo })
    expect(b.comboId).toBe('c1')
    expect(b.appPromo).toEqual(combo.appPromo)
    expect(b.paymentPromo).toEqual(combo.paymentPromo)
    b = billReducer(b, { type: 'setAppPromo', promo: { kind: 'none' } })
    expect(b.comboId).toBeUndefined()
  })

  test('loadReceipt replaces items, fees and app promo', () => {
    let b = billReducer(initialBill('kopken'), { type: 'addItems', items: [item('old')] })
    b = billReducer(b, {
      type: 'loadReceipt', items: [item('new')], fees: { delivery: 11500, others: [] },
      appPromo: { kind: 'discountFixed', amount: 34000 },
    })
    expect(b.items.map((i) => i.id)).toEqual(['new'])
    expect(b.fees.delivery).toBe(11500)
    expect(b.appPromo).toEqual({ kind: 'discountFixed', amount: 34000 })
  })
})
