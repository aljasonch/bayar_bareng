'use client'

import { Plus, X } from 'lucide-react'
import MoneyInput from '@/components/ui/MoneyInput'
import { newId } from '@/lib/bill/reducer'
import type { FlowCtx } from '@/components/flow/SplitFlow'

/** Delivery and other shared fees. Both are split equally between everyone on the bill. */
export default function FeesEditor({ bill, dispatch }: Pick<FlowCtx, 'bill' | 'dispatch'>) {
  const { fees } = bill
  const setOthers = (others: typeof fees.others) => dispatch({ type: 'setFees', fees: { ...fees, others } })

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold">Biaya bersama</h2>
        <p className="text-sm text-muted">Dibagi rata ke semua orang.</p>
      </div>
      <label className="block text-sm">
        Ongkir
        <MoneyInput className="mt-1" value={fees.delivery} onChange={(delivery) => dispatch({ type: 'setFees', fees: { ...fees, delivery } })} placeholder="0" aria-label="Ongkir" />
      </label>
      {fees.others.map((f) => (
        <div key={f.id} className="grid grid-cols-[1fr_8.5rem_auto] gap-2">
          <input className="field" value={f.name} placeholder="Nama biaya" aria-label="Nama biaya" onChange={(e) => setOthers(fees.others.map((x) => (x.id === f.id ? { ...x, name: e.target.value } : x)))} />
          <MoneyInput value={f.amount} onChange={(amount) => setOthers(fees.others.map((x) => (x.id === f.id ? { ...x, amount } : x)))} aria-label={`Jumlah ${f.name}`} />
          <button type="button" className="btn-ghost px-2" onClick={() => setOthers(fees.others.filter((x) => x.id !== f.id))} aria-label={`Hapus ${f.name}`}>
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="btn-ghost -ml-3 px-3" onClick={() => setOthers([...fees.others, { id: newId(), name: '', amount: 0 }])}>
        <Plus size={16} /> Biaya lain (take away, service, pajak)
      </button>
    </section>
  )
}
