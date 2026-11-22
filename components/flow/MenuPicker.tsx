'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'
import Stepper from '@/components/ui/Stepper'
import { buildMenuBillItem, SIZE_LABEL } from '@/lib/catalog/menu-item'
import { formatRp } from '@/lib/money'
import type { BillItem, Catalog, IceLevel, MenuItem, Modifier, Outlet, Size, Sweetness } from '@/lib/types'

const SWEETNESS: Sweetness[] = ['Normal', 'Less Sugar', 'No Sugar']
const ICE: IceLevel[] = ['Normal', 'Less Ice', 'No Ice']

type Props = {
  open: boolean
  personName: string
  catalog: Catalog
  outlet: Outlet
  onClose: () => void
  onAdd: (item: Omit<BillItem, 'id' | 'assignees'>, qty: number) => void
}

function Choice<T extends string>({ options, value, onChange, label }: { options: T[]; value: T; onChange: (v: T) => void; label: (v: T) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${value === o ? 'border-accent bg-accent text-onAccent' : 'border-line hover:border-accent/50'}`}
        >
          {label(o)}
        </button>
      ))}
    </div>
  )
}

export default function MenuPicker({ open, personName, catalog, outlet, onClose, onAdd }: Props) {
  const [categoryId, setCategoryId] = useState(catalog.categories[0]?.id ?? '')
  const [item, setItem] = useState<MenuItem | null>(null)
  const [size, setSize] = useState<Size>('R')
  const [mods, setMods] = useState<Modifier[]>([])
  const [sweetness, setSweetness] = useState<Sweetness>('Normal')
  const [ice, setIce] = useState<IceLevel>('Normal')
  const [qty, setQty] = useState(1)

  const sizesFor = (m: MenuItem) => catalog.outlet.availableSizes.filter((s) => m.prices[s] != null)
  const adj = outlet === 'mall' ? catalog.outlet.mallAdjustment : 0
  const shown = catalog.menu.filter((m) => m.categoryId === categoryId && sizesFor(m).length > 0)

  function pick(m: MenuItem) {
    setItem(m)
    setSize(sizesFor(m)[0])
    setMods([])
    setSweetness('Normal')
    setIce('Normal')
    setQty(1)
  }

  function close() {
    setItem(null)
    onClose()
  }

  const built = item ? buildMenuBillItem({ item, size, modifiers: mods, sweetness, ice }, outlet, catalog.outlet.mallAdjustment) : null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()} title={item ? item.name : `Pesanan ${personName}`} description={item ? undefined : 'Pilih menu'}>
      {!item ? (
        <div className="pb-2">
          <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-3">
            {catalog.categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm ${c.id === categoryId ? 'bg-accent text-onAccent' : 'bg-accentSoft text-ink'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-line">
            {shown.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => pick(m)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{m.name}</span>
                    <span className="mt-0.5 flex gap-1.5 text-xs text-accent">
                      {m.isNew && <span>Baru</span>}
                      {m.isBaristaChoice && <span>Barista choice</span>}
                      {m.isLimitedTime && <span>Terbatas</span>}
                    </span>
                  </span>
                  <span className="num text-sm text-muted">{formatRp((m.prices[sizesFor(m)[0]] ?? 0) + adj)}</span>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="py-6 text-center text-sm text-muted">Belum ada menu di kategori ini.</li>}
          </ul>
        </div>
      ) : (
        <div className="space-y-5 pb-2">
          <button type="button" className="btn-ghost -ml-3 -mt-2 min-h-9 px-3" onClick={() => setItem(null)}>
            <ArrowLeft size={16} /> Menu lain
          </button>
          <section>
            <h3 className="mb-2 text-sm text-muted">Ukuran</h3>
            <Choice options={sizesFor(item)} value={size} onChange={setSize} label={(s) => `${SIZE_LABEL[s]} · ${formatRp((item.prices[s] ?? 0) + adj)}`} />
          </section>
          <section>
            <h3 className="mb-2 text-sm text-muted">Es</h3>
            <Choice options={ICE} value={ice} onChange={setIce} label={(v) => v} />
          </section>
          <section>
            <h3 className="mb-2 text-sm text-muted">Gula</h3>
            <Choice options={SWEETNESS} value={sweetness} onChange={setSweetness} label={(v) => v} />
          </section>
          {catalog.modifierGroups.map((g) => (
            <section key={g.id}>
              <h3 className="mb-2 text-sm text-muted">{g.name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {g.modifiers.map((m) => {
                  const on = mods.some((x) => x.id === m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMods(on ? mods.filter((x) => x.id !== m.id) : [...mods, m])}
                      className={`rounded-full border px-3.5 py-2 text-sm ${on ? 'border-accent bg-accentSoft text-accent' : 'border-line'}`}
                    >
                      {m.name} <span className="num text-xs opacity-70">+{formatRp(m.price)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
          <div className="sticky bottom-0 -mx-5 flex items-center gap-3 border-t border-line bg-surface px-5 pt-3">
            <Stepper value={qty} onChange={setQty} label="Jumlah" />
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => {
                if (built) onAdd(built, qty)
                setItem(null)
              }}
            >
              Tambah · <span className="num">{formatRp((built?.price ?? 0) * qty)}</span>
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
