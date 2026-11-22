export type BillMode = 'umum' | 'kopken'
export type Outlet = 'normal' | 'mall'
export type Size = 'R' | 'L' | 'J'
export type Sweetness = 'Normal' | 'Less Sugar' | 'No Sugar'
export type IceLevel = 'Normal' | 'Less Ice' | 'No Ice'
export type ModifierType = 'upgrade' | 'syrup' | 'addon'

export type Person = { id: string; name: string; profileId?: string }
export type Profile = { id: string; name: string }

export type CatalogRef = {
  menuItemId: string; size: Size; modifierIds: string[]
  sweetness?: Sweetness; ice?: IceLevel
}
export type BillItem = {
  id: string; name: string; price: number      // price of ONE unit, integer Rp
  detail?: string                               // e.g. "Large · Less Ice · +Extra Shot"
  catalog?: CatalogRef
  assignees: string[]                           // person ids; shared equally
  needsCheck?: boolean                          // scan couldn't match catalog confidently
}
export type Fee = { id: string; name: string; amount: number }
export type Fees = { delivery: number; others: Fee[] }

export type AppPromo =
  | { kind: 'none' }
  | { kind: 'discountPct'; pct: number; max: number; minSpend: number }   // max 0 = no cap
  | { kind: 'discountFixed'; amount: number }
  | { kind: 'cashbackPct'; pct: number; max: number }
export type PaymentPromo =
  | { kind: 'none' }
  | { kind: 'discountPct'; pct: number; max: number; minSpend: number }

export type Bill = {
  id: string; createdAt: string; mode: BillMode; outlet: Outlet
  date: string                                  // yyyy-mm-dd
  payerName?: string; payerAccount?: string
  people: Person[]; items: BillItem[]; fees: Fees
  appPromo: AppPromo; paymentPromo: PaymentPromo; comboId?: string
}

export type PersonShare = {
  personId: string; itemTotal: number; appDiscount: number; fees: number
  paymentDiscount: number; cashback: number; final: number
}
export type BillTotals = {
  totalItem: number
  appDiscount: number; appShortBy: number       // shortBy > 0 ⇒ promo not applied
  totalPayment: number
  paymentDiscount: number; paymentShortBy: number
  paid: number                                  // totalPayment − paymentDiscount
  cashback: number
  perPerson: PersonShare[]                      // same order as bill.people
}

export type MenuItem = {
  id: string; name: string; categoryId: string
  prices: Partial<Record<Size, number>>
  hasOneLiter?: boolean; isBaristaChoice?: boolean; isNew?: boolean; isLimitedTime?: boolean
  sortOrder: number
}
export type Modifier = { id: string; name: string; type: ModifierType; price: number; sortOrder: number }
export type ModifierGroup = { id: string; name: string; sortOrder: number; modifiers: Modifier[] }
export type Category = { id: string; name: string; sortOrder: number }
export type OutletConfig = { mallAdjustment: number; availableSizes: Size[] }
export type Catalog = { categories: Category[]; menu: MenuItem[]; modifierGroups: ModifierGroup[]; outlet: OutletConfig }

export type PromoCombo = {
  id: string; name: string; orderType: 'pickup' | 'delivery' | 'outlet'
  appPromo: AppPromo; paymentPromo: PaymentPromo; sortOrder: number
}

export type ScannedReceipt = {
  outlet: string; orderType: 'pickup' | 'delivery'; date?: string
  items: { qty: number; name: string; note?: string; lineTotal: number }[]
  subtotal: number; promo: number; deliveryFee: number
  otherFees: { name: string; amount: number }[]
  total: number; cashbackPct?: number; cashbackMax?: number
}
