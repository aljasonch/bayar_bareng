'use client'

import { Person, Item } from '@/types'
import { getPersonColor } from '@/lib/colors'
import { formatRp } from '@/lib/item-display'
import { IoCloseOutline, IoTrashOutline } from 'react-icons/io5'

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
      <div className="flex items-start gap-3 border-b border-rule px-4 py-3.5 sm:px-5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-sm font-semibold text-white"
          style={{ backgroundColor: color.base }}
        >
          {person.name ? person.name.charAt(0).toUpperCase() : index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={person.name}
            onChange={(e) => updateName(e.target.value)}
            placeholder={`Orang ${index + 1}`}
            className="field-line w-full min-w-0 border-transparent px-0 py-1 text-base font-semibold hover:border-rule2 sm:text-lg"
          />
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {person.profileId ? 'dari roster' : 'hanya nota ini'}
          </p>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="icon-button self-start hover:text-stamp"
            aria-label="Hapus orang ini"
          >
            <IoTrashOutline className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Entry lines, written against the red ledger margin. */}
      <div className="px-4 py-3 sm:px-5">
        <div className="border-l border-rule pl-3 sm:pl-4">
          {person.items.length === 0 ? (
            <p className="py-3 text-sm text-muted">Belum ada item. Tulis pesanan pertama di bawah.</p>
          ) : (
            <div className="space-y-1">
              {person.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="animate-fade-in grid grid-cols-[minmax(0,1fr)_7.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder={`Item ${idx + 1}`}
                    className="field-line min-w-0"
                  />
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xs text-faint">Rp</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={item.price || ''}
                      onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                      placeholder="0"
                      className="field-line field-mono min-w-0 text-right"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="icon-button h-8 w-8 hover:text-stamp"
                    aria-label="Hapus item"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 border-t border-rule bg-paper2 px-4 py-3 sm:px-5">
        <button
          onClick={addItem}
          className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-ink transition-opacity hover:opacity-70"
        >
          + Tambah item
        </button>
        <span className="font-mono text-xs text-muted">
          Subtotal <span className="ml-1 text-sm font-bold text-ink">{formatRp(subtotal)}</span>
        </span>
      </div>
    </article>
  )
}
