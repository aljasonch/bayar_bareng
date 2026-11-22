'use client'

import { useRef, useState } from 'react'
import { AlertTriangle, Camera, Plus, X } from 'lucide-react'
import MoneyInput from '@/components/ui/MoneyInput'
import { checkReceipt } from '@/lib/scan/check'
import { receiptToBill } from '@/lib/scan/to-bill'
import { formatRp } from '@/lib/money'
import type { FlowCtx } from '@/components/flow/SplitFlow'
import type { Catalog, PromoCombo, ScannedReceipt } from '@/lib/types'

type Props = Pick<FlowCtx, 'bill' | 'dispatch'> & { catalog: Catalog | null; combos: PromoCombo[] }

const EMPTY_CATALOG: Catalog = { categories: [], menu: [], modifierGroups: [], outlet: { mallAdjustment: 0, availableSizes: [] } }

/** Big photos are re-encoded to JPEG (longest side 2000px) so uploads stay under the server's 4 MB limit. */
async function shrink(file: File): Promise<File> {
  if (file.size <= 1_500_000) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob ? new File([blob], 'struk.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file
  }
}

/** Upload a Kopi Kenangan receipt, let the user correct what the AI read, then load it into the bill. */
export default function ScanReceipt({ bill, dispatch, catalog, combos }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'reading' | 'review'>('idle')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<ScannedReceipt | null>(null)

  async function upload(file: File) {
    setStatus('reading')
    setError('')
    try {
      const form = new FormData()
      form.append('image', await shrink(file))
      const res = await fetch('/api/scan', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (res.status === 413) throw new Error('Gambar terlalu besar. Pakai screenshot struk, bukan foto kamera.')
      if (!res.ok || !data.receipt) throw new Error(data.error || 'Struk tidak terbaca. Coba foto yang lebih jelas.')
      setReceipt(data.receipt)
      setStatus('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('idle')
    }
  }

  function apply() {
    if (!receipt) return
    const out = receiptToBill(receipt, catalog ?? EMPTY_CATALOG, bill.outlet)
    dispatch({ type: 'loadReceipt', items: out.items, fees: out.fees, appPromo: out.appPromo })
    const combo = combos.find((c) => c.orderType === out.suggestedOrderType)
    if (combo) dispatch({ type: 'setPaymentPromo', promo: combo.paymentPromo })
    if (receipt.date) dispatch({ type: 'setMeta', date: receipt.date })
    setReceipt(null)
    setStatus('idle')
  }

  const set = (patch: Partial<ScannedReceipt>) => receipt && setReceipt({ ...receipt, ...patch })
  const check = receipt && checkReceipt(receipt)

  if (status === 'review' && receipt && check) {
    return (
      <section className="card anim-rise space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Cek hasil baca struk</h2>
            <p className="text-sm text-muted">
              {receipt.outlet || 'Outlet tidak terbaca'} · {receipt.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
            </p>
          </div>
          <button type="button" className="rounded-full p-1.5 text-muted hover:text-ink" onClick={() => setStatus('idle')} aria-label="Batalkan scan">
            <X size={18} />
          </button>
        </div>

        {!check.ok && (
          <p className="flex gap-2 rounded-2xl bg-accentSoft p-3 text-sm">
            <AlertTriangle size={18} className="shrink-0 text-accent" />
            <span>
              Total struk tidak cocok, selisih <span className="num font-medium">{formatRp(Math.abs(check.itemsDiff || check.totalDiff))}</span>. Periksa angka di bawah dengan
              struk aslinya.
            </span>
          </p>
        )}

        <ul className="space-y-2">
          {receipt.items.map((it, i) => (
            <li key={i} className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 rounded-2xl bg-bg/60 p-2">
              <input
                className="field col-span-3"
                placeholder="Nama item"
                aria-label={`Nama item ${i + 1}`}
                value={it.name}
                onChange={(e) => set({ items: receipt.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
              />
              <input
                className="field num px-2 text-center"
                inputMode="numeric"
                aria-label={`Jumlah item ${i + 1}`}
                value={it.qty}
                onChange={(e) => set({ items: receipt.items.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) } : x)) })}
              />
              <MoneyInput aria-label={`Harga item ${i + 1}`} value={it.lineTotal} onChange={(lineTotal) => set({ items: receipt.items.map((x, j) => (j === i ? { ...x, lineTotal } : x)) })} />
              <button type="button" className="p-1.5 text-muted hover:text-ink" aria-label={`Hapus item ${i + 1}`} onClick={() => set({ items: receipt.items.filter((_, j) => j !== i) })}>
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-ghost -ml-3 min-h-9 px-3" onClick={() => set({ items: [...receipt.items, { qty: 1, name: '', lineTotal: 0 }] })}>
          <Plus size={16} /> Item yang terlewat
        </button>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted">
          {receipt.otherFees.map((f, i) => (
            <label key={i}>
              {f.name}
              <MoneyInput className="mt-1" value={f.amount} onChange={(amount) => set({ otherFees: receipt.otherFees.map((x, j) => (j === i ? { ...x, amount } : x)) })} aria-label={f.name} />
            </label>
          ))}
          <label>
            Subtotal
            <MoneyInput className="mt-1" value={receipt.subtotal} onChange={(subtotal) => set({ subtotal })} aria-label="Subtotal" />
          </label>
          <label>
            Promo
            <MoneyInput className="mt-1" value={receipt.promo} onChange={(promo) => set({ promo })} aria-label="Promo" />
          </label>
          <label>
            Ongkir
            <MoneyInput className="mt-1" value={receipt.deliveryFee} onChange={(deliveryFee) => set({ deliveryFee })} aria-label="Ongkir" />
          </label>
          <label>
            Total
            <MoneyInput className="mt-1" value={receipt.total} onChange={(total) => set({ total })} aria-label="Total" />
          </label>
        </div>
        {receipt.cashbackPct ? (
          <p className="text-sm text-muted">
            Cashback {receipt.cashbackPct}%{receipt.cashbackMax ? ` maks ${formatRp(receipt.cashbackMax)}` : ''} akan dibagi ke semua orang.
          </p>
        ) : null}

        <button type="button" className="btn-primary w-full" disabled={receipt.items.length === 0} onClick={apply}>
          Pakai hasil ini, lalu bagi item
        </button>
      </section>
    )
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="Pilih gambar struk"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) upload(file)
        }}
      />
      <button
        type="button"
        disabled={status === 'reading'}
        onClick={() => input.current?.click()}
        className={`card relative flex w-full items-center gap-3 overflow-hidden p-4 text-left transition-colors hover:border-accent/50 ${status === 'reading' ? 'anim-shimmer' : ''}`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-onAccent">
          <Camera size={20} />
        </span>
        <span>
          <span className="block font-medium">{status === 'reading' ? 'Membaca struk…' : bill.items.length ? 'Scan ulang (ganti pesanan)' : 'Scan struk'}</span>
          <span className="block text-sm text-muted">Screenshot struk dari aplikasi Kopi Kenangan</span>
        </span>
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  )
}
