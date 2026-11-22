'use client'

import MoneyInput from '@/components/ui/MoneyInput'
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

function Money({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <MoneyInput className="mt-1" value={value} onChange={onChange} placeholder="0" aria-label={label} />
    </label>
  )
}

const APP_KINDS: { kind: AppPromo['kind']; label: string }[] = [
  { kind: 'none', label: 'Tidak ada' },
  { kind: 'discountPct', label: 'Diskon %' },
  { kind: 'discountFixed', label: 'Potongan Rp' },
  { kind: 'cashbackPct', label: 'Cashback poin' },
]

function defaultsFor(kind: AppPromo['kind']): AppPromo {
  if (kind === 'discountPct') return { kind, pct: 0, max: 0, minSpend: 0 }
  if (kind === 'discountFixed') return { kind, amount: 0 }
  if (kind === 'cashbackPct') return { kind, pct: 0, max: 0 }
  return { kind: 'none' }
}

function KindTabs<K extends string>({ options, value, onChange }: { options: { kind: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.kind}
          type="button"
          role="radio"
          aria-checked={value === o.kind}
          onClick={() => onChange(o.kind)}
          className={`rounded-full border px-3 py-1.5 text-xs ${value === o.kind ? 'border-accent bg-accentSoft text-accent' : 'border-line text-muted'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Editor for the app (Kopi Kenangan) promo layer. "max 0" means no cap. */
export function AppPromoFields({ value, onChange }: { value: AppPromo; onChange: (p: AppPromo) => void }) {
  return (
    <div className="space-y-3">
      <KindTabs options={APP_KINDS} value={value.kind} onChange={(k) => onChange(defaultsFor(k))} />
      {value.kind === 'discountPct' && (
        <div className="grid grid-cols-3 gap-2">
          <Pct label="Persen" value={value.pct} onChange={(pct) => onChange({ ...value, pct })} />
          <Money label="Maks" value={value.max} onChange={(max) => onChange({ ...value, max })} />
          <Money label="Min belanja" value={value.minSpend} onChange={(minSpend) => onChange({ ...value, minSpend })} />
        </div>
      )}
      {value.kind === 'discountFixed' && <Money label="Potongan" value={value.amount} onChange={(amount) => onChange({ ...value, amount })} />}
      {value.kind === 'cashbackPct' && (
        <div className="grid grid-cols-2 gap-2">
          <Pct label="Persen" value={value.pct} onChange={(pct) => onChange({ ...value, pct })} />
          <Money label="Maks" value={value.max} onChange={(max) => onChange({ ...value, max })} />
        </div>
      )}
    </div>
  )
}

/** Editor for the payment (blu) promo layer. */
export function PaymentPromoFields({ value, onChange }: { value: PaymentPromo; onChange: (p: PaymentPromo) => void }) {
  return (
    <div className="space-y-3">
      <KindTabs
        options={[
          { kind: 'none', label: 'Tidak ada' },
          { kind: 'discountPct', label: 'Diskon %' },
        ]}
        value={value.kind}
        onChange={(k) => onChange(k === 'none' ? { kind: 'none' } : { kind: 'discountPct', pct: 0, max: 0, minSpend: 0 })}
      />
      {value.kind === 'discountPct' && (
        <div className="grid grid-cols-3 gap-2">
          <Pct label="Persen" value={value.pct} onChange={(pct) => onChange({ ...value, pct })} />
          <Money label="Maks" value={value.max} onChange={(max) => onChange({ ...value, max })} />
          <Money label="Min bayar" value={value.minSpend} onChange={(minSpend) => onChange({ ...value, minSpend })} />
        </div>
      )}
    </div>
  )
}
