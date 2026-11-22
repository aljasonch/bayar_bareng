'use client'

import { useState } from 'react'
import { errorText, removeDoc, saveDoc, useCollection } from '@/lib/admin/firestore'
import { formatRp } from '@/lib/money'
import MoneyInput from '@/components/ui/MoneyInput'
import type { Category, MenuItem, Size } from '@/lib/types'

const SIZES: Size[] = ['R', 'L', 'J']
const FLAGS = [
  ['hasOneLiter', '1 liter'],
  ['isBaristaChoice', 'Barista choice'],
  ['isNew', 'Baru'],
  ['isLimitedTime', 'Terbatas'],
] as const

export default function MenuPage() {
  const menu = useCollection<MenuItem>('menuItems')
  const cats = useCollection<Category>('categories')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState<MenuItem | null>(null)
  const [message, setMessage] = useState('')

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

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    if (Object.keys(form.prices).length === 0) return setMessage('Isi minimal satu harga ukuran.')
    try {
      await saveDoc('menuItems', form.id || undefined, { ...form, name: form.name.trim() })
      setForm(null)
      setMessage('')
      menu.reload()
    } catch (err) {
      setMessage(errorText(err))
    }
  }

  async function remove(m: MenuItem) {
    if (!window.confirm(`Hapus menu "${m.name}"?`)) return
    try {
      await removeDoc('menuItems', m.id)
      menu.reload()
    } catch (err) {
      setMessage(errorText(err))
    }
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
      {(menu.error || message) && <p className="text-sm text-danger">{menu.error || message}</p>}

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
              <label key={s} className="text-sm text-muted">
                Harga {s}
                <MoneyInput className="mt-1" value={form.prices[s] ?? 0} onChange={(v) => setPrice(s, v)} placeholder="kosong" aria-label={`Harga ${s}`} />
              </label>
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
              <button type="button" className="btn-ghost min-h-9 px-2" onClick={() => setForm(m)}>Ubah</button>
              <button type="button" className="btn-ghost min-h-9 px-2 text-danger" onClick={() => remove(m)}>Hapus</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
