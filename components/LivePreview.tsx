'use client'

import { Person, FeeConfig, BillMode, KopiKenanganOutlet } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp, getItemLabel } from '@/lib/item-display'
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
        <p className="label">Pratinjau</p>
        <p className="mt-2 text-sm text-muted">Isi item dulu, hitungannya muncul di sini.</p>
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
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="label">Pratinjau</p>
          <h3 className="mt-1 text-base font-semibold text-ink">Hitungan berjalan</h3>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-wa" />
          live
        </span>
      </div>
      {billMode === 'kopiKenangan' && (
        <p className="-mt-1 mb-3 font-mono text-xs text-muted">
          Kopi Kenangan · {formatOutletName(kopiKenanganOutlet)}
        </p>
      )}

      {paying.length > 0 && result.totalFinal > 0 && (
        <div className="mb-4 flex h-2 w-full overflow-hidden bg-paper2">
          {paying.map((s) => (
            <div
              key={s.id}
              className="h-full"
              style={{
                width: `${(s.value / result.totalFinal) * 100}%`,
                backgroundColor: s.color.base,
                borderRight: '1.5px solid rgb(var(--color-paper) / 1)',
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {result.results.map((r, i) => {
          const color = getPersonColor(i)
          return (
            <div key={r.person.id}>
              <div className="flex items-baseline font-mono text-sm">
                <span
                  className="mr-2 inline-block h-2 w-2 shrink-0 self-center"
                  style={{ backgroundColor: color.base }}
                />
                <span className="truncate text-ink2">{r.person.name || `Orang ${i + 1}`}</span>
                <span className="dots" aria-hidden />
                <span className="shrink-0 font-semibold text-ink">{formatRp(r.final)}</span>
              </div>
              {r.person.items.length > 0 && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {r.person.items.slice(0, 2).map((item) => (
                    <p key={item.id} className="truncate font-mono text-[11px] text-faint">
                      {getItemLabel(item)}
                    </p>
                  ))}
                  {r.person.items.length > 2 && (
                    <p className="font-mono text-[11px] text-faint">+{r.person.items.length - 2} item lagi</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rule-total mt-4 pt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink">Total</span>
          <span className="font-mono text-lg font-bold text-ink">{formatRp(result.totalFinal)}</span>
        </div>
        {result.totalSaved > 0 && (
          <div className="mt-0.5 flex items-baseline justify-between font-mono text-xs">
            <span className="text-muted">hemat</span>
            <span className="font-semibold text-stamp">-{formatRp(result.totalSaved)}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
