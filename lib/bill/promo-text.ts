import { formatRp } from '@/lib/money'
import type { AppPromo, PaymentPromo, PromoCombo } from '@/lib/types'

/** 25000 → "25rb"; amounts that aren't whole thousands keep the full Rp form. */
export const shortRp = (n: number) => (n % 1000 === 0 ? `${n / 1000}rb` : formatRp(n))

function pctText(label: string, pct: number, max: number, min = 0) {
  let s = `${label} ${pct}%`
  if (max > 0) s += ` maks ${shortRp(max)}`
  if (min > 0) s += `, min ${shortRp(min)}`
  return s
}

export function describeAppPromo(p: AppPromo): string {
  if (p.kind === 'discountPct') return pctText('Diskon', p.pct, p.max, p.minSpend)
  if (p.kind === 'cashbackPct') return pctText('Cashback', p.pct, p.max)
  if (p.kind === 'discountFixed') return `Potongan ${shortRp(p.amount)}`
  return ''
}

export function describePaymentPromo(p: PaymentPromo): string {
  return p.kind === 'discountPct' ? pctText('Bayar', p.pct, p.max, p.minSpend) : ''
}

export function describeCombo(c: Pick<PromoCombo, 'appPromo' | 'paymentPromo'>): string {
  return [describeAppPromo(c.appPromo), describePaymentPromo(c.paymentPromo)].filter(Boolean).join(' + ') || 'Tanpa promo'
}
