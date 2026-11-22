'use client'

import { useState } from 'react'
import { removeDoc, saveDoc, useCollection } from '@/lib/admin/firestore'
import { describeCombo } from '@/lib/bill/promo-text'
import { AppPromoFields, PaymentPromoFields } from '@/components/flow/PromoFields'
import type { PromoCombo } from '@/lib/types'

const ORDER_TYPES: { value: PromoCombo['orderType']; label: string }[] = [
  { value: 'pickup', label: 'Pickup' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'outlet', label: 'Order di outlet' },
]

export default function CombosPage() {
  const { items, loading, error, run } = useCollection<PromoCombo>('promoCombos')
  const [form, setForm] = useState<PromoCombo | null>(null)

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    run(async () => {
      await saveDoc('promoCombos', form.id || undefined, { ...form, name: form.name.trim() })
      setForm(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Combo promo</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            setForm({ id: '', name: '', orderType: 'pickup', sortOrder: items.length, appPromo: { kind: 'none' }, paymentPromo: { kind: 'discountPct', pct: 40, max: 25000, minSpend: 50000 } })
          }
        >
          Tambah combo
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}

      {form && (
        <form onSubmit={save} className="card space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem_6rem]">
            <input className="field" placeholder="Nama combo" aria-label="Nama combo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="field" aria-label="Tipe order" value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value as PromoCombo['orderType'] })}>
              {ORDER_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input className="field num" type="number" aria-label="Urutan" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium">Promo aplikasi</h2>
            <AppPromoFields value={form.appPromo} onChange={(appPromo) => setForm({ ...form, appPromo })} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium">Promo pembayaran</h2>
            <PaymentPromoFields value={form.paymentPromo} onChange={(paymentPromo) => setForm({ ...form, paymentPromo })} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">Simpan</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted">Memuat…</p>
      ) : (
        <ul className="card divide-y divide-line">
          {items.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div>{c.name}</div>
                <div className="text-xs text-muted">{describeCombo(c)}</div>
              </div>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setForm(c)}>Ubah</button>
              <button type="button" className="btn-ghost btn-sm text-danger" onClick={() => window.confirm(`Hapus combo "${c.name}"?`) && run(() => removeDoc('promoCombos', c.id))}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
