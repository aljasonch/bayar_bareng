'use client'

import { FeeConfig } from '@/types'

interface FeeSettingsProps {
  feeConfig: FeeConfig
  onUpdate: (config: FeeConfig) => void
}

export default function FeeSettings({ feeConfig, onUpdate }: FeeSettingsProps) {
  const update = (field: keyof FeeConfig, value: number) => {
    onUpdate({ ...feeConfig, [field]: value })
  }

  return (
    <div className="grid grid-cols-1 gap-4 animate-fade-in xl:grid-cols-3">
      <div className="card p-4 sm:p-5">
        <p className="label">Discount</p>
        <h3 className="mb-4 mt-1 text-base font-semibold text-ink">Item discount</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label mb-1.5 block">Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={feeConfig.discountPct || ''}
                onChange={(e) => update('discountPct', Number(e.target.value))}
                placeholder="0"
                className="field field-mono pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-faint text-sm font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Max cap</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-xs font-mono">Rp</span>
              <input
                type="number"
                value={feeConfig.discountMax || ''}
                onChange={(e) => update('discountMax', Number(e.target.value))}
                placeholder="No limit"
                className="field field-mono pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <p className="label">Shared fee</p>
        <h3 className="mb-4 mt-1 text-base font-semibold text-ink">Delivery fee</h3>
        <label className="label mb-1.5 block">Amount (split equally)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-xs font-mono">Rp</span>
          <input
            type="number"
            value={feeConfig.deliveryFee || ''}
            onChange={(e) => update('deliveryFee', Number(e.target.value))}
            placeholder="0"
            className="field field-mono pl-9"
          />
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <p className="label">Savings</p>
        <h3 className="mb-4 mt-1 text-base font-semibold text-ink">Cashback</h3>

        <div className="mb-4">
          <label className="label mb-2 block">Calculated from</label>
          <div className="inline-flex w-full rounded-xl border border-line bg-surface2 p-1">
            <button
              onClick={() => onUpdate({ ...feeConfig, cashbackBase: 'totalItem' })}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                feeConfig.cashbackBase === 'totalItem'
                  ? 'bg-white text-ink shadow-card'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Total item
            </button>
            <button
              onClick={() => onUpdate({ ...feeConfig, cashbackBase: 'totalPayment' })}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                feeConfig.cashbackBase === 'totalPayment'
                  ? 'bg-white text-ink shadow-card'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Total payment
            </button>
          </div>
          <p className="text-[11px] text-faint mt-1.5">
            {feeConfig.cashbackBase === 'totalItem'
              ? 'Calculated from total item price (before discounts & fees)'
              : 'Calculated from total payment (after discount + delivery + fees)'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label mb-1.5 block">Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={feeConfig.cashbackPct || ''}
                onChange={(e) => update('cashbackPct', Number(e.target.value))}
                placeholder="0"
                className="field field-mono pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-faint text-sm font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Max cap</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-xs font-mono">Rp</span>
              <input
                type="number"
                value={feeConfig.cashbackMax || ''}
                onChange={(e) => update('cashbackMax', Number(e.target.value))}
                placeholder="No limit"
                className="field field-mono pl-9"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
