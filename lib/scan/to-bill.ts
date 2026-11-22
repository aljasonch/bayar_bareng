import { SIZE_LABEL } from '@/lib/catalog/menu-item'
import { matchCatalogItem } from '@/lib/scan/match'
import type { AppPromo, BillItem, Catalog, Fees, Outlet, ScannedReceipt } from '@/lib/types'

/** Split a line total into qty unit prices that still sum to the line total. */
function unitPrices(lineTotal: number, qty: number): number[] {
  const unit = Math.floor(lineTotal / qty)
  return Array.from({ length: qty }, (_, i) => unit + (i === 0 ? lineTotal - unit * qty : 0))
}

export function receiptToBill(r: ScannedReceipt, catalog: Catalog, outlet: Outlet) {
  const items: BillItem[] = r.items.flatMap((line) =>
    unitPrices(line.lineTotal, line.qty).map((price): BillItem => {
      const match = matchCatalogItem(line.name, price, catalog, outlet)
      if (!match) return { id: crypto.randomUUID(), name: line.name, price, ...(line.note && { detail: line.note }), needsCheck: true, assignees: [] }
      return {
        id: crypto.randomUUID(),
        name: match.menuItem.name,
        price,
        detail: [SIZE_LABEL[match.size], line.note].filter(Boolean).join(' · '),
        assignees: [],
      }
    }),
  )

  const fees: Fees = { delivery: r.deliveryFee, others: r.otherFees.map((f) => ({ id: crypto.randomUUID(), ...f })) }

  const appPromo: AppPromo =
    r.promo > 0
      ? { kind: 'discountFixed', amount: r.promo }
      : r.cashbackPct
        ? { kind: 'cashbackPct', pct: r.cashbackPct, max: r.cashbackMax ?? 0 }
        : { kind: 'none' }

  return { items, fees, appPromo, suggestedOrderType: r.orderType }
}
