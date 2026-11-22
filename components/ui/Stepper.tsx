'use client'

import { Minus, Plus } from 'lucide-react'

type Props = { value: number; onChange: (value: number) => void; min?: number; label: string }

export default function Stepper({ value, onChange, min = 1, label }: Props) {
  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-surface" role="group" aria-label={label}>
      <button type="button" className="p-2.5 text-muted hover:text-ink disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Kurangi">
        <Minus size={16} />
      </button>
      <span className="num w-8 text-center text-sm">{value}</span>
      <button type="button" className="p-2.5 text-muted hover:text-ink" onClick={() => onChange(value + 1)} aria-label="Tambah">
        <Plus size={16} />
      </button>
    </div>
  )
}
