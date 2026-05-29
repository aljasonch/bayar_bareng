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
      <h3 className="text-sm font-bold text-ink mb-4">Additional fees</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_FEES.map((preset) => (
          <button
            key={preset.name}
            onClick={() => addPresetFee(preset.name)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E0DCF2] text-ink3 hover:border-accent hover:text-accent transition-all"
          >
            <IoAddOutline className="w-3.5 h-3.5" />
            {preset.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accentDark transition-all"
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
            className="px-4 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accentDark transition-colors flex-shrink-0"
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
              className="flex items-center gap-2 bg-surface2 rounded-lg px-3 py-2.5 border border-line2 animate-fade-in"
            >
              <span className="text-sm text-ink2 flex-1 truncate">{fee.name}</span>
              <div className="w-24 relative flex-shrink-0">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-faint text-[10px] font-mono">Rp</span>
                <input
                  type="number"
                  value={fee.amount || ''}
                  onChange={(e) => updateFeeAmount(fee.id, Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white rounded-md pl-7 pr-2 py-1.5 text-xs font-mono text-ink placeholder:text-faint outline-none border border-[#E0DCF2] focus:border-accent transition-colors text-right"
                />
              </div>
              <button
                onClick={() => removeFee(fee.id)}
                className="text-faint hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 flex-shrink-0"
                aria-label="Remove fee"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-faint italic">No additional fees added yet</p>
      )}
    </div>
  )
}
