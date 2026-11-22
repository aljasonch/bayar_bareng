'use client'

import { useState } from 'react'
import { errorText, removeDoc, saveDoc, useCollection } from '@/lib/admin/firestore'
import { newId } from '@/lib/bill/reducer'
import { formatRp } from '@/lib/money'
import MoneyInput from '@/components/ui/MoneyInput'
import type { Modifier, ModifierGroup, ModifierType } from '@/lib/types'

const TYPES: ModifierType[] = ['upgrade', 'syrup', 'addon']

export default function ModifiersPage() {
  const { items: groups, loading, error, reload } = useCollection<ModifierGroup>('modifierGroups')
  const [groupName, setGroupName] = useState('')
  const [editing, setEditing] = useState<{ groupId: string; mod: Modifier } | null>(null)
  const [message, setMessage] = useState('')

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn()
      setMessage('')
      reload()
    } catch (err) {
      setMessage(errorText(err))
    }
  }

  // Modifiers live inside their group document, so every edit rewrites the group's array.
  const writeMods = (g: ModifierGroup, modifiers: Modifier[]) => saveDoc('modifierGroups', g.id, { ...g, modifiers })

  function saveMod(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const g = groups.find((x) => x.id === editing.groupId)
    if (!g) return
    const exists = g.modifiers.some((m) => m.id === editing.mod.id)
    const mods = exists ? g.modifiers.map((m) => (m.id === editing.mod.id ? editing.mod : m)) : [...g.modifiers, editing.mod]
    run(async () => {
      await writeMods(g, mods)
      setEditing(null)
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Modifier</h1>
      {(error || message) && <p className="text-sm text-danger">{error || message}</p>}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          run(async () => {
            await saveDoc('modifierGroups', undefined, { name: groupName.trim(), sortOrder: groups.length, modifiers: [] })
            setGroupName('')
          })
        }}
      >
        <input className="field" placeholder="Nama grup baru" aria-label="Nama grup baru" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
        <button className="btn-primary shrink-0">Tambah grup</button>
      </form>

      {loading && <p className="text-sm text-muted">Memuat…</p>}
      {groups.map((g) => (
        <section key={g.id} className="card p-4">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 font-semibold">{g.name}</h2>
            <button
              type="button"
              className="btn-ghost min-h-9 px-2"
              onClick={() => setEditing({ groupId: g.id, mod: { id: newId(), name: '', type: 'addon', price: 0, sortOrder: g.modifiers.length } })}
            >
              Tambah modifier
            </button>
            <button
              type="button"
              className="btn-ghost min-h-9 px-2 text-danger"
              onClick={() => window.confirm(`Hapus grup "${g.name}" beserta semua modifiernya?`) && run(() => removeDoc('modifierGroups', g.id))}
            >
              Hapus grup
            </button>
          </div>

          {editing?.groupId === g.id && (
            <form onSubmit={saveMod} className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem_9rem_auto]">
              <input className="field" placeholder="Nama" aria-label="Nama modifier" value={editing.mod.name} onChange={(e) => setEditing({ ...editing, mod: { ...editing.mod, name: e.target.value } })} required />
              <select className="field" aria-label="Tipe" value={editing.mod.type} onChange={(e) => setEditing({ ...editing, mod: { ...editing.mod, type: e.target.value as ModifierType } })}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <MoneyInput aria-label="Harga" value={editing.mod.price} onChange={(price) => setEditing({ ...editing, mod: { ...editing.mod, price } })} />
              <div className="flex gap-2">
                <button className="btn-primary">Simpan</button>
                <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Batal</button>
              </div>
            </form>
          )}

          <ul className="mt-2 divide-y divide-line">
            {g.modifiers.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="flex-1">{m.name}</span>
                <span className="text-muted">{m.type}</span>
                <span className="num w-24 text-right">{formatRp(m.price)}</span>
                <button type="button" className="btn-ghost min-h-8 px-2" onClick={() => setEditing({ groupId: g.id, mod: m })}>Ubah</button>
                <button
                  type="button"
                  className="btn-ghost min-h-8 px-2 text-danger"
                  onClick={() => window.confirm(`Hapus "${m.name}"?`) && run(() => writeMods(g, g.modifiers.filter((x) => x.id !== m.id)))}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
