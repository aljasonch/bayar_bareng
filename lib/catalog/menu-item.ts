import type { BillItem, Catalog, IceLevel, MenuItem, Modifier, Outlet, Size, Sweetness } from '@/lib/types'

export const SIZE_LABEL: Record<Size, string> = { R: 'Regular', L: 'Large', J: '1 Liter' }

export type MenuSelection = { item: MenuItem; size: Size; modifiers: Modifier[]; sweetness?: Sweetness; ice?: IceLevel }

export function buildMenuBillItem(sel: MenuSelection, outlet: Outlet, mallAdjustment: number): Omit<BillItem, 'id' | 'assignees'> {
  const base = sel.item.prices[sel.size] ?? 0
  const price = base + sel.modifiers.reduce((s, m) => s + m.price, 0) + (outlet === 'mall' ? mallAdjustment : 0)
  const detail = [
    SIZE_LABEL[sel.size],
    sel.ice && sel.ice !== 'Normal' ? sel.ice : '',
    sel.sweetness && sel.sweetness !== 'Normal' ? sel.sweetness : '',
    ...sel.modifiers.map((m) => `+${m.name}`),
  ]
    .filter(Boolean)
    .join(' · ')
  return {
    name: sel.item.name,
    price,
    detail,
    catalog: { menuItemId: sel.item.id, size: sel.size, modifierIds: sel.modifiers.map((m) => m.id) },
  }
}

/** Recompute prices of menu-built items after the outlet (normal/mall) changes. Manual and scanned items stay as they are. */
export function repriceForOutlet(items: BillItem[], catalog: Catalog, outlet: Outlet): BillItem[] {
  const modifiers = catalog.modifierGroups.flatMap((g) => g.modifiers)
  return items.map((it) => {
    const ref = it.catalog
    const menuItem = ref && catalog.menu.find((m) => m.id === ref.menuItemId)
    if (!ref || !menuItem) return it
    const mods = ref.modifierIds.flatMap((id) => modifiers.filter((m) => m.id === id))
    const rebuilt = buildMenuBillItem({ item: menuItem, size: ref.size, modifiers: mods }, outlet, catalog.outlet.mallAdjustment)
    return { ...it, price: rebuilt.price }
  })
}
