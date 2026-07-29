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
  const initial = (result.person.name || `O${index + 1}`).trim().charAt(0).toUpperCase()

  return (
    <article
      className="animate-slide-up card overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center gap-3 border-b border-rule px-4 py-3 sm:px-5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-sm font-semibold text-white"
          style={{ backgroundColor: color.base }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink">
            {result.person.name || `Orang ${index + 1}`}
          </h3>
        </div>
        {sharePct !== null && (
          <span className="shrink-0 font-mono text-xs text-muted">{sharePct.toFixed(0)}%</span>
        )}
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="mb-3 space-y-1.5 border-b border-dashed border-rule2 pb-3">
          {result.person.items.map((item) => (
            <div key={item.id}>
              <div className="flex items-baseline font-mono text-sm">
                <span className="truncate text-ink3">{getItemLabel(item) || 'Tanpa nama'}</span>
                <span className="dots" aria-hidden />
                <span className="shrink-0 text-ink2">{formatRp(item.price)}</span>
              </div>
              {getItemDetailLines(item).length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  {getItemDetailLines(item).map((line) => (
                    <span key={line} className="font-mono text-[11px] text-faint">
                      {line}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-3 space-y-1 font-mono text-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-ink2">{formatRp(result.subtotal)}</span>
          </div>
          {result.discountSaved > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Diskon</span>
              <span className="text-stamp">-{formatRp(result.discountSaved)}</span>
            </div>
          )}
          {result.deliveryShare > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Ongkir</span>
              <span className="text-ink2">+{formatRp(result.deliveryShare)}</span>
            </div>
          )}
          {result.additionalFeesShare > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Biaya lain</span>
              <span className="text-ink2">+{formatRp(result.additionalFeesShare)}</span>
            </div>
          )}
          {result.cashbackSaved > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Cashback</span>
              <span className="text-stamp">-{formatRp(result.cashbackSaved)}</span>
            </div>
          )}
        </div>

        <div className="rule-total pt-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink">Bayar</span>
            <span className="font-mono text-2xl font-bold text-ink">{formatRp(result.final)}</span>
          </div>
          {sharePct !== null && (
            <div className="mt-2.5 h-1 w-full overflow-hidden bg-paper2">
              <div
                className="h-full animate-grow-bar"
                style={{ width: `${sharePct}%`, backgroundColor: color.base }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
