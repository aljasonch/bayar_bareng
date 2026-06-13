'use client'

import { FormEvent, useState } from 'react'
import { Person, PersonProfile } from '@/types'
import { IoAdd, IoCheckmark, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

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
          <p className="label">Saved people</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">People roster</h2>
          <p className="mt-1 text-sm text-muted">Save names once, then reuse them for every split.</p>
        </div>
        <button
          type="button"
          onClick={onAddManualPerson}
          className="button-secondary hidden sm:inline-flex"
        >
          One-off person
        </button>
      </div>

      <form onSubmit={submitNewProfile} className="mt-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Add a saved name"
          className="field"
        />
        <button type="submit" disabled={!newName.trim()} className="button-primary disabled:opacity-40 disabled:cursor-not-allowed">
          <IoAdd className="h-4 w-4" />
          Save name
        </button>
      </form>

      <button type="button" onClick={onAddManualPerson} className="button-secondary mt-3 w-full justify-center sm:hidden">
        One-off person
      </button>

      <div className="mt-4 space-y-2">
        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line2 bg-surface2/60 px-4 py-5 text-sm text-muted">
            No saved people yet. Add a name above to build your roster.
          </div>
        ) : (
          profiles.map((profile) => {
            const isActive = activeProfileIds.has(profile.id)
            const isEditing = editingId === profile.id

            return (
              <div key={profile.id} className="rounded-2xl border border-line bg-white px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
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
                      className="field h-10 flex-1"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddProfileToSplit(profile)}
                      disabled={isActive}
                      className="min-w-0 flex-1 text-left disabled:cursor-default"
                    >
                      <span className="block truncate text-sm font-semibold text-ink">{profile.name}</span>
                      <span className="block text-xs text-muted">
                        {isActive ? 'Already in this split' : 'Tap to add to split'}
                      </span>
                    </button>
                  )}

                  <div className="flex shrink-0 items-center gap-1">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={saveEditing}
                        disabled={!editingName.trim()}
                        className="icon-button text-accent disabled:opacity-40"
                        aria-label="Save name"
                      >
                        <IoCheckmark className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(profile)}
                        className="icon-button"
                        aria-label="Rename saved person"
                      >
                        <IoCreateOutline className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteProfile(profile.id)}
                      className="icon-button hover:text-danger"
                      aria-label="Delete saved person"
                    >
                      <IoTrashOutline className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
