'use client'

import Sheet from '@/components/ui/Sheet'
import PersonChip from '@/components/ui/PersonChip'
import MoneyInput from '@/components/ui/MoneyInput'
import { formatRp } from '@/lib/money'
import type { FlowCtx } from '@/components/flow/SplitFlow'

type Props = Pick<FlowCtx, 'bill' | 'dispatch'> & { itemId: string | null; onClose: () => void }

/** Choose who shares one item. Several people split it equally. */
export default function AssignSheet({ bill, dispatch, itemId, onClose }: Props) {
  const item = bill.items.find((i) => i.id === itemId)
  const share = item && item.assignees.length > 0 ? item.price / item.assignees.length : 0

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()} title={item?.name ?? ''} description={item?.detail}>
      {item && (
        <div className="space-y-5 pb-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Dipesan oleh</span>
              <button type="button" className="text-sm font-medium text-accent" onClick={() => dispatch({ type: 'assignAll', itemId: item.id })}>
                Semua
              </button>
            </div>
            {bill.people.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Tambahkan orang dulu di atas.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {bill.people.map((p, i) => (
                  <PersonChip
                    key={p.id}
                    name={p.name}
                    index={i}
                    showName
                    selected={item.assignees.includes(p.id)}
                    onClick={() => dispatch({ type: 'toggleAssignee', itemId: item.id, personId: p.id })}
                    className="h-9 text-sm"
                  />
                ))}
              </div>
            )}
            {item.assignees.length > 1 && (
              <p className="mt-2 text-sm text-muted">
                Dibagi {item.assignees.length}, masing-masing <span className="num">{formatRp(share)}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-[1fr_9rem] gap-2">
            <label className="text-xs text-muted">
              Nama
              <input className="field mt-1" value={item.name} onChange={(e) => dispatch({ type: 'updateItem', item: { ...item, name: e.target.value } })} />
            </label>
            <MoneyInput label="Harga" value={item.price} onChange={(price) => dispatch({ type: 'updateItem', item: { ...item, price, needsCheck: false } })} />
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1" onClick={onClose}>
              Selesai
            </button>
            <button
              type="button"
              className="btn-ghost text-danger"
              onClick={() => {
                dispatch({ type: 'removeItem', id: item.id })
                onClose()
              }}
            >
              Hapus item
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
