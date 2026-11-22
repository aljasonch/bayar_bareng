'use client'

import { useState } from 'react'
import { Camera, Plus, RotateCw } from 'lucide-react'
import SplitFlow, { type FlowCtx } from '@/components/flow/SplitFlow'
import PeoplePicker from '@/components/flow/PeoplePicker'
import ItemList from '@/components/flow/ItemList'
import MenuPicker from '@/components/flow/MenuPicker'
import FeesEditor from '@/components/flow/FeesEditor'
import PersonChip from '@/components/ui/PersonChip'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { repriceForOutlet } from '@/lib/catalog/menu-item'
import { newId } from '@/lib/bill/reducer'
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
      <button type="button" disabled className="card flex w-full items-center gap-3 p-4 text-left opacity-60">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-onAccent">
          <Camera size={20} />
        </span>
        <span>
          <span className="block font-medium">Scan struk</span>
          <span className="block text-sm text-muted">Segera hadir</span>
        </span>
      </button>

      <section>
        <h2 className="font-semibold">Outlet</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['normal', 'mall'] as const).map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={bill.outlet === o}
              onClick={() => setOutlet(o)}
              className={`rounded-2xl border p-3 text-left text-sm ${bill.outlet === o ? 'border-accent bg-accentSoft' : 'border-line'}`}
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
            <button type="button" className="btn-secondary min-h-9" onClick={catalogState.retry}>
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
          onAdd={(item, qty) => dispatch({ type: 'addItems', items: Array.from({ length: qty }, () => ({ ...item, id: newId(), assignees: [person.id] })) })}
        />
      )}
    </div>
  )
}

export default function KopkenPage() {
  const catalogState = useCatalog()
  return (
    <div data-theme="kopken">
      <SplitFlow
        mode="kopken"
        headerClassName="bg-accent text-onAccent rounded-b-[2rem]"
        title={
          <>
            Kopi Kenangan <span className="anim-beat text-[#ff9aac]">♥</span>
          </>
        }
        itemsStep={(ctx) => <KopkenItems {...ctx} catalogState={catalogState} />}
        promoStep={(ctx) => <FeesEditor {...ctx} />}
        resultStep={({ bill, totals }) => (
          <ul className="space-y-2">
            {totals.perPerson.map((p, i) => (
              <li key={p.personId} className="card flex justify-between p-4">
                <span>{bill.people[i].name}</span>
                <span className="num">{formatRp(p.final)}</span>
              </li>
            ))}
          </ul>
        )}
      />
    </div>
  )
}
