'use client'

import SplitFlow from '@/components/flow/SplitFlow'
import PeoplePicker from '@/components/flow/PeoplePicker'
import ItemList from '@/components/flow/ItemList'
import ManualItemForm from '@/components/flow/ManualItemForm'
import FeesEditor from '@/components/flow/FeesEditor'
import PromoPicker from '@/components/flow/PromoPicker'
import BillMeta from '@/components/flow/BillMeta'
import ResultView from '@/components/flow/ResultView'

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
        promoStep={(ctx) => (
          <div className="space-y-8">
            <FeesEditor {...ctx} />
            <PromoPicker {...ctx} />
            <BillMeta {...ctx} />
          </div>
        )}
        resultStep={({ bill, totals, dispatch, goTo }) => (
          <ResultView
            bill={bill}
            totals={totals}
            onReset={() => {
              dispatch({ type: 'reset' })
              goTo('items')
            }}
          />
        )}
      />
    </div>
  )
}
