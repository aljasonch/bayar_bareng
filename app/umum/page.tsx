'use client'

import SplitFlow from '@/components/flow/SplitFlow'
import PeoplePicker from '@/components/flow/PeoplePicker'
import ItemList from '@/components/flow/ItemList'
import ManualItemForm from '@/components/flow/ManualItemForm'

export default function UmumPage() {
  return (
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
    />
  )
}
