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
    <div className="animate-fade-in grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="card p-4 sm:p-5">
        <p className="label">Potongan</p>
        <h3 className="mb-4 mt-1 text-base font-semibold text-ink">Diskon item</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label mb-1.5 block">Persen</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={feeConfig.discountPct || ''}
                onChange={(e) => update('discountPct', Number(e.target.value))}
                placeholder="0"
                className="field field-mono pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">%</span>
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Maksimal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">Rp</span>
              <input
                type="number"
                inputMode="decimal"
                value={feeConfig.discountMax || ''}
                onChange={(e) => update('discountMax', Number(e.target.value))}
                placeholder="Tanpa batas"
                className="field field-mono pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <p className="label">Biaya bersama</p>
        <h3 className="mb-4 mt-1 text-base font-semibold text-ink">Ongkir</h3>
        <label className="label mb-1.5 block">Jumlah (dibagi rata)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">Rp</span>
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
        <p className="label">Penghematan</p>
        <h3 className="mb-4 mt-1 text-base font-semibold text-ink">Cashback</h3>

        <div className="mb-4">
          <label className="label mb-2 block">Dihitung dari</label>
          <div className="grid w-full grid-cols-2 overflow-hidden rounded-sm border border-rule2">
            <button
              onClick={() => onUpdate({ ...feeConfig, cashbackBase: 'totalItem' })}
              className={`px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                feeConfig.cashbackBase === 'totalItem'
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-muted hover:text-ink'
              }`}
            >
              Total item
            </button>
            <button
              onClick={() => onUpdate({ ...feeConfig, cashbackBase: 'totalPayment' })}
              className={`border-l border-rule2 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                feeConfig.cashbackBase === 'totalPayment'
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-muted hover:text-ink'
              }`}
            >
              Total bayar
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-faint">
            {feeConfig.cashbackBase === 'totalItem'
              ? 'Dihitung dari total harga item, sebelum diskon & biaya.'
              : 'Dihitung dari total bayar, setelah diskon + ongkir + biaya lain.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label mb-1.5 block">Persen</label>
            <div className="relative">
              <input
                type="number"
                value={feeConfig.cashbackPct || ''}
                onChange={(e) => update('cashbackPct', Number(e.target.value))}
                placeholder="0"
                className="field field-mono pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">%</span>
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Maksimal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">Rp</span>
              <input
                type="number"
                value={feeConfig.cashbackMax || ''}
                onChange={(e) => update('cashbackMax', Number(e.target.value))}
                placeholder="Tanpa batas"
                className="field field-mono pl-9"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
