export type BillMode = 'general' | 'kopiKenangan'

export type KopiKenanganOutlet = 'normal' | 'mall'

export type KopiKenanganSize = 'R' | 'L' | 'J'

export type KopiKenanganModifierType = 'upgrade' | 'syrup' | 'addon'

export type SweetnessOption = 'Normal' | 'Less Sugar' | 'No Sugar'

export type IceLevelOption = 'Normal' | 'Less Ice' | 'No Ice'

export type ItemModifier = {
  id: string
  name: string
  type: KopiKenanganModifierType
  price: number
}

export type Item = {
  id: string
  name: string
  price: number
  quantity?: number
  unitPrice?: number
  basePrice?: number
  outletAdjustment?: number
  selectedSize?: KopiKenanganSize
  catalogItemId?: string
  catalogCategory?: string
  modifiers?: ItemModifier[]
  sweetness?: SweetnessOption
  iceLevel?: IceLevelOption
  hasOneLiter?: boolean
  isBaristaChoice?: boolean
  isCustom?: boolean
}

export type Person = { id: string; name: string; items: Item[] }

export type AdditionalFee = { id: string; name: string; amount: number }

export type CashbackBase = 'totalItem' | 'totalPayment'

export type FeeConfig = {
  discountPct: number
  discountMax: number
  deliveryFee: number
  additionalFees: AdditionalFee[]
  cashbackPct: number
  cashbackMax: number
  cashbackBase: CashbackBase
}

export type PersonResult = {
  person: Person
  subtotal: number
  discountSaved: number
  deliveryShare: number
  additionalFeesShare: number
  cashbackSaved: number
  final: number
}

export type BillResult = {
  id: string
  createdAt: string
  billMode?: BillMode
  kopiKenanganOutlet?: KopiKenanganOutlet
  splitDate?: string
  payerName?: string
  payerAccountNumber?: string
  people: Person[]
  feeConfig: FeeConfig
  results: PersonResult[]
  totalFinal: number
  totalSaved: number
}
