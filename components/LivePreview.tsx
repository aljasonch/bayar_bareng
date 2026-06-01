'use client'

import { Person, FeeConfig, BillMode, KopiKenanganOutlet } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { getItemDetailLines, getItemLabel } from '@/lib/item-display'
import { getPersonColor } from '@/lib/colors'

interface LivePreviewProps {
  people: Person[]
  feeConfig: FeeConfig
  billMode?: BillMode
  kopiKenanganOutlet?: KopiKenanganOutlet
}

export default function LivePreview({ people, feeConfig, billMode, kopiKenanganOutlet }: LivePreviewProps) {
  const hasItems = people.some((p) => p.items.some((i) => i.price > 0))

  if (!hasItems) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-faint">Add items to see the live preview</p>
      </div>
    )
  }

  const result = calculateBill(
    people,
    feeConfig,
    undefined,
    undefined,
    undefined,
    billMode,
    kopiKenanganOutlet
  )

  const paying = result.results
    .map((r, i) => ({ id: r.person.id, value: r.final, color: getPersonColor(i) }))
    .filter((s) => s.value > 0)

  return (
    <div className="card p-4 sm:p-5 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-ink">Live preview</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Live
        </span>
      </div>
      {billMode === 'kopiKenangan' && (
        <p className="text-xs text-faint -mt-2 mb-4">
          Kopi Kenangan - {formatOutletName(kopiKenanganOutlet)}
        </p>
      )}

      {paying.length > 0 && result.totalFinal > 0 && (
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface mb-4">
          {paying.map((s) => (
            <div
              key={s.id}
              className="h-full"
              style={{
                width: `${(s.value / result.totalFinal) * 100}%`,
                backgroundColor: s.color.base,
                borderRight: '1.5px solid rgb(var(--color-white) / 1)',
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {result.results.map((r, i) => {
          const color = getPersonColor(i)
          return (
            <div key={r.person.id} className="py-2 border-b border-line last:border-0">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: color.base }}
                  >
                    {r.person.name ? r.person.name.charAt(0).toUpperCase() : i + 1}
                  </div>
                  <span className="text-sm text-ink3 truncate">{r.person.name || `Person ${i + 1}`}</span>
                </div>
                <span className="font-mono text-sm font-bold text-ink flex-shrink-0 ml-2">
                  Rp{r.final.toLocaleString('id-ID')}
                </span>
              </div>
              {r.person.items.length > 0 && (
                <div className="mt-2 ml-8 space-y-1">
                  {r.person.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="text-[11px] text-faint">
                      <p className="truncate text-muted">{getItemLabel(item)}</p>
                      {getItemDetailLines(item)
                        .filter(
                          (line) =>
                            line.startsWith('Upgrade') || line.startsWith('Syrup') || line.startsWith('Add-ons')
                        )
                        .slice(0, 2)
                        .map((line) => (
                          <p key={line} className="truncate">
                            {line}
                          </p>
                        ))}
                    </div>
                  ))}
                  {r.person.items.length > 2 && (
                    <p className="text-[11px] text-faint">+{r.person.items.length - 2} more items</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-line2 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="font-mono text-sm font-bold text-ink">
            Rp{result.totalFinal.toLocaleString('id-ID')}
          </span>
        </div>
        {result.totalSaved > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-muted">Total saved</span>
            <span className="font-mono text-sm font-bold text-accent">
              Rp{result.totalSaved.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
