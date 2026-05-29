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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 animate-fade-in">
      {/* Discount Section */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-4">Item Discount</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5 block">Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={feeConfig.discountPct || ''}
                onChange={(e) => update('discountPct', Number(e.target.value))}
                placeholder="0"
                className="w-full bg-zinc-900 rounded-lg px-3 pr-10 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5 block">Max Cap</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
              <input
                type="number"
                value={feeConfig.discountMax || ''}
                onChange={(e) => update('discountMax', Number(e.target.value))}
                placeholder="No limit"
                className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Fee Section */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-4">Delivery Fee</h3>
        <div>
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5 block">Amount (split equally)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
            <input
              type="number"
              value={feeConfig.deliveryFee || ''}
              onChange={(e) => update('deliveryFee', Number(e.target.value))}
              placeholder="0"
              className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Cashback Section */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 xl:col-span-1">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-4">Cashback</h3>

        {/* Cashback Base Toggle */}
        <div className="mb-4">
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2 block">Calculated from</label>
          <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
            <button
              onClick={() => onUpdate({ ...feeConfig, cashbackBase: 'totalItem' })}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 ${feeConfig.cashbackBase === 'totalItem'
                ? 'bg-brand text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              Total Item
            </button>
            <button
              onClick={() => onUpdate({ ...feeConfig, cashbackBase: 'totalPayment' })}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 ${feeConfig.cashbackBase === 'totalPayment'
                ? 'bg-brand text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              Total Payment
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            {feeConfig.cashbackBase === 'totalItem'
              ? 'Cashback is calculated from the total price of the item (before discounts & fees)'
              : 'Cashback is calculated from the total payment (after discount + shipping + fees)'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5 block">Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={feeConfig.cashbackPct || ''}
                onChange={(e) => update('cashbackPct', Number(e.target.value))}
                placeholder="0"
                className="w-full bg-zinc-900 rounded-lg px-3 pr-10 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5 block">Max Cap</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
              <input
                type="number"
                value={feeConfig.cashbackMax || ''}
                onChange={(e) => update('cashbackMax', Number(e.target.value))}
                placeholder="No limit"
                className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
