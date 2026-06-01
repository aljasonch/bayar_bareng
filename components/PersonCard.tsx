'use client'

import { Person, Item } from '@/types'
import { getPersonColor } from '@/lib/colors'
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

  const updateName = (name: string) => onUpdate({ ...person, name })

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
    <div className="animate-fade-in card overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-line">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ backgroundColor: color.base }}
          >
            {person.name ? person.name.charAt(0).toUpperCase() : index + 1}
          </div>
          <input
            type="text"
            value={person.name}
            onChange={(e) => updateName(e.target.value)}
            placeholder={`Person ${index + 1}`}
            className="bg-transparent text-base sm:text-lg font-bold text-ink placeholder:text-faint outline-none w-full min-w-0"
          />
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-faint hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-dangerSoft flex-shrink-0"
            aria-label="Remove person"
          >
            <IoTrashOutline className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Items */}
      <div className="px-4 sm:px-5 py-4 space-y-2.5">
        {person.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line2 py-5 text-center">
            <p className="text-sm text-faint">No items yet. Add the first one below.</p>
          </div>
        ) : (
          person.items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center animate-fade-in">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                placeholder={`Item ${idx + 1}`}
                className="field flex-1 min-w-0"
              />
              <div className="w-28 sm:w-36 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-xs font-mono">Rp</span>
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
                className="text-faint2 hover:text-danger transition-colors p-1 rounded-md hover:bg-dangerSoft flex-shrink-0"
                aria-label="Remove item"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-line bg-surface2/60">
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ color: color.base }}
        >
          <IoAddOutline className="w-4 h-4" />
          Add item
        </button>
        <span className="text-sm text-muted">
          Subtotal <span className="font-mono font-bold text-ink ml-1">Rp{subtotal.toLocaleString('id-ID')}</span>
        </span>
      </div>
    </div>
  )
}
