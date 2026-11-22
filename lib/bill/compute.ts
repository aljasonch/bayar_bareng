import type { Bill, BillTotals, PersonShare } from '@/lib/types'

const cap = (value: number, max: number) => (max > 0 ? Math.min(value, max) : value)
const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0)

/** Round each value to an integer so the rounded values still sum to `target` (largest remainder). */
function roundToTarget(values: number[], target: number): number[] {
  const floors = values.map(Math.floor)
  let left = target - floors.reduce((s, v) => s + v, 0)
  const order = values.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0])
  for (const [, i] of order) {
    if (left <= 0) break
    floors[i] += 1
    left -= 1
  }
  return floors
}

/**
 * Promo order (spec §5.3): app promo on item total → totalPayment (+ delivery + other fees)
 * → payment promo on totalPayment. Cashback is on item total and comes off each person's bill.
 */
export function computeBill(bill: Bill): BillTotals {
  const { people, items, fees, appPromo, paymentPromo } = bill

  // Only count assignees still on the bill, so a removed person never leaves an item half-paid.
  const ids = new Set(people.map((p) => p.id))
  const shares = items.map((item) => item.assignees.filter((a) => ids.has(a)))
  const itemTotals = people.map((p) =>
    items.reduce((sum, item, i) => (shares[i].includes(p.id) ? sum + item.price / shares[i].length : sum), 0),
  )
  const totalItem = items.reduce((sum, item) => sum + item.price, 0)

  let appDiscount = 0
  let appShortBy = 0
  let cashback = 0
  if (appPromo.kind === 'discountPct') {
    if (totalItem >= appPromo.minSpend) appDiscount = cap((totalItem * appPromo.pct) / 100, appPromo.max)
    else appShortBy = appPromo.minSpend - totalItem
  } else if (appPromo.kind === 'discountFixed') {
    appDiscount = Math.min(appPromo.amount, totalItem)
  } else if (appPromo.kind === 'cashbackPct') {
    cashback = cap((totalItem * appPromo.pct) / 100, appPromo.max)
  }

  const feeTotal = fees.delivery + fees.others.reduce((sum, f) => sum + f.amount, 0)
  const totalPayment = totalItem - appDiscount + feeTotal

  let paymentDiscount = 0
  let paymentShortBy = 0
  if (paymentPromo.kind === 'discountPct') {
    if (totalPayment >= paymentPromo.minSpend) paymentDiscount = cap((totalPayment * paymentPromo.pct) / 100, paymentPromo.max)
    else paymentShortBy = paymentPromo.minSpend - totalPayment
  }
  const paid = totalPayment - paymentDiscount

  const feeEach = people.length > 0 ? feeTotal / people.length : 0
  const raw = itemTotals.map((itemTotal) => {
    const myApp = appDiscount * ratio(itemTotal, totalItem)
    const myPayment = itemTotal - myApp + feeEach
    const myPaymentDiscount = paymentDiscount * ratio(myPayment, totalPayment)
    const myCashback = cashback * ratio(itemTotal, totalItem)
    return { itemTotal, myApp, myPaymentDiscount, myCashback, final: myPayment - myPaymentDiscount - myCashback }
  })
  const finals = roundToTarget(raw.map((r) => r.final), Math.round(paid - cashback))

  const perPerson: PersonShare[] = people.map((p, i) => ({
    personId: p.id,
    itemTotal: Math.round(raw[i].itemTotal),
    appDiscount: Math.round(raw[i].myApp),
    fees: Math.round(feeEach),
    paymentDiscount: Math.round(raw[i].myPaymentDiscount),
    cashback: Math.round(raw[i].myCashback),
    final: finals[i],
  }))

  return {
    totalItem,
    appDiscount: Math.round(appDiscount),
    appShortBy,
    totalPayment: Math.round(totalPayment),
    paymentDiscount: Math.round(paymentDiscount),
    paymentShortBy: Math.round(paymentShortBy),
    paid: Math.round(paid),
    cashback: Math.round(cashback),
    perPerson,
  }
}
