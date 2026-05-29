'use client'

import { Person, FeeConfig, BillMode, KopiKenanganOutlet } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { getItemDetailLines, getItemLabel } from '@/lib/item-display'

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
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6 text-center">
        <p className="text-sm text-zinc-500">Add items to see the live preview</p>
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

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 sticky top-6">
      <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-4">
        Live Preview
      </h3>
      {billMode === 'kopiKenangan' && (
        <p className="text-xs text-zinc-500 -mt-3 mb-4">
          Kopi Kenangan - {formatOutletName(kopiKenanganOutlet)}
        </p>
      )}

      <div className="space-y-3">
        {result.results.map((r, i) => (
          <div key={r.person.id} className="py-2 border-b border-white/5 last:border-0">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm text-zinc-300 truncate">{r.person.name || `Person ${i + 1}`}</span>
              </div>
              <span className="font-mono text-sm font-bold text-zinc-100 flex-shrink-0 ml-2">
                Rp{r.final.toLocaleString('id-ID')}
              </span>
            </div>
            {r.person.items.length > 0 && (
              <div className="mt-2 ml-8 space-y-1">
                {r.person.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="text-[11px] text-zinc-500">
                    <p className="truncate text-zinc-400">{getItemLabel(item)}</p>
                    {getItemDetailLines(item)
                      .filter((line) => line.startsWith('Upgrade') || line.startsWith('Syrup') || line.startsWith('Add-ons'))
                      .slice(0, 2)
                      .map((line) => (
                        <p key={line} className="truncate">
                          {line}
                        </p>
                      ))}
                  </div>
                ))}
                {r.person.items.length > 2 && (
                  <p className="text-[11px] text-zinc-600">+{r.person.items.length - 2} more items</p>
                )}
              </div>
            )}
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
