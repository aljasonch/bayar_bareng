'use client'

import { useState } from 'react'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { removeDoc, saveDoc, useCollection } from '@/lib/admin/firestore'
import type { Category } from '@/lib/types'

const EMPTY = { id: '', name: '', sortOrder: 0 }

export default function CategoriesPage() {
  const { items, loading, error, setError, run } = useCollection<Category>('categories')
  const [form, setForm] = useState<Category | null>(null)

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    run(async () => {
      await saveDoc('categories', form.id || undefined, { name: form.name.trim(), sortOrder: form.sortOrder })
      setForm(null)
    })
  }

  async function remove(c: Category) {
    const used = await getCountFromServer(query(collection(db, 'menuItems'), where('categoryId', '==', c.id)))
    if (used.data().count > 0) return setError(`"${c.name}" masih dipakai ${used.data().count} menu. Pindahkan menunya dulu.`)
    if (!window.confirm(`Hapus kategori "${c.name}"?`)) return
    run(() => removeDoc('categories', c.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kategori</h1>
        <button type="button" className="btn-primary" onClick={() => setForm({ ...EMPTY, sortOrder: items.length })}>
          Tambah kategori
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}

      {form && (
        <form onSubmit={save} className="card grid gap-3 p-4 sm:grid-cols-[1fr_8rem_auto]">
          <input className="field" placeholder="Nama kategori" aria-label="Nama kategori" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="field num" type="number" aria-label="Urutan" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
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
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <span className="num w-8 text-sm text-muted">{c.sortOrder}</span>
              <span className="flex-1">{c.name}</span>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setForm(c)}>Ubah</button>
              <button type="button" className="btn-ghost btn-sm text-danger" onClick={() => remove(c)}>Hapus</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
