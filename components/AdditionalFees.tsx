'use client'

import { useState } from 'react'
import { AdditionalFee } from '@/types'
import { IoCloseOutline } from 'react-icons/io5'

interface AdditionalFeesProps {
  fees: AdditionalFee[]
  onUpdate: (fees: AdditionalFee[]) => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const PRESET_FEES = [{ name: 'Service Charge' }, { name: 'Biaya Platform/App' }]

export default function AdditionalFees({ fees, onUpdate }: AdditionalFeesProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customAmount, setCustomAmount] = useState<number>(0)

  const addPresetFee = (name: string) => {
    onUpdate([...fees, { id: generateId(), name, amount: 0 }])
  }

  const addCustomFee = () => {
    if (!customName.trim()) return
    onUpdate([...fees, { id: generateId(), name: customName.trim(), amount: customAmount }])
    setCustomName('')
    setCustomAmount(0)
    setShowCustom(false)
  }

  const removeFee = (id: string) => onUpdate(fees.filter((f) => f.id !== id))

  const updateFeeAmount = (id: string, amount: number) => {
    onUpdate(fees.map((f) => (f.id === id ? { ...f, amount } : f)))
  }

  return (
    <div className="animate-fade-in card p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1">
        <p className="label">Opsional</p>
        <h3 className="text-base font-semibold text-ink">Biaya lain</h3>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {PRESET_FEES.map((preset) => (
          <button
            key={preset.name}
            onClick={() => addPresetFee(preset.name)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-rule2 bg-paper px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 transition-colors hover:border-ink hover:text-ink"
          >
            + {preset.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="inline-flex items-center gap-1 rounded-sm bg-ink px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-ink2"
        >
          + Lainnya
        </button>
      </div>

      {showCustom && (
        <div className="animate-fade-in mb-4 flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nama biaya"
            className="field flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustomFee()}
          />
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">Rp</span>
            <input
              type="number"
              value={customAmount || ''}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              placeholder="0"
              className="field field-mono pl-9 text-right"
              onKeyDown={(e) => e.key === 'Enter' && addCustomFee()}
            />
          </div>
          <button onClick={addCustomFee} className="button-primary shrink-0 px-4">
            Tambah
          </button>
        </div>
      )}

      {fees.length > 0 ? (
        <div className="divide-y divide-rule border-y border-rule">
          {fees.map((fee) => (
            <div key={fee.id} className="animate-fade-in flex items-center gap-2 py-2">
              <span className="flex-1 truncate text-sm text-ink2">{fee.name}</span>
              <div className="relative w-28 flex-shrink-0">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-faint">Rp</span>
                <input
                  type="number"
                  value={fee.amount || ''}
                  onChange={(e) => updateFeeAmount(fee.id, Number(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-sm border border-rule2 bg-white py-1.5 pl-7 pr-2 text-right font-mono text-xs text-ink outline-none transition-colors placeholder:text-faint focus:border-ink"
                />
              </div>
              <button
                onClick={() => removeFee(fee.id)}
                className="icon-button h-8 w-8 shrink-0 hover:text-stamp"
                aria-label="Hapus biaya"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Belum ada biaya lain. Tambahkan hanya kalau ada di struk aslinya.</p>
      )}
    </div>
  )
}
