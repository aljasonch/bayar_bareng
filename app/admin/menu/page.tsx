'use client'

import { useState } from 'react'
import { removeDoc, saveDoc, useCollection } from '@/lib/admin/firestore'
import { formatRp } from '@/lib/money'
import MoneyInput from '@/components/ui/MoneyInput'
import type { Category, MenuItem, Size } from '@/lib/types'

const SIZES: Size[] = ['R', 'L', 'J']
const FLAGS = [
  ['isBaristaChoice', 'Barista choice'],
  ['isNew', 'Baru'],
  ['isLimitedTime', 'Terbatas'],
] as const

export default function MenuPage() {
  const menu = useCollection<MenuItem>('menuItems')
  const cats = useCollection<Category>('categories')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState<MenuItem | null>(null)

  const catName = (id: string) => cats.items.find((c) => c.id === id)?.name ?? '—'
  const shown = filter ? menu.items.filter((m) => m.categoryId === filter) : menu.items

  function blank(): MenuItem {
    return { id: '', name: '', categoryId: filter || cats.items[0]?.id || '', prices: {}, sortOrder: menu.items.length }
  }

  function setPrice(size: Size, value: number) {
    if (!form) return
    const prices = { ...form.prices }
    if (value > 0) prices[size] = value
    else delete prices[size]
    setForm({ ...form, prices })
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    if (Object.keys(form.prices).length === 0) return menu.setError('Isi minimal satu harga ukuran.')
    menu.run(async () => {
      await saveDoc('menuItems', form.id || undefined, { ...form, name: form.name.trim() })
      setForm(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <div className="flex gap-2">
          <select className="field w-auto" aria-label="Filter kategori" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Semua kategori</option>
            {cats.items.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={() => setForm(blank())}>Tambah menu</button>
        </div>
      </div>
      {menu.error && <p className="text-sm text-danger">{menu.error}</p>}

      {form && (
        <form onSubmit={save} className="card space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem_6rem]">
            <input className="field" placeholder="Nama menu" aria-label="Nama menu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="field" aria-label="Kategori" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              {cats.items.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input className="field num" type="number" aria-label="Urutan" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((s) => (
              <MoneyInput key={s} label={`Harga ${s}`} value={form.prices[s] ?? 0} onChange={(v) => setPrice(s, v)} placeholder="kosong" />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {FLAGS.map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={!!form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">Simpan</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}

      {menu.loading ? (
        <p className="text-sm text-muted">Memuat…</p>
      ) : (
        <ul className="card divide-y divide-line">
          {shown.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate">{m.name}</div>
                <div className="text-xs text-muted">{catName(m.categoryId)}</div>
              </div>
              <div className="num text-sm text-muted">
                {SIZES.filter((s) => m.prices[s] != null).map((s) => `${s} ${formatRp(m.prices[s]!)}`).join('  ')}
              </div>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setForm(m)}>Ubah</button>
              <button type="button" className="btn-ghost btn-sm text-danger" onClick={() => window.confirm(`Hapus menu "${m.name}"?`) && menu.run(() => removeDoc('menuItems', m.id))}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
