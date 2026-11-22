'use client'

import SplitFlow from '@/components/flow/SplitFlow'
import PeoplePicker from '@/components/flow/PeoplePicker'
import ItemList from '@/components/flow/ItemList'
import ManualItemForm from '@/components/flow/ManualItemForm'
import FeesEditor from '@/components/flow/FeesEditor'
import { formatRp } from '@/lib/money'

export default function UmumPage() {
  return (
    <div data-theme="hangat">
      <SplitFlow
        mode="umum"
        title="Nota umum"
        itemsStep={(ctx) => (
          <div className="space-y-6">
            <PeoplePicker {...ctx} />
            <section className="space-y-3">
              <h2 className="font-semibold">Pesanan</h2>
              <ManualItemForm {...ctx} />
              <ItemList {...ctx} />
            </section>
          </div>
        )}
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
