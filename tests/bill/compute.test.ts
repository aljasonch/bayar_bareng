import { describe, expect, test } from 'vitest'
import { computeBill } from '@/lib/bill/compute'
import type { AppPromo, Bill, BillItem, Fees, PaymentPromo } from '@/lib/types'

const NONE = { kind: 'none' } as const
const BLU: PaymentPromo = { kind: 'discountPct', pct: 40, max: 25000, minSpend: 50000 }

function mk(
  items: [number, string[]][],
  people: string[],
  fees: Partial<Fees> = {},
  appPromo: AppPromo = NONE,
  paymentPromo: PaymentPromo = NONE,
): Bill {
  return {
    id: 'b', createdAt: '', mode: 'kopken', outlet: 'normal', date: '2026-11-22',
    people: people.map((id) => ({ id, name: id })),
    items: items.map(([price, assignees], i): BillItem => ({ id: `i${i}`, name: `item ${i}`, price, assignees })),
    fees: { delivery: 0, others: [], ...fees },
    appPromo, paymentPromo,
  }
}

describe('computeBill', () => {
  test('confirmed delivery B example', () => {
    const t = computeBill(mk([[100000, ['A']]], ['A'], { delivery: 11500 },
      { kind: 'discountPct', pct: 35, max: 45000, minSpend: 100000 }, BLU))
    expect(t.appDiscount).toBe(35000)
    expect(t.totalPayment).toBe(76500)
    expect(t.paymentDiscount).toBe(25000)
    expect(t.paid).toBe(51500)
    expect(t.perPerson[0].final).toBe(51500)
  })

  test('app min spend not met', () => {
    const t = computeBill(mk([[80000, ['A']]], ['A'], {}, { kind: 'discountPct', pct: 25, max: 30000, minSpend: 85000 }))
    expect(t.appDiscount).toBe(0)
    expect(t.appShortBy).toBe(5000)
  })

  test('payment min not met', () => {
    const t = computeBill(mk([[40000, ['A']]], ['A'], {}, NONE, BLU))
    expect(t.paymentDiscount).toBe(0)
    expect(t.paymentShortBy).toBe(10000)
    expect(t.paid).toBe(40000)
  })

  test('pickup receipt 1 with cashback', () => {
    const t = computeBill(mk([[19000, ['A']], [25000, ['B']], [25000, ['C']]], ['A', 'B', 'C'], {},
      { kind: 'cashbackPct', pct: 30, max: 30000 }))
    expect(t.cashback).toBe(20700)
    expect(t.paid).toBe(69000)
    expect(t.perPerson.map((p) => p.cashback)).toEqual([5700, 7500, 7500])
    expect(t.perPerson.map((p) => p.final)).toEqual([13300, 17500, 17500])
  })

  test('delivery receipt 2 with fixed promo', () => {
    const t = computeBill(mk([[25000, ['A']], [28000, ['B']], [32000, ['C']]], ['A', 'B', 'C'],
      { delivery: 11500, others: [{ id: 'f', name: 'Take Away', amount: 1500 }] },
      { kind: 'discountFixed', amount: 34000 }))
    expect(t.totalPayment).toBe(64000)
    expect(t.paid).toBe(64000)
    expect(t.perPerson.reduce((s, p) => s + p.final, 0)).toBe(64000)
  })

  test('shared item split equally', () => {
    const t = computeBill(mk([[6000, ['A', 'B', 'C']]], ['A', 'B', 'C']))
    expect(t.perPerson.map((p) => p.itemTotal)).toEqual([2000, 2000, 2000])
  })

  test('rounding sums exactly', () => {
    const t = computeBill(mk([[10001, ['A']], [10001, ['B']], [10001, ['C']]], ['A', 'B', 'C'], { delivery: 1000 },
      NONE, { kind: 'discountPct', pct: 40, max: 0, minSpend: 0 }))
    const sum = t.perPerson.reduce((s, p) => s + p.final, 0)
    expect(sum).toBe(Math.round(t.paid - t.cashback))
    t.perPerson.forEach((p) => expect(Number.isInteger(p.final)).toBe(true))
  })

  test('fees split equally', () => {
    const t = computeBill(mk([[10000, ['A']], [30000, ['B']]], ['A', 'B'], { delivery: 11500 }))
    expect(t.perPerson.map((p) => p.fees)).toEqual([5750, 5750])
  })

  test('discount cap applies', () => {
    const t = computeBill(mk([[200000, ['A']]], ['A'], {}, { kind: 'discountPct', pct: 35, max: 45000, minSpend: 100000 }))
    expect(t.appDiscount).toBe(45000)
  })
})

test('ghost assignees are ignored when splitting a shared item', () => {
  const bill = mk([[6000, ['A', 'ghost']]], ['A'])
  const t = computeBill(bill)
  expect(t.perPerson[0].itemTotal).toBe(6000)
  expect(t.perPerson[0].final).toBe(6000)
})
