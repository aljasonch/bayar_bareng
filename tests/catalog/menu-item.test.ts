import { expect, test } from 'vitest'
import { buildMenuBillItem } from '@/lib/catalog/menu-item'
import type { MenuItem, Modifier } from '@/lib/types'

const mantan: MenuItem = { id: 'm1', name: 'Kopi Kenangan Mantan', categoryId: 'c', prices: { R: 19000, L: 25000 }, sortOrder: 0 }
const shot: Modifier = { id: 'x1', name: 'Extra Shot', type: 'addon', price: 3000, sortOrder: 0 }
const oat: Modifier = { id: 'x2', name: 'Oat Milk', type: 'upgrade', price: 5000, sortOrder: 1 }

test('normal outlet price is the size price', () => {
  const item = buildMenuBillItem({ item: mantan, size: 'L', modifiers: [] }, 'normal', 2000)
  expect(item.price).toBe(25000)
  expect(item.name).toBe('Kopi Kenangan Mantan')
  expect(item.detail).toBe('Large')
  expect(item.catalog).toEqual({ menuItemId: 'm1', size: 'L', modifierIds: [] })
})

test('mall outlet adds the adjustment', () => {
  expect(buildMenuBillItem({ item: mantan, size: 'R', modifiers: [] }, 'mall', 2000).price).toBe(21000)
})

test('modifiers add their price and appear in detail; normal sweet/ice are omitted', () => {
  const item = buildMenuBillItem({ item: mantan, size: 'L', modifiers: [shot, oat], sweetness: 'Less Sugar', ice: 'Less Ice' }, 'normal', 2000)
  expect(item.price).toBe(33000)
  expect(item.detail).toBe('Large · Less Ice · Less Sugar · +Extra Shot · +Oat Milk')
  const plain = buildMenuBillItem({ item: mantan, size: 'R', modifiers: [], sweetness: 'Normal', ice: 'Normal' }, 'normal', 2000)
  expect(plain.detail).toBe('Regular')
})

test('repriceForOutlet recomputes catalog items and leaves manual items alone', async () => {
  const { repriceForOutlet } = await import('@/lib/catalog/menu-item')
  const catalog = {
    categories: [], menu: [mantan], outlet: { mallAdjustment: 2000, availableSizes: ['R', 'L', 'J'] as const },
    modifierGroups: [{ id: 'g', name: 'Add on', sortOrder: 0, modifiers: [shot] }],
  }
  const items = [
    { id: 'a', name: 'Mantan', price: 28000, assignees: ['p'], catalog: { menuItemId: 'm1', size: 'L' as const, modifierIds: ['x1'] } },
    { id: 'b', name: 'Roti', price: 10000, assignees: [] },
  ]
  const out = repriceForOutlet(items, { ...catalog, outlet: { ...catalog.outlet, availableSizes: [...catalog.outlet.availableSizes] } }, 'mall')
  expect(out[0].price).toBe(30000)
  expect(out[0].assignees).toEqual(['p'])
  expect(out[0].id).toBe('a')
  expect(out[1]).toBe(items[1])
})

test('repriceForOutlet leaves items that came from a receipt alone', async () => {
  const { repriceForOutlet } = await import('@/lib/catalog/menu-item')
  const catalog = { categories: [], menu: [mantan], modifierGroups: [], outlet: { mallAdjustment: 2000, availableSizes: ['R' as const, 'L' as const] } }
  const scanned = { id: 's', name: 'Mantan', price: 25000, assignees: [], fromReceipt: true, catalog: { menuItemId: 'm1', size: 'L' as const, modifierIds: [] } }
  expect(repriceForOutlet([scanned], catalog, 'mall')[0].price).toBe(25000)
})
