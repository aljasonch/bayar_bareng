'use client'

import { useState } from 'react'
import { AdditionalFee } from '@/types'
import { HiOutlineClipboardDocumentList, HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2'
import { MdRestaurant } from 'react-icons/md'
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2'

interface AdditionalFeesProps {
  fees: AdditionalFee[]
  onUpdate: (fees: AdditionalFee[]) => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const PRESET_FEES = [
  { name: 'Service Charge', icon: MdRestaurant },
  { name: 'Biaya Platform/App', icon: HiOutlineDevicePhoneMobile },
]

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

  const removeFee = (id: string) => {
    onUpdate(fees.filter((f) => f.id !== id))
  }

  const updateFeeAmount = (id: string, amount: number) => {
    onUpdate(fees.map((f) => (f.id === id ? { ...f, amount } : f)))
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <HiOutlineClipboardDocumentList className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-zinc-100">Additional Fees</h3>
      </div>

      {/* Quick-add chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_FEES.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.name}
              onClick={() => addPresetFee(preset.name)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:border-brand/50 hover:text-brand transition-all duration-200"
            >
              <Icon className="w-3.5 h-3.5" />
              {preset.name}
            </button>
          )
        })}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-brand/10 border border-brand/30 text-brand hover:bg-brand/20 transition-all duration-200"
        >
          <HiOutlinePlus className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {/* Custom fee input */}
      {showCustom && (
        <div className="flex gap-2 mb-4 animate-fade-in">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Fee name"
            className="flex-1 bg-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-700/50 focus:border-brand/50 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && addCustomFee()}
          />
          <div className="w-28 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
            <input
              type="number"
              value={customAmount || ''}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-zinc-800/80 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-700/50 focus:border-brand/50 transition-colors text-right"
              onKeyDown={(e) => e.key === 'Enter' && addCustomFee()}
            />
          </div>
          <button
            onClick={addCustomFee}
            className="px-3 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            Add
          </button>
        </div>
      )}

      {/* Fee cards */}
      {fees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="flex items-center gap-2 bg-zinc-800/60 rounded-lg px-3 py-2.5 border border-zinc-700/30 animate-fade-in"
            >
              <span className="text-sm text-zinc-300 flex-1 truncate">{fee.name}</span>
              <div className="w-24 relative flex-shrink-0">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-mono">Rp</span>
                <input
                  type="number"
                  value={fee.amount || ''}
                  onChange={(e) => updateFeeAmount(fee.id, Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-zinc-900/80 rounded-md pl-7 pr-2 py-1.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-700/50 focus:border-brand/50 transition-colors text-right"
                />
              </div>
              <button
                onClick={() => removeFee(fee.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10 flex-shrink-0"
                aria-label="Remove fee"
              >
                <HiOutlineXMark className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fees.length === 0 && (
        <p className="text-xs text-zinc-600 italic">No additional fees added yet</p>
      )}
    </div>
  )
}
