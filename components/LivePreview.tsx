'use client'

import { Person, FeeConfig } from '@/types'
import { calculateBill } from '@/lib/calculate'

interface LivePreviewProps {
  people: Person[]
  feeConfig: FeeConfig
}

export default function LivePreview({ people, feeConfig }: LivePreviewProps) {
  const hasItems = people.some((p) => p.items.some((i) => i.price > 0))

  if (!hasItems) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-zinc-500">Add items to see the live preview</p>
      </div>
    )
  }

  const result = calculateBill(people, feeConfig)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 sticky top-6">
      <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-4">
        Live Preview
      </h3>

      <div className="space-y-3">
        {result.results.map((r, i) => (
          <div key={r.person.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {i + 1}
              </div>
              <span className="text-sm text-zinc-300 truncate">{r.person.name || `Person ${i + 1}`}</span>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-100 flex-shrink-0 ml-2">
              Rp{r.final.toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-sm text-zinc-400">Total</span>
          <span className="font-mono text-sm font-bold text-brand">
            Rp{result.totalFinal.toLocaleString('id-ID')}
          </span>
        </div>
        {result.totalSaved > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-zinc-400">Total Saved</span>
            <span className="font-mono text-sm font-bold text-teal-400">
              Rp{result.totalSaved.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
