'use client'

import { PersonResult } from '@/types'
import { formatRp, getItemDetailLines, getItemLabel } from '@/lib/item-display'
import { getPersonColor } from '@/lib/colors'

interface ResultCardProps {
  result: PersonResult
  index: number
  /** Total of all finals, used to draw the share-of-bill bar. */
  grandTotal?: number
}

export default function ResultCard({ result, index, grandTotal }: ResultCardProps) {
  const color = getPersonColor(index)
  const sharePct =
    grandTotal && grandTotal > 0 ? Math.min(100, (result.final / grandTotal) * 100) : null
  const initial = (result.person.name || `P${index + 1}`).trim().charAt(0).toUpperCase()

  return (
    <div
      className="animate-slide-up card overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-line">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base text-white flex-shrink-0"
          style={{ backgroundColor: color.base }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink truncate">
            {result.person.name || `Person ${index + 1}`}
          </h3>
          {sharePct !== null && (
            <p className="text-xs text-faint">{sharePct.toFixed(0)}% of total</p>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 py-4">
        {/* Items */}
        <div className="space-y-1.5 mb-3 pb-3 divider-dashed">
          {result.person.items.map((item) => (
            <div key={item.id} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-ink3 truncate">{getItemLabel(item) || 'Unnamed'}</span>
                <span className="font-mono text-ink2 flex-shrink-0">{formatRp(item.price)}</span>
              </div>
              {getItemDetailLines(item).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {getItemDetailLines(item).map((line) => (
                    <span key={line} className="text-[11px] text-faint">
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
            <span className="text-muted">Subtotal</span>
            <span className="font-mono text-ink2">{formatRp(result.subtotal)}</span>
          </div>
          {result.discountSaved > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Discount</span>
              <span className="font-mono text-accent">-{formatRp(result.discountSaved)}</span>
            </div>
          )}
          {result.deliveryShare > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Delivery</span>
              <span className="font-mono text-ink2">+{formatRp(result.deliveryShare)}</span>
            </div>
          )}
          {result.additionalFeesShare > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Add. fees</span>
              <span className="font-mono text-ink2">+{formatRp(result.additionalFeesShare)}</span>
            </div>
          )}
          {result.cashbackSaved > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Cashback</span>
              <span className="font-mono text-accent">-{formatRp(result.cashbackSaved)}</span>
            </div>
          )}
        </div>

        {/* Final */}
        <div className="pt-3 border-t border-line2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-ink3">Total to pay</span>
            <span className="text-lg font-bold font-mono" style={{ color: color.base }}>
              {formatRp(result.final)}
            </span>
          </div>
          {sharePct !== null && (
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full animate-grow-bar"
                style={{ width: `${sharePct}%`, backgroundColor: color.base }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
