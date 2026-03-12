export type Item = { id: string; name: string; price: number }

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
  people: Person[]
  feeConfig: FeeConfig
  results: PersonResult[]
  totalFinal: number
  totalSaved: number
}
