import { expect, test } from 'vitest'
import { matchCatalogItem } from '@/lib/scan/match'
import { catalog } from './catalog-fixture'

const m = (name: string, price: number, outlet: 'normal' | 'mall' = 'normal') => {
  const r = matchCatalogItem(name, price, catalog, outlet)
  return r && `${r.menuItem.id}/${r.size}`
}

test('receipt name extends the catalog name ("Ice..." suffix) and price picks the size', () => {
  expect(m('Kopi Kenangan Mantan Ice...', 25000)).toBe('mantan/L')
  expect(m('Kopi Kenangan Mantan Ice...', 19000)).toBe('mantan/R')
  expect(m('Cappuccino Ice…', 29000)).toBe('cappu/L')
})

test('no exact size price means no match (modifier combos are not guessed)', () => {
  expect(m('Kopi Kenangan Mantan Ice...', 28000)).toBeNull()
  expect(m('Cappuccino Ice Large Juw...', 32000)).toBeNull()
})

test('mall outlet subtracts the adjustment before matching', () => {
  expect(m('Kopi Kenangan Mantan Ice...', 21000, 'mall')).toBe('mantan/R')
})

test('a receipt name truncated shorter than the catalog name still matches', () => {
  expect(m('Kopi Kenangan Man...', 19000)).toBe('mantan/R')
})

test('case-insensitive', () => {
  expect(m('KOPI KENANGAN MANTAN ICE...', 35000)).toBe('mantan/J')
})

test('unknown names do not match', () => {
  expect(m('Roti Bakar...', 19000)).toBeNull()
})
