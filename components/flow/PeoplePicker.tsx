'use client'

import { useState } from 'react'
import { Plus, Settings2, X } from 'lucide-react'
import PersonChip from '@/components/ui/PersonChip'
import { newId } from '@/lib/bill/reducer'
import { getProfiles, normalizeName, saveProfiles } from '@/lib/storage/profiles'
import type { FlowCtx } from '@/components/flow/SplitFlow'
import type { Profile } from '@/lib/types'

/** People on this bill, plus a saved roster (localStorage) for one-tap adding. */
export default function PeoplePicker({ bill, dispatch }: Pick<FlowCtx, 'bill' | 'dispatch'>) {
  const [roster, setRoster] = useState<Profile[]>(getProfiles)
  const [name, setName] = useState('')
  const [managing, setManaging] = useState(false)

  const persist = (next: Profile[]) => {
    setRoster(next)
    saveProfiles(next)
  }

  function add(rawName: string) {
    const clean = normalizeName(rawName)
    if (!clean) return
    let profile = roster.find((p) => p.name.toLowerCase() === clean.toLowerCase())
    if (!profile) {
      profile = { id: newId(), name: clean }
      persist([...roster, profile])
    }
    if (!bill.people.some((p) => p.profileId === profile!.id)) {
      dispatch({ type: 'addPerson', person: { id: newId(), name: profile.name, profileId: profile.id } })
    }
    setName('')
  }

  const available = roster.filter((p) => !bill.people.some((person) => person.profileId === p.id))

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Siapa saja yang ikut?</h2>
        {roster.length > 0 && (
          <button type="button" className="btn-ghost min-h-9 px-2 text-xs" onClick={() => setManaging(!managing)}>
            <Settings2 size={14} />
            {managing ? 'Selesai' : 'Atur daftar'}
          </button>
        )}
      </div>

      {bill.people.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {bill.people.map((p, i) => (
            <li key={p.id} className="anim-pop flex items-center gap-1 rounded-full bg-surface py-0.5 pl-0.5 pr-1 ring-1 ring-line">
              <PersonChip name={p.name} index={i} />
              <span className="text-sm">{p.name}</span>
              <button type="button" onClick={() => dispatch({ type: 'removePerson', id: p.id })} className="rounded-full p-1 text-muted hover:text-ink" aria-label={`Hapus ${p.name} dari nota`}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          add(name)
        }}
      >
        <input className="field" placeholder="Nama teman" aria-label="Nama teman" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-secondary shrink-0 px-4" disabled={!normalizeName(name)} aria-label="Tambah orang">
          <Plus size={18} />
        </button>
      </form>

      {available.length > 0 && !managing && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {available.map((p) => (
            <button key={p.id} type="button" onClick={() => add(p.name)} className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-ink">
              + {p.name}
            </button>
          ))}
        </div>
      )}

      {managing && (
        <ul className="card mt-3 divide-y divide-line">
          {roster.map((p) => (
            <li key={p.id} className="flex items-center gap-2 px-3 py-2">
              <input
                className="field border-transparent bg-transparent px-1 py-1"
                defaultValue={p.name}
                aria-label={`Ganti nama ${p.name}`}
                onBlur={(e) => {
                  const clean = normalizeName(e.target.value)
                  if (!clean || clean === p.name) return
                  persist(roster.map((r) => (r.id === p.id ? { ...r, name: clean } : r)))
                  bill.people.filter((person) => person.profileId === p.id).forEach((person) => dispatch({ type: 'renamePerson', id: person.id, name: clean }))
                }}
              />
              <button type="button" className="btn-ghost min-h-8 px-2 text-danger" onClick={() => persist(roster.filter((r) => r.id !== p.id))}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
