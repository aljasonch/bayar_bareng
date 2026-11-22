'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { AppPromoFields, PaymentPromoFields } from '@/components/flow/PromoFields'
import { describeCombo } from '@/lib/bill/promo-text'
import { formatRp } from '@/lib/money'
import type { FlowCtx } from '@/components/flow/SplitFlow'
import type { PromoCombo } from '@/lib/types'

type Props = Pick<FlowCtx, 'bill' | 'dispatch' | 'totals'> & { combos?: PromoCombo[] }

function Row({ label, value, sign = '', strong = false }: { label: string; value: number; sign?: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'font-semibold' : 'text-muted'}`}>
      <span>{label}</span>
      <span className={`num ${strong ? 'text-ink' : ''}`}>
        {sign}
        {formatRp(value)}
      </span>
    </div>
  )
}

/** Combo chips (Kopi Kenangan) plus manual editing of both promo layers, with a live breakdown. */
export default function PromoPicker({ bill, dispatch, totals, combos = [] }: Props) {
  const [manual, setManual] = useState(combos.length === 0)
  const feeTotal = bill.fees.delivery + bill.fees.others.reduce((s, f) => s + f.amount, 0)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold">Promo</h2>
        <p className="text-sm text-muted">Promo aplikasi dihitung dari total item, promo pembayaran dari total bayar.</p>
      </div>

      {combos.length > 0 && (
        <div className="grid gap-2">
          {combos.map((c) => {
            const active = bill.comboId === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => dispatch({ type: 'applyCombo', combo: c })}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${active ? 'border-accent bg-accentSoft' : 'border-line hover:border-accent/50'}`}
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? 'border-accent bg-accent text-onAccent' : 'border-line'}`}>
                  {active && <Check size={12} />}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{c.name}</span>
                  <span className="block text-xs text-muted">{describeCombo(c)}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {combos.length > 0 && (
        <button type="button" className="btn-ghost -ml-3 px-3" aria-expanded={manual} onClick={() => setManual(!manual)}>
          Atur manual <ChevronDown size={16} className={`transition-transform ${manual ? 'rotate-180' : ''}`} />
        </button>
      )}

      {manual && (
        <div className="card space-y-5 p-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Promo aplikasi</h3>
            <AppPromoFields value={bill.appPromo} onChange={(promo) => dispatch({ type: 'setAppPromo', promo })} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Promo pembayaran</h3>
            <PaymentPromoFields value={bill.paymentPromo} onChange={(promo) => dispatch({ type: 'setPaymentPromo', promo })} />
          </div>
        </div>
      )}

      {totals.appShortBy > 0 && (
        <p className="rounded-2xl bg-accentSoft px-4 py-3 text-sm">
          Promo aplikasi belum aktif, kurang <span className="num font-medium">{formatRp(totals.appShortBy)}</span> lagi.
        </p>
      )}
      {totals.paymentShortBy > 0 && (
        <p className="rounded-2xl bg-accentSoft px-4 py-3 text-sm">
          Promo pembayaran belum aktif, kurang <span className="num font-medium">{formatRp(totals.paymentShortBy)}</span> lagi.
        </p>
      )}

      <div className="card space-y-1.5 p-4 text-sm">
        <Row label="Total item" value={totals.totalItem} />
        {totals.appDiscount > 0 && <Row label="Promo aplikasi" value={totals.appDiscount} sign="-" />}
        {feeTotal > 0 && <Row label="Ongkir & biaya" value={feeTotal} sign="+" />}
        {totals.paymentDiscount > 0 && <Row label="Promo pembayaran" value={totals.paymentDiscount} sign="-" />}
        <div className="border-t border-dashed border-line pt-1.5">
          <Row label="Dibayar" value={totals.paid} strong />
        </div>
        {totals.cashback > 0 && <Row label="Cashback poin (dibagi)" value={totals.cashback} sign="-" />}
      </div>
    </section>
  )
}
