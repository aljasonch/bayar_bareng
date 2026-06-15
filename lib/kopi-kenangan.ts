import {
  IceLevelOption,
  ItemModifier,
  KopiKenanganOutlet,
  KopiKenanganSize,
  SweetnessOption,
} from '@/types'

export type KopiKenanganCategory =
  | 'Coffee'
  | 'Toffee Nut Series'
  | 'Blueberry Series'
  | 'OATSIDE Series'
  | 'Kenangan Frappe'
  | 'Chocolate & Sweets'
  | 'Tea Blend'
  | 'Milk Tea'

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

export const KOPI_KENANGAN_MALL_ADJUSTMENT = 2000

export const KOPI_KENANGAN_SIZES: KopiKenanganSize[] = ['R', 'L', 'J']

export const SWEETNESS_OPTIONS: SweetnessOption[] = ['Normal', 'Less Sugar', 'No Sugar']

export const ICE_LEVEL_OPTIONS: IceLevelOption[] = ['Normal', 'Less Ice', 'No Ice']

export const KOPI_KENANGAN_CATEGORIES: KopiKenanganCategory[] = [
  'Coffee',
  'Toffee Nut Series',
  'Blueberry Series',
  'OATSIDE Series',
  'Kenangan Frappe',
  'Chocolate & Sweets',
  'Tea Blend',
  'Milk Tea',
]

function price(value: number): number {
  return value * 1000
}

export const KOPI_KENANGAN_MENU: KopiKenanganCatalogItem[] = [
  {
    id: 'kopi-kenangan-mantan',
    name: 'Kopi Kenangan Mantan',
    category: 'Coffee',
    prices: { R: price(19), L: price(25), J: price(35) },
    hasOneLiter: true,
    isBaristaChoice: true,
  },
  {
    id: 'americano',
    name: 'Americano',
    category: 'Coffee',
    prices: { R: price(17), L: price(22), J: price(29) },
    hasOneLiter: true,
  },
  {
    id: 'avocado-coffee',
    name: 'Avocado Coffee',
    category: 'Coffee',
    prices: { R: price(28), L: price(38), J: price(47) },
  },
  {
    id: 'butterscotch-aren-latte',
    name: 'Butterscotch Aren Latte',
    category: 'Coffee',
    prices: { R: price(20), L: price(27), J: price(36) },
  },
  {
    id: 'butterscotch-sea-salt-latte',
    name: 'Butterscotch Sea Salt Latte',
    category: 'Coffee',
    prices: { R: price(25), L: price(33), J: price(42) },
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'Coffee',
    prices: { R: price(22), L: price(29), J: price(38) },
  },
  {
    id: 'caramel-macchiato',
    name: 'Caramel Macchiato',
    category: 'Coffee',
    prices: { R: price(28), L: price(38), J: price(47) },
    hasOneLiter: true,
    isBaristaChoice: true,
  },
  {
    id: 'creamy-aren-latte',
    name: 'Creamy Aren Latte',
    category: 'Coffee',
    prices: { R: price(22), L: price(31), J: price(40) },
  },
  {
    id: 'dua-shot-iced-shaken',
    name: 'Dua Shot Iced Shaken',
    category: 'Coffee',
    prices: { R: price(28), L: price(38), J: price(47) },
  },
  {
    id: 'kopi-susu-black-aren',
    name: 'Kopi Susu Black Aren',
    category: 'Coffee',
    prices: { R: price(21), L: price(30), J: price(39) },
    hasOneLiter: true,
  },
  {
    id: 'latte',
    name: 'Latte',
    category: 'Coffee',
    prices: { R: price(22), L: price(29), J: price(38) },
    hasOneLiter: true,
    isBaristaChoice: true,
  },
  {
    id: 'matcha-espresso',
    name: 'Matcha Espresso',
    category: 'Coffee',
    prices: { R: price(26), L: price(35), J: price(45) },
    hasOneLiter: true,
  },
  {
    id: 'mocha-latte',
    name: 'Mocha Latte',
    category: 'Coffee',
    prices: { R: price(28), L: price(38), J: price(47) },
    isBaristaChoice: true,
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    category: 'Coffee',
    prices: { R: price(19), L: price(27), J: price(36) },
    isBaristaChoice: true,
  },
  {
    id: 'vanilla-hazelnut-caramel-latte',
    name: 'Vanilla/Hazelnut/Caramel Latte',
    category: 'Coffee',
    prices: { R: price(26), L: price(34), J: price(43) },
  },
  {
    id: 'toffee-nut-latte',
    name: 'Toffee Nut Latte',
    category: 'Toffee Nut Series',
    prices: { R: price(19), L: price(26), J: price(36) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'toffee-nut-aren-latte',
    name: 'Toffee Nut Aren Latte',
    category: 'Toffee Nut Series',
    prices: { R: price(21), L: price(28), J: price(38) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'toffee-nut-oat-latte',
    name: 'Toffee Nut Oat Latte',
    category: 'Toffee Nut Series',
    prices: { R: price(22), L: price(29), J: price(39) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'blueberry-americano',
    name: 'Blueberry Americano',
    category: 'Blueberry Series',
    prices: { R: price(19), L: price(26), J: price(36) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'blueberry-frappe',
    name: 'Blueberry Frappe',
    category: 'Blueberry Series',
    prices: { R: price(23), L: price(30), J: price(40) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'Chocoberry-frappe',
    name: 'Chocoberry Frappe',
    category: 'Blueberry Series',
    prices: { R: price(27), L: price(34), J: price(44) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'Coffeberry-frappe',
    name: 'Coffeberry Frappe',
    category: 'Blueberry Series',
    prices: { R: price(25), L: price(32), J: price(42) },
    isNew: true,
    isLimitedTime: true,
  },
  {
    id: 'oatside-kopi-kenangan-mantan',
    name: 'Oatside Kopi Kenangan Mantan',
    category: 'OATSIDE Series',
    prices: { R: price(22), L: price(28), J: price(38) },
    hasOneLiter: true,
  },
  {
    id: 'oatside-latte',
    name: 'Oatside Latte',
    category: 'OATSIDE Series',
    prices: { R: price(25), L: price(32), J: price(41) },
    hasOneLiter: true,
  },
  {
    id: 'oatside-matcha-latte',
    name: 'Oatside Matcha Latte',
    category: 'OATSIDE Series',
    prices: { R: price(25), L: price(32), J: price(42) },
    hasOneLiter: true,
  },
  {
    id: 'kopi-kenangan-mantan-frappe',
    name: 'Kopi Kenangan Mantan Frappe',
    category: 'Kenangan Frappe',
    prices: { R: price(27), L: price(34) },
  },
  {
    id: 'dutch-choco-kenangan-frappe',
    name: 'Dutch Choco Kenangan Frappe',
    category: 'Kenangan Frappe',
    prices: { R: price(29), L: price(36) },
  },
  {
    id: 'vanilla-kenangan-frappe',
    name: 'Vanilla Kenangan Frappe',
    category: 'Kenangan Frappe',
    prices: { R: price(25), L: price(32) },
  },
  {
    id: 'avocado-milk',
    name: 'Avocado Milk',
    category: 'Chocolate & Sweets',
    prices: { R: price(24), L: price(34), J: price(43) },
  },
  {
    id: 'avocado-caramel',
    name: 'Avocado Caramel',
    category: 'Chocolate & Sweets',
    prices: { R: price(28), L: price(38), J: price(47) },
  },
  {
    id: 'caramel-dutch-choco',
    name: 'Caramel Dutch Choco',
    category: 'Chocolate & Sweets',
    prices: { R: price(28), L: price(38), J: price(47) },
  },
  {
    id: 'dutch-chocolate',
    name: 'Dutch Chocolate',
    category: 'Chocolate & Sweets',
    prices: { R: price(26), L: price(36), J: price(45) },
  },
  {
    id: 'hazelnut-dutch-choco',
    name: 'Hazelnut Dutch Choco',
    category: 'Chocolate & Sweets',
    prices: { R: price(28), L: price(38), J: price(47) },
  },
  {
    id: 'matcha-latte-sweets',
    name: 'Matcha Latte',
    category: 'Chocolate & Sweets',
    prices: { R: price(25), L: price(32), J: price(42) },
    hasOneLiter: true,
  },
  {
    id: 'milo-dinosaurus',
    name: 'Milo Dinosaurus',
    category: 'Chocolate & Sweets',
    prices: { R: price(23), L: price(30), J: price(38) },
  },
  {
    id: 'oreo-shake',
    name: 'Oreo Shake',
    category: 'Chocolate & Sweets',
    prices: { R: price(26), L: price(34), J: price(44) },
    isBaristaChoice: true,
  },
  {
    id: 'earl-grey-tea',
    name: 'Earl Grey Tea',
    category: 'Tea Blend',
    prices: { R: price(15), L: price(19), J: price(26) },
  },
  {
    id: 'lemon-black-tea',
    name: 'Lemon Black Tea',
    category: 'Tea Blend',
    prices: { R: price(17), L: price(24), J: price(31) },
  },
  {
    id: 'raspberry-hibiscus',
    name: 'Raspberry Hibiscus',
    category: 'Tea Blend',
    prices: { R: price(20), L: price(27), J: price(34) },
  },
  {
    id: 'earl-grey-milk-tea',
    name: 'Earl Grey Milk Tea',
    category: 'Milk Tea',
    prices: { R: price(19), L: price(25), J: price(32) },
  },
  {
    id: 'hazelnut-choco-milk-tea',
    name: 'Hazelnut Choco Milk Tea',
    category: 'Milk Tea',
    prices: { R: price(22), L: price(29), J: price(36) },
  },
  {
    id: 'kenangan-milk-tea',
    name: 'Kenangan Milk Tea',
    category: 'Milk Tea',
    prices: { R: price(21), L: price(27), J: price(34) },
  },
  {
    id: 'thai-tea',
    name: 'Thai Tea',
    category: 'Milk Tea',
    prices: { R: price(22), L: price(29) },
    hasOneLiter: true,
  },
]

export const KOPI_KENANGAN_UPGRADES: ItemModifier[] = [
  { id: 'juwara-beans-upgrade', name: 'Juwara Beans', type: 'upgrade', price: price(3) },
  { id: 'oatside-upgrade', name: 'OATSIDE', type: 'upgrade', price: price(3) },
]

export const KOPI_KENANGAN_SYRUPS: ItemModifier[] = [
  { id: 'butterscotch-syrup', name: 'Butterscotch', type: 'syrup', price: price(6) },
  { id: 'caramel-syrup', name: 'Caramel', type: 'syrup', price: price(6) },
  { id: 'chocolate-sauce-syrup', name: 'Chocolate Sauce', type: 'syrup', price: price(6) },
  { id: 'hazelnut-syrup', name: 'Hazelnut', type: 'syrup', price: price(6) },
  { id: 'salted-caramel-sauce-syrup', name: 'Salted Caramel Sauce', type: 'syrup', price: price(6) },
  { id: 'vanilla-syrup', name: 'Vanilla', type: 'syrup', price: price(6) },
]

export const KOPI_KENANGAN_ADDONS: ItemModifier[] = [
  { id: 'golden-boba', name: 'Golden Boba', type: 'addon', price: price(6) },
  { id: 'grass-jelly', name: 'Grass Jelly', type: 'addon', price: price(6) },
  { id: 'oreo-addon', name: 'Oreo', type: 'addon', price: price(6) },
  { id: 'coffee-jelly', name: 'Coffee Jelly', type: 'addon', price: price(6) },
  { id: 'kenangan-blend-shot', name: 'Kenangan Blend Shot', type: 'addon', price: price(6) },
  { id: 'juwara-beans-shot', name: 'Juwara Beans Shot', type: 'addon', price: price(6) },
  { id: 'whipped-cream-vanillachoco', name: 'Whipped Cream VanillaChoco', type: 'addon', price: price(6) },
]

export const KOPI_KENANGAN_MODIFIER_GROUPS = [
  { title: 'Upgrade', items: KOPI_KENANGAN_UPGRADES },
  { title: 'Syrup', items: KOPI_KENANGAN_SYRUPS },
  { title: 'Add-ons', items: KOPI_KENANGAN_ADDONS },
]

export function getAvailableSizes(item: KopiKenanganCatalogItem): KopiKenanganSize[] {
  return KOPI_KENANGAN_SIZES.filter((size) => item.prices[size] !== undefined)
}

export function getOutletAdjustment(outlet: KopiKenanganOutlet): number {
  return outlet === 'mall' ? KOPI_KENANGAN_MALL_ADJUSTMENT : 0
}

export function formatOutletName(outlet?: KopiKenanganOutlet): string {
  if (outlet === 'mall') return 'Mall Store'
  return 'Normal Store'
}
