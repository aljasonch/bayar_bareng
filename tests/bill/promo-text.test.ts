import { expect, test } from 'vitest'
import { describeAppPromo, describeCombo, describePaymentPromo } from '@/lib/bill/promo-text'

test('describes each app promo kind', () => {
  expect(describeAppPromo({ kind: 'discountPct', pct: 35, max: 45000, minSpend: 100000 })).toBe('Diskon 35% maks 45rb, min 100rb')
  expect(describeAppPromo({ kind: 'discountPct', pct: 15, max: 10000, minSpend: 0 })).toBe('Diskon 15% maks 10rb')
  expect(describeAppPromo({ kind: 'discountPct', pct: 10, max: 0, minSpend: 0 })).toBe('Diskon 10%')
  expect(describeAppPromo({ kind: 'cashbackPct', pct: 30, max: 30000 })).toBe('Cashback 30% maks 30rb')
  expect(describeAppPromo({ kind: 'discountFixed', amount: 34000 })).toBe('Potongan 34rb')
  expect(describeAppPromo({ kind: 'discountFixed', amount: 1500 })).toBe('Potongan Rp 1.500')
  expect(describeAppPromo({ kind: 'none' })).toBe('')
})

test('describes payment promo and the combo', () => {
  const blu = { kind: 'discountPct', pct: 40, max: 25000, minSpend: 50000 } as const
  expect(describePaymentPromo(blu)).toBe('Bayar 40% maks 25rb, min 50rb')
  expect(describeCombo({ appPromo: { kind: 'cashbackPct', pct: 30, max: 30000 }, paymentPromo: blu })).toBe(
    'Cashback 30% maks 30rb + Bayar 40% maks 25rb, min 50rb',
  )
  expect(describeCombo({ appPromo: { kind: 'none' }, paymentPromo: { kind: 'none' } })).toBe('Tanpa promo')
})
