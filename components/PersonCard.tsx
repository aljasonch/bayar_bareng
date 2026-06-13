'use client'

import { Person, Item } from '@/types'
import { getPersonColor } from '@/lib/colors'
import { formatRp } from '@/lib/item-display'
import { IoCloseOutline, IoAddOutline, IoTrashOutline } from 'react-icons/io5'

interface PersonCardProps {
  person: Person
  index: number
  onUpdate: (person: Person) => void
  onRemove: () => void
  canRemove: boolean
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export default function PersonCard({ person, index, onUpdate, onRemove, canRemove }: PersonCardProps) {
  const subtotal = person.items.reduce((s, i) => s + i.price, 0)
  const color = getPersonColor(index)

  const updateName = (name: string) => onUpdate({ ...person, profileId: undefined, name })

  const addItem = () => {
    onUpdate({
      ...person,
      items: [...person.items, { id: generateId(), name: '', price: 0 }],
    })
  }

  const updateItem = (itemId: string, field: keyof Item, value: string | number) => {
    onUpdate({
      ...person,
      items: person.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
    })
  }

  const removeItem = (itemId: string) => {
    onUpdate({ ...person, items: person.items.filter((i) => i.id !== itemId) })
  }

  return (
    <article className="animate-fade-in card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: color.base }}
          >
            {person.name ? person.name.charAt(0).toUpperCase() : index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={person.name}
              onChange={(e) => updateName(e.target.value)}
              placeholder={`Person ${index + 1}`}
              className="w-full min-w-0 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-faint sm:text-lg"
            />
            <p className="mt-0.5 text-xs text-muted">
              {person.profileId ? 'Saved profile' : 'One-off bill person'}
            </p>
          </div>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="icon-button self-start hover:text-danger"
            aria-label="Remove person"
          >
            <IoTrashOutline className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2.5 px-4 py-4 sm:px-5">
        {person.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line2 bg-surface2/50 py-5 text-center">
            <p className="text-sm text-muted">No items yet. Add the first item below.</p>
          </div>
        ) : (
          person.items.map((item, idx) => (
            <div key={item.id} className="animate-fade-in grid grid-cols-[minmax(0,1fr)_7.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                placeholder={`Item ${idx + 1}`}
                className="field min-w-0"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">Rp</span>
                <input
                  type="number"
                  value={item.price || ''}
                  onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                  placeholder="0"
                  className="field field-mono text-right pl-9"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="icon-button hover:text-danger"
                aria-label="Remove item"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line bg-surface2/60 px-4 py-3 sm:px-5">
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-75"
          style={{ color: color.base }}
        >
          <IoAddOutline className="w-4 h-4" />
          Add item
        </button>
        <span className="text-sm text-muted">
          Subtotal <span className="ml-1 font-mono font-semibold text-ink">{formatRp(subtotal)}</span>
        </span>
      </div>
    </article>
  )
}
