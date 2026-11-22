'use client'

import { useState, type CSSProperties } from 'react'
import { AlertCircle } from 'lucide-react'
import PersonChip from '@/components/ui/PersonChip'
import AssignSheet from '@/components/flow/AssignSheet'
import { formatRp } from '@/lib/money'
import type { FlowCtx } from '@/components/flow/SplitFlow'

/** Items with who-ordered chips. Tap an item to assign people, edit or remove it. */
export default function ItemList({ bill, dispatch, validation }: Pick<FlowCtx, 'bill' | 'dispatch' | 'validation'>) {
  const [openId, setOpenId] = useState<string | null>(null)
  const personIndex = (id: string) => bill.people.findIndex((p) => p.id === id)

  if (bill.items.length === 0) return null

  return (
    <>
      <ul className="space-y-2">
        {bill.items.map((item, n) => {
          const unassigned = validation.unassignedItemIds.includes(item.id)
          return (
            <li key={item.id} className="anim-rise" style={{ '--stagger': Math.min(n, 8) } as CSSProperties}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                className={`card block w-full p-3.5 text-left transition-colors hover:border-accent/40 ${unassigned ? 'border-accent/60 ring-1 ring-accent/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{item.name || 'Tanpa nama'}</div>
                    {item.detail && <div className="mt-0.5 truncate text-xs text-muted">{item.detail}</div>}
                  </div>
                  <div className="num text-sm">{formatRp(item.price)}</div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  {item.assignees.map((id) => {
                    const i = personIndex(id)
                    return i < 0 ? null : <PersonChip key={id} name={bill.people[i].name} index={i} className="anim-pop" />
                  })}
                  {unassigned && <span className="text-xs font-medium text-accent">Belum dibagi, ketuk untuk pilih</span>}
                  {item.needsCheck && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accentSoft px-2 py-0.5 text-xs text-accent">
                      <AlertCircle size={12} /> cek
                    </span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      <AssignSheet bill={bill} dispatch={dispatch} itemId={openId} onClose={() => setOpenId(null)} />
    </>
  )
}
