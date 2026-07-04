'use client'

import { FormEvent, useState } from 'react'
import { Person, PersonProfile } from '@/types'
import { IoCheckmark, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

interface PeopleProfilesProps {
  profiles: PersonProfile[]
  people: Person[]
  onCreateProfile: (name: string) => void
  onRenameProfile: (id: string, name: string) => void
  onDeleteProfile: (id: string) => void
  onAddProfileToSplit: (profile: PersonProfile) => void
  onAddManualPerson: () => void
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'P'
}

export default function PeopleProfiles({
  profiles,
  people,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  onAddProfileToSplit,
  onAddManualPerson,
}: PeopleProfilesProps) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const activeProfileIds = new Set(people.map((person) => person.profileId).filter(Boolean))

  const submitNewProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newName.trim()) return
    onCreateProfile(newName)
    setNewName('')
  }

  const startEditing = (profile: PersonProfile) => {
    setEditingId(profile.id)
    setEditingName(profile.name)
  }

  const saveEditing = () => {
    if (!editingId || !editingName.trim()) return
    onRenameProfile(editingId, editingName)
    setEditingId(null)
    setEditingName('')
  }

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">Roster</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">Nama langganan</h2>
          <p className="mt-1 text-sm text-muted">Simpan sekali, pakai di tiap patungan.</p>
        </div>
        <button
          type="button"
          onClick={onAddManualPerson}
          className="button-secondary hidden shrink-0 sm:inline-flex"
        >
          + Orang baru
        </button>
      </div>

      <form onSubmit={submitNewProfile} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Tulis nama baru"
          className="field"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simpan
        </button>
      </form>

      <button type="button" onClick={onAddManualPerson} className="button-secondary mt-3 w-full justify-center sm:hidden">
        + Orang baru (tanpa disimpan)
      </button>

      <div className="mt-4">
        {profiles.length === 0 ? (
          <div className="rounded-sm border border-dashed border-rule2 bg-paper2/60 px-4 py-5 text-sm text-muted">
            Roster masih kosong. Simpan nama teman nongkrongmu di atas, sekali saja.
          </div>
        ) : (
          <div className="divide-y divide-rule border-y border-rule">
            {profiles.map((profile) => {
              const isActive = activeProfileIds.has(profile.id)
              const isEditing = editingId === profile.id

              return (
                <div key={profile.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-ink text-xs font-semibold text-paper">
                    {getInitial(profile.name)}
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveEditing()
                        if (event.key === 'Escape') setEditingId(null)
                      }}
                      className="field h-9 flex-1 py-1.5"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddProfileToSplit(profile)}
                      disabled={isActive}
                      className="group flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left disabled:cursor-default"
                    >
                      <span className="truncate text-sm font-semibold text-ink">{profile.name}</span>
                      <span
                        className={`shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                          isActive ? 'text-faint' : 'text-ink3 group-hover:text-ink'
                        }`}
                      >
                        {isActive ? '✓ di nota' : '+ ikut'}
                      </span>
                    </button>
                  )}

                  <div className="flex shrink-0 items-center gap-0.5">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={saveEditing}
                        disabled={!editingName.trim()}
                        className="icon-button h-8 w-8 text-ink disabled:opacity-40"
                        aria-label="Simpan nama"
                      >
                        <IoCheckmark className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(profile)}
                        className="icon-button h-8 w-8"
                        aria-label="Ubah nama"
                      >
                        <IoCreateOutline className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteProfile(profile.id)}
                      className="icon-button h-8 w-8 hover:text-stamp"
                      aria-label="Hapus dari roster"
                    >
                      <IoTrashOutline className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
