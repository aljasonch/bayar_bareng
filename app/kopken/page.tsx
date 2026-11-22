'use client'

import { useState } from 'react'
import { Plus, RotateCw } from 'lucide-react'
import SplitFlow, { type FlowCtx } from '@/components/flow/SplitFlow'
import PeoplePicker from '@/components/flow/PeoplePicker'
import ItemList from '@/components/flow/ItemList'
import MenuPicker from '@/components/flow/MenuPicker'
import ScanReceipt from '@/components/flow/ScanReceipt'
import PersonChip from '@/components/ui/PersonChip'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { repriceForOutlet } from '@/lib/catalog/menu-item'
import { formatRp } from '@/lib/money'
import type { Outlet } from '@/lib/types'

function KopkenItems(ctx: FlowCtx & { catalogState: ReturnType<typeof useCatalog> }) {
  const { bill, dispatch, catalogState } = ctx
  const [forPerson, setForPerson] = useState<string | null>(null)
  const { catalog } = catalogState
  const person = bill.people.find((p) => p.id === forPerson)

  function setOutlet(outlet: Outlet) {
    dispatch({ type: 'setMeta', outlet })
    if (catalog) repriceForOutlet(bill.items, catalog, outlet).forEach((item) => dispatch({ type: 'updateItem', item }))
  }

  return (
    <div className="space-y-6">
      <ScanReceipt {...ctx} catalog={catalog} combos={catalogState.combos} />

      <section>
        <h2 className="font-semibold">Outlet</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['normal', 'mall'] as const).map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={bill.outlet === o}
              onClick={() => setOutlet(o)}
              className={`option-card p-3 text-sm ${bill.outlet === o ? 'option-card-active' : ''}`}
            >
              <span className="block font-medium">{o === 'normal' ? 'Normal store' : 'Mall store'}</span>
              <span className="text-xs text-muted">{o === 'normal' ? 'Harga biasa' : `+${formatRp(catalog?.outlet.mallAdjustment ?? 2000)} per item`}</span>
            </button>
          ))}
        </div>
      </section>

      <PeoplePicker {...ctx} />

      <section className="space-y-3">
        <h2 className="font-semibold">Pesanan</h2>
        {catalogState.error ? (
          <div className="card flex items-center gap-3 p-4 text-sm">
            <span className="flex-1 text-danger">{catalogState.error}</span>
            <button type="button" className="btn-secondary btn-sm px-3" onClick={catalogState.retry}>
              <RotateCw size={14} /> Coba lagi
            </button>
          </div>
        ) : !catalog ? (
          <div className="card anim-shimmer h-14" aria-label="Memuat menu" />
        ) : bill.people.length === 0 ? (
          <p className="text-sm text-muted">Tambahkan orang dulu, lalu pilih pesanan masing-masing.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bill.people.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setForPerson(p.id)} className="inline-flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3.5 text-sm hover:border-accent">
                <PersonChip name={p.name} index={i} />
                <Plus size={14} /> {p.name}
              </button>
            ))}
          </div>
        )}
        <ItemList {...ctx} />
      </section>

      {catalog && person && (
        <MenuPicker
          open
          personName={person.name}
          catalog={catalog}
          outlet={bill.outlet}
          onClose={() => setForPerson(null)}
          onAdd={(item, qty) => dispatch({ type: 'addItems', items: Array.from({ length: qty }, () => ({ ...item, id: crypto.randomUUID(), assignees: [person.id] })) })}
        />
      )}
    </div>
  )
}

export default function KopkenPage() {
  const catalogState = useCatalog()
  return (
    <div data-theme="kopken" className="min-h-screen bg-bg text-ink">
      <SplitFlow
        mode="kopken"
        headerClassName="kopken-band"
        combos={catalogState.combos}
        title={
          <>
            Kopi Kenangan <span className="anim-beat kopken-heart">♥</span>
          </>
        }
        itemsStep={(ctx) => <KopkenItems {...ctx} catalogState={catalogState} />}
      />
    </div>
  )
}
