import { Person, FeeConfig, PersonResult, BillResult } from '@/types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export function calculateBill(people: Person[], feeConfig: FeeConfig): BillResult {
  const totalItems = people.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.price, 0),
    0
  )

  if (totalItems === 0) {
    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      people,
      feeConfig,
      results: people.map((person) => ({
        person,
        subtotal: 0,
        discountSaved: 0,
        deliveryShare: 0,
        additionalFeesShare: 0,
        cashbackSaved: 0,
        final: 0,
      })),
      totalFinal: 0,
      totalSaved: 0,
    }
  }

  const discountAmt = Math.min(
    totalItems * (feeConfig.discountPct / 100),
    feeConfig.discountMax > 0 ? feeConfig.discountMax : Infinity
  )
  const afterDiscount = totalItems - discountAmt

  const totalAdditionalFees = feeConfig.additionalFees.reduce(
    (sum, f) => sum + f.amount,
    0
  )
  const totalPayment = afterDiscount + feeConfig.deliveryFee + totalAdditionalFees

  const cashbackBaseAmt = feeConfig.cashbackBase === 'totalItem' ? totalItems : totalPayment
  const cashbackAmt = Math.min(
    cashbackBaseAmt * (feeConfig.cashbackPct / 100),
    feeConfig.cashbackMax > 0 ? feeConfig.cashbackMax : Infinity
  )

  const numberOfPeople = people.length

  const results: PersonResult[] = people.map((person) => {
    const subtotal = person.items.reduce((s, i) => s + i.price, 0)
    const myShare = totalItems > 0 ? subtotal / totalItems : 0
    const discountSaved = discountAmt * myShare
    const myAfterDisc = subtotal - discountSaved
    const feeShare = (feeConfig.deliveryFee + totalAdditionalFees) / numberOfPeople
    const myWithFees = myAfterDisc + feeShare

    let myCashbackShare: number
    if (feeConfig.cashbackBase === 'totalItem') {
      myCashbackShare = totalItems > 0 ? subtotal / totalItems : 0
    } else {
      myCashbackShare = totalPayment > 0 ? myWithFees / totalPayment : 0
    }
    const cashbackSaved = cashbackAmt * myCashbackShare
    const final = Math.round(myWithFees - cashbackSaved)

    return {
      person,
      subtotal,
      discountSaved: Math.round(discountSaved),
      deliveryShare: Math.round(feeConfig.deliveryFee / numberOfPeople),
      additionalFeesShare: Math.round(totalAdditionalFees / numberOfPeople),
      cashbackSaved: Math.round(cashbackSaved),
      final,
    }
  })

  const totalFinal = results.reduce((s, r) => s + r.final, 0)
  const totalSaved = Math.round(discountAmt + cashbackAmt)

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    people,
    feeConfig,
    results,
    totalFinal,
    totalSaved,
  }
}
