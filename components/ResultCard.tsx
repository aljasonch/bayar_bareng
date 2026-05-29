'use client'

import { PersonResult } from '@/types'
import { formatRp, getItemDetailLines, getItemLabel } from '@/lib/item-display'

interface ResultCardProps {
  result: PersonResult
  index: number
}

export default function ResultCard({ result, index }: ResultCardProps) {
  return (
    <div
      className="animate-slide-up rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 transition-all duration-200 hover:border-zinc-700"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-lg shadow-brand/20">
          {index + 1}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-zinc-100">{result.person.name || `Person ${index + 1}`}</h3>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3 pb-3 border-b border-white/5">
        {result.person.items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-zinc-400 truncate">{getItemLabel(item) || 'Unnamed'}</span>
              <span className="font-mono text-zinc-300 flex-shrink-0">{formatRp(item.price)}</span>
            </div>
            {getItemDetailLines(item).length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {getItemDetailLines(item).map((line) => (
                  <span key={line} className="text-[11px] text-zinc-600">
                    {line}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-zinc-400">Subtotal</span>
          <span className="font-mono text-zinc-300">{formatRp(result.subtotal)}</span>
        </div>
        {result.discountSaved > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Discount</span>
            <span className="font-mono text-teal-400">-{formatRp(result.discountSaved)}</span>
          </div>
        )}
        {result.deliveryShare > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Delivery</span>
            <span className="font-mono text-zinc-300">+{formatRp(result.deliveryShare)}</span>
          </div>
        )}
        {result.additionalFeesShare > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Add. Fees</span>
            <span className="font-mono text-zinc-300">+{formatRp(result.additionalFeesShare)}</span>
          </div>
        )}
        {result.cashbackSaved > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Cashback</span>
            <span className="font-mono text-teal-400">-{formatRp(result.cashbackSaved)}</span>
          </div>
        )}
      </div>

      {/* Final amount */}
      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-sm font-semibold text-zinc-300">Total to Pay</span>
        <span className="text-lg sm:text-xl font-bold font-mono text-brand">
          {formatRp(result.final)}
        </span>
      </div>
    </div>
  )
}
