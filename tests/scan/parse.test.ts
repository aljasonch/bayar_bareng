import { expect, test } from 'vitest'
import { parseScannedReceipt, ScanParseError } from '@/lib/scan/parse'
import { receipt2 } from './fixtures'

test('a valid receipt passes through unchanged', () => {
  expect(parseScannedReceipt(JSON.parse(JSON.stringify(receipt2)))).toEqual(receipt2)
})

test('coerces "25.000" style strings to integers', () => {
  const r = parseScannedReceipt({ ...receipt2, total: '64.000', items: [{ qty: '1', name: 'Mantan', lineTotal: 'Rp 25.000' }] })
  expect(r.total).toBe(64000)
  expect(r.items[0]).toEqual({ qty: 1, name: 'Mantan', lineTotal: 25000 })
})

test('defaults missing promo, deliveryFee and otherFees', () => {
  const { promo, deliveryFee, otherFees, ...rest } = receipt2
  void promo, void deliveryFee, void otherFees
  const r = parseScannedReceipt(rest)
  expect(r.promo).toBe(0)
  expect(r.deliveryFee).toBe(0)
  expect(r.otherFees).toEqual([])
})

test('rejects missing items, empty items, bad total and qty < 1', () => {
  expect(() => parseScannedReceipt({ ...receipt2, items: undefined })).toThrow(ScanParseError)
  expect(() => parseScannedReceipt({ ...receipt2, items: [] })).toThrow(ScanParseError)
  expect(() => parseScannedReceipt({ ...receipt2, total: 'abc' })).toThrow(ScanParseError)
  expect(() => parseScannedReceipt({ ...receipt2, items: [{ qty: 0, name: 'x', lineTotal: 1000 }] })).toThrow(ScanParseError)
  expect(() => parseScannedReceipt(null)).toThrow(ScanParseError)
})

test('unknown order type falls back to pickup', () => {
  expect(parseScannedReceipt({ ...receipt2, orderType: 'dine-in' }).orderType).toBe('pickup')
})
