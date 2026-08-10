import { supabase } from '@/lib/supabase'
import {
  IceLevelOption,
  ItemModifier,
  KopiKenanganOutlet,
  KopiKenanganSize,
  SweetnessOption,
} from '@/types'

export type KopiKenanganCategory = string

export type KopiKenanganCatalogItem = {
  id: string
  name: string
  category: KopiKenanganCategory
  prices: Partial<Record<KopiKenanganSize, number>>
  hasOneLiter?: boolean
  isBaristaChoice?: boolean
  isNew?: boolean
  isLimitedTime?: boolean
}

export const KOPI_KENANGAN_SIZES: KopiKenanganSize[] = ['R', 'L', 'J']

export const SWEETNESS_OPTIONS: SweetnessOption[] = ['Normal', 'Less Sugar', 'No Sugar']

export const ICE_LEVEL_OPTIONS: IceLevelOption[] = ['Normal', 'Less Ice', 'No Ice']

export function getAvailableSizes(item: KopiKenanganCatalogItem): KopiKenanganSize[] {
  return KOPI_KENANGAN_SIZES.filter((size) => item.prices[size] !== undefined)
}

export function getOutletAdjustment(outlet: KopiKenanganOutlet, mallAdjustment: number = 2000): number {
  return outlet === 'mall' ? mallAdjustment : 0
}

export function formatOutletName(outlet?: KopiKenanganOutlet): string {
  if (outlet === 'mall') return 'Mall Store'
  return 'Normal Store'
}

export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ? data.map((c) => c.name) : []
}

export async function fetchMenu(): Promise<KopiKenanganCatalogItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, categories(name)')
    .order('sort_order', { ascending: true })

  if (error) throw error
  if (!data) return []

  return data.map((item: any) => {
    const categoryName = Array.isArray(item.categories)
      ? item.categories[0]?.name || ''
      : item.categories?.name || ''

    const prices: Partial<Record<KopiKenanganSize, number>> = {}
    if (item.price_r !== null && item.price_r !== undefined) prices.R = item.price_r
    if (item.price_l !== null && item.price_l !== undefined) prices.L = item.price_l
    if (item.price_j !== null && item.price_j !== undefined) prices.J = item.price_j

    const catalogItem: KopiKenanganCatalogItem = {
      id: item.id,
      name: item.name,
      category: categoryName,
      prices,
    }

    if (item.has_one_liter) catalogItem.hasOneLiter = true
    if (item.is_barista_choice) catalogItem.isBaristaChoice = true
    if (item.is_new) catalogItem.isNew = true
    if (item.is_limited_time) catalogItem.isLimitedTime = true

    return catalogItem
  })
}

export async function fetchModifierGroups(): Promise<{ title: string; items: ItemModifier[] }[]> {
  const { data, error } = await supabase
    .from('modifier_groups')
    .select('*, modifiers(*)')
    .order('sort_order', { ascending: true })

  if (error) throw error
  if (!data) return []

  return data.map((group: any) => {
    const modifiers = group.modifiers ? [...group.modifiers] : []
    modifiers.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

    return {
      title: group.name,
      items: modifiers.map((mod: any) => ({
        id: mod.id,
        name: mod.name,
        type: mod.type as ItemModifier['type'],
        price: mod.price,
      })),
    }
  })
}

export async function fetchOutletConfig(): Promise<{ mallAdjustment: number; availableSizes: KopiKenanganSize[] }> {
  const { data, error } = await supabase
    .from('outlet_config')
    .select('key, value')

  if (error) throw error

  let mallAdjustment = 2000
  let availableSizes: KopiKenanganSize[] = ['R', 'L', 'J']

  if (data) {
    for (const row of data) {
      if (row.key === 'mall_adjustment') {
        mallAdjustment = Number(row.value) || 0
      } else if (row.key === 'available_sizes') {
        availableSizes = Array.isArray(row.value) ? (row.value as KopiKenanganSize[]) : ['R', 'L', 'J']
      }
    }
  }

  return { mallAdjustment, availableSizes }
}
