import type { Catalog, MenuItem, Outlet, Size } from '@/lib/types'

const clean = (s: string) => s.replace(/(\.\.\.|…)\s*$/, '').trim().toLowerCase()

/**
 * Receipt names are the catalog name plus extras ("Kopi Kenangan Mantan Ice...") or cut short
 * ("Kopi Kenangan Man..."). The unit price (minus the mall adjustment) must equal a size price exactly;
 * prices that only fit size + modifiers return null and are left for the user to check.
 */
export function matchCatalogItem(name: string, unitPrice: number, catalog: Catalog, outlet: Outlet): { menuItem: MenuItem; size: Size } | null {
  const receipt = clean(name)
  if (!receipt) return null
  const base = unitPrice - (outlet === 'mall' ? catalog.outlet.mallAdjustment : 0)
  const candidates = catalog.menu
    .filter((m) => {
      const c = m.name.toLowerCase()
      return (receipt.startsWith(c) && (receipt.length === c.length || receipt[c.length] === ' ')) || c.startsWith(receipt)
    })
    .sort((a, b) => b.name.length - a.name.length)
  for (const menuItem of candidates) {
    const size = catalog.outlet.availableSizes.find((s) => menuItem.prices[s] === base)
    if (size) return { menuItem, size }
  }
  return null
}
