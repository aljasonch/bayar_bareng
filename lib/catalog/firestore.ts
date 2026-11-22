import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { Catalog, Category, MenuItem, ModifierGroup, OutletConfig, PromoCombo } from '@/lib/types'

export const COLLECTIONS = {
  categories: 'categories',
  menuItems: 'menuItems',
  modifierGroups: 'modifierGroups',
  config: 'config',
  promoCombos: 'promoCombos',
  admins: 'admins',
} as const

export const DEFAULT_OUTLET: OutletConfig = { mallAdjustment: 2000, availableSizes: ['R', 'L', 'J'] }

async function list<T>(name: string): Promise<T[]> {
  const snap = await getDocs(query(collection(db, name), orderBy('sortOrder')))
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T)
}

export async function fetchCatalog(): Promise<Catalog> {
  const [categories, menu, groups, outletSnap] = await Promise.all([
    list<Category>(COLLECTIONS.categories),
    list<MenuItem>(COLLECTIONS.menuItems),
    list<ModifierGroup>(COLLECTIONS.modifierGroups),
    getDoc(doc(db, COLLECTIONS.config, 'outlet')),
  ])
  const modifierGroups = groups.map((g) => ({
    ...g,
    modifiers: [...(g.modifiers ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
  }))
  const outlet = outletSnap.exists() ? { ...DEFAULT_OUTLET, ...(outletSnap.data() as Partial<OutletConfig>) } : DEFAULT_OUTLET
  return { categories, menu, modifierGroups, outlet }
}

export function fetchPromoCombos(): Promise<PromoCombo[]> {
  return list<PromoCombo>(COLLECTIONS.promoCombos)
}
