'use client'

import MoneyInput from '@/components/ui/MoneyInput'
import PillGroup, { type PillOption } from '@/components/ui/PillGroup'
import type { AppPromo, PaymentPromo } from '@/lib/types'

function Pct({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <div className="relative mt-1">
        <input
          className="field num pr-8"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0))}
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
      </div>
    </label>
  )
}

const APP_KINDS: PillOption<AppPromo['kind']>[] = [
  { value: 'none', label: 'Tidak ada' },
  { value: 'discountPct', label: 'Diskon %' },
  { value: 'discountFixed', label: 'Potongan Rp' },
  { value: 'cashbackPct', label: 'Cashback poin' },
]

const PAYMENT_KINDS: PillOption<PaymentPromo['kind']>[] = [
  { value: 'none', label: 'Tidak ada' },
  { value: 'discountPct', label: 'Diskon %' },
]

function defaultsFor(kind: AppPromo['kind']): AppPromo {
  if (kind === 'discountPct') return { kind, pct: 0, max: 0, minSpend: 0 }
  if (kind === 'discountFixed') return { kind, amount: 0 }
  if (kind === 'cashbackPct') return { kind, pct: 0, max: 0 }
  return { kind: 'none' }
}

/** Editor for the app (Kopi Kenangan) promo layer. "max 0" means no cap. */
export function AppPromoFields({ value, onChange }: { value: AppPromo; onChange: (p: AppPromo) => void }) {
  return (
    <div className="space-y-3">
      <PillGroup options={APP_KINDS} value={value.kind} onChange={(k) => onChange(defaultsFor(k))} variant="soft" size="sm" />
      {value.kind === 'discountPct' && (
        <div className="grid grid-cols-3 gap-2">
          <Pct label="Persen" value={value.pct} onChange={(pct) => onChange({ ...value, pct })} />
          <MoneyInput label="Maks" placeholder="0" value={value.max} onChange={(max) => onChange({ ...value, max })} />
          <MoneyInput label="Min belanja" placeholder="0" value={value.minSpend} onChange={(minSpend) => onChange({ ...value, minSpend })} />
        </div>
      )}
      {value.kind === 'discountFixed' && <MoneyInput label="Potongan" placeholder="0" value={value.amount} onChange={(amount) => onChange({ ...value, amount })} />}
      {value.kind === 'cashbackPct' && (
        <div className="grid grid-cols-2 gap-2">
          <Pct label="Persen" value={value.pct} onChange={(pct) => onChange({ ...value, pct })} />
          <MoneyInput label="Maks" placeholder="0" value={value.max} onChange={(max) => onChange({ ...value, max })} />
        </div>
      )}
    </div>
  )
}

/** Editor for the payment (blu) promo layer. */
export function PaymentPromoFields({ value, onChange }: { value: PaymentPromo; onChange: (p: PaymentPromo) => void }) {
  return (
    <div className="space-y-3">
      <PillGroup
        options={PAYMENT_KINDS}
        value={value.kind}
        onChange={(k) => onChange(k === 'none' ? { kind: 'none' } : { kind: 'discountPct', pct: 0, max: 0, minSpend: 0 })}
        variant="soft"
        size="sm"
      />
      {value.kind === 'discountPct' && (
        <div className="grid grid-cols-3 gap-2">
          <Pct label="Persen" value={value.pct} onChange={(pct) => onChange({ ...value, pct })} />
          <MoneyInput label="Maks" placeholder="0" value={value.max} onChange={(max) => onChange({ ...value, max })} />
          <MoneyInput label="Min bayar" placeholder="0" value={value.minSpend} onChange={(minSpend) => onChange({ ...value, minSpend })} />
        </div>
      )}
    </div>
  )
}
