import type { ScannedReceipt } from '@/lib/types'

/**
 * On Kopi Kenangan receipts the "Take Away" line is part of Subtotal, so:
 *   Σ items + Σ otherFees = subtotal,   subtotal − promo + delivery = total.
 */
export function checkReceipt(r: ScannedReceipt): { itemsDiff: number; totalDiff: number; ok: boolean } {
  const itemsDiff = r.items.reduce((s, i) => s + i.lineTotal, 0) + r.otherFees.reduce((s, f) => s + f.amount, 0) - r.subtotal
  const totalDiff = r.subtotal - r.promo + r.deliveryFee - r.total
  return { itemsDiff, totalDiff, ok: itemsDiff === 0 && totalDiff === 0 }
}
