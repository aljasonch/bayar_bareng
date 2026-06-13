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
        <p className="label">Live preview</p>
        <p className="mt-2 text-sm text-muted">Add items to see the split before calculating.</p>
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
    <aside className="card sticky top-5 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="label">Live preview</p>
          <h3 className="mt-1 text-base font-semibold text-ink">Running settlement</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Live
        </span>
      </div>
      {billMode === 'kopiKenangan' && (
        <p className="-mt-2 mb-4 text-xs text-muted">
          Kopi Kenangan - {formatOutletName(kopiKenanganOutlet)}
        </p>
      )}

      {paying.length > 0 && result.totalFinal > 0 && (
        <div className="mb-4 flex h-2 w-full overflow-hidden rounded-full bg-surface">
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

      <div className="space-y-2">
        {result.results.map((r, i) => {
          const color = getPersonColor(i)
          return (
            <div key={r.person.id} className="rounded-2xl border border-line bg-white/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: color.base }}
                  >
                    {r.person.name ? r.person.name.charAt(0).toUpperCase() : i + 1}
                  </div>
                  <span className="truncate text-sm font-medium text-ink3">{r.person.name || `Person ${i + 1}`}</span>
                </div>
                <span className="ml-2 shrink-0 font-mono text-sm font-semibold text-ink">
                  Rp{r.final.toLocaleString('id-ID')}
                </span>
              </div>
              {r.person.items.length > 0 && (
                <div className="mt-2 ml-9 space-y-1">
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

      <div className="mt-4 space-y-1.5 border-t border-line2 pt-3">
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
    </aside>
  )
}
