'use client'

import type { FlowCtx } from '@/components/flow/SplitFlow'

/** Date and who paid first (shown on the receipt and the WhatsApp message). */
export default function BillMeta({ bill, dispatch }: Pick<FlowCtx, 'bill' | 'dispatch'>) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Detail tagihan</h2>
      <label className="block text-sm">
        Tanggal
        <input type="date" className="field num mt-1" value={bill.date} onChange={(e) => dispatch({ type: 'setMeta', date: e.target.value })} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          Ditalangi oleh
          <input className="field mt-1" placeholder="Opsional" value={bill.payerName ?? ''} onChange={(e) => dispatch({ type: 'setMeta', payerName: e.target.value })} />
        </label>
        <label className="text-sm">
          No. rekening
          <input
            className="field num mt-1 disabled:opacity-50"
            placeholder="Opsional"
            inputMode="numeric"
            disabled={!bill.payerName?.trim()}
            value={bill.payerAccount ?? ''}
            onChange={(e) => dispatch({ type: 'setMeta', payerAccount: e.target.value })}
          />
        </label>
      </div>
    </section>
  )
}
