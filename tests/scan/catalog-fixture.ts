import type { Catalog } from '@/lib/types'

export const catalog: Catalog = {
  categories: [{ id: 'c1', name: 'Kopi', sortOrder: 0 }],
  menu: [
    { id: 'mantan', name: 'Kopi Kenangan Mantan', categoryId: 'c1', prices: { R: 19000, L: 25000, J: 35000 }, sortOrder: 0 },
    { id: 'cappu', name: 'Cappuccino', categoryId: 'c1', prices: { R: 22000, L: 29000, J: 38000 }, sortOrder: 1 },
    { id: 'oat', name: 'Oatside Kopi Kenangan Mantan', categoryId: 'c1', prices: { R: 22000, L: 28000, J: 38000 }, sortOrder: 2 },
    { id: 'frappe', name: 'Kopi Kenangan Mantan Frappe', categoryId: 'c1', prices: { R: 27000, L: 34000 }, sortOrder: 3 },
  ],
  modifierGroups: [{ id: 'g', name: 'Add on', sortOrder: 0, modifiers: [{ id: 'shot', name: 'Extra Shot', price: 3000, sortOrder: 0 }] }],
  outlet: { mallAdjustment: 2000, availableSizes: ['R', 'L', 'J'] },
}
