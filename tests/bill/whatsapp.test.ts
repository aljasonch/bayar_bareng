import { expect, test } from 'vitest'
import { whatsappText, whatsappUrl } from '@/lib/bill/whatsapp'
import { computeBill } from '@/lib/bill/compute'
import { initialBill } from '@/lib/bill/reducer'
import type { Bill } from '@/lib/types'

const bill: Bill = {
  ...initialBill('kopken'),
  date: '2026-11-15',
  outlet: 'mall',
  payerName: 'Jason',
  payerAccount: '123',
  people: [{ id: 'A', name: 'Jason' }, { id: 'B', name: 'Rina' }],
  items: [
    { id: '1', name: 'Mantan', detail: 'Large · No Ice', price: 60000, assignees: ['A'] },
    { id: '2', name: 'Roti', price: 40000, assignees: ['A', 'B'] },
  ],
  fees: { delivery: 10000, others: [] },
  appPromo: { kind: 'discountPct', pct: 10, max: 0, minSpend: 0 },
  paymentPromo: { kind: 'discountPct', pct: 10, max: 0, minSpend: 0 },
}

test('whatsapp text has header, per-person lines and footer', () => {
  const t = whatsappText(bill, computeBill(bill))
  const lines = t.split('\n')
  expect(lines.slice(0, 5)).toEqual([
    '*Bilbil - Split Bill*',
    'Tanggal split: 15 November 2026',
    'Store: Kopi Kenangan (Mall Store)',
    'Ditalangi oleh: *Jason*',
    'No. Rek: 123',
  ])
  expect(t).toContain('*Jason*\n  - Mantan: Rp 60.000\n    Large · No Ice\n  - Roti (1/2): Rp 20.000\n  Diskon: -Rp 8.000\n  Ongkir & biaya: +Rp 5.000\n  Promo bayar: -Rp 7.700\n  *Bayar: Rp 69.300*')
  expect(t).not.toContain('Cashback')
  expect(lines.at(-2)).toBe('*Total: Rp 90.000*')
  expect(lines.at(-1)).toBe('Total hemat: Rp 20.000')
})

test('umum mode has no store line and url encodes the text', () => {
  const b = { ...bill, mode: 'umum' as const, payerName: undefined }
  const t = whatsappText(b, computeBill(b))
  expect(t).not.toContain('Store:')
  expect(t).not.toContain('Ditalangi')
  expect(whatsappUrl(b, computeBill(b))).toBe(`https://wa.me/?text=${encodeURIComponent(t)}`)
})
