'use client'

import { useState } from 'react'
import { AdditionalFee } from '@/types'
import { IoAddOutline, IoCloseOutline } from 'react-icons/io5'

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
    <div className="card p-4 sm:p-5 animate-fade-in">
      <div className="mb-4 flex flex-col gap-1">
        <p className="label">Optional charges</p>
        <h3 className="text-base font-semibold text-ink">Additional fees</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_FEES.map((preset) => (
          <button
            key={preset.name}
            onClick={() => addPresetFee(preset.name)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line2 bg-white px-3 py-2 text-xs font-semibold text-ink3 transition-all hover:border-ink/25 hover:text-ink"
          >
            <IoAddOutline className="w-3.5 h-3.5" />
            {preset.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="inline-flex items-center gap-1 rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-accentDark"
        >
          <IoAddOutline className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="flex gap-2 mb-4 animate-fade-in">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Fee name"
            className="field flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustomFee()}
          />
          <div className="w-28 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-xs font-mono">Rp</span>
            <input
              type="number"
              value={customAmount || ''}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              placeholder="0"
              className="field field-mono text-right pl-9"
              onKeyDown={(e) => e.key === 'Enter' && addCustomFee()}
            />
          </div>
          <button
            onClick={addCustomFee}
            className="button-primary shrink-0 px-4"
          >
            Add
          </button>
        </div>
      )}

      {fees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="flex items-center gap-2 rounded-2xl border border-line bg-surface2/70 px-3 py-2.5 animate-fade-in"
            >
              <span className="text-sm text-ink2 flex-1 truncate">{fee.name}</span>
              <div className="w-24 relative flex-shrink-0">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-faint text-[10px] font-mono">Rp</span>
                <input
                  type="number"
                  value={fee.amount || ''}
                  onChange={(e) => updateFeeAmount(fee.id, Number(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-lg border border-line2 bg-white py-1.5 pl-7 pr-2 text-right font-mono text-xs text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                />
              </div>
              <button
                onClick={() => removeFee(fee.id)}
                className="icon-button h-8 w-8 shrink-0 hover:text-danger"
                aria-label="Remove fee"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No additional fees added yet.</p>
      )}
    </div>
  )
}
