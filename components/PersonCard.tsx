'use client'

import { Person, Item } from '@/types'
import { HiOutlineTrash, HiOutlineXMark, HiOutlinePlus } from 'react-icons/hi2'

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

  const updateName = (name: string) => {
    onUpdate({ ...person, name })
  }

  const addItem = () => {
    onUpdate({
      ...person,
      items: [...person.items, { id: generateId(), name: '', price: 0 }],
    })
  }

  const updateItem = (itemId: string, field: keyof Item, value: string | number) => {
    onUpdate({
      ...person,
      items: person.items.map((i) =>
        i.id === itemId ? { ...i, [field]: value } : i
      ),
    })
  }

  const removeItem = (itemId: string) => {
    if (person.items.length <= 1) return
    onUpdate({
      ...person,
      items: person.items.filter((i) => i.id !== itemId),
    })
  }

  return (
    <div className="animate-fade-in rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 transition-all duration-200 hover:border-brand/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-lg shadow-brand/20">
            {index + 1}
          </div>
          <input
            type="text"
            value={person.name}
            onChange={(e) => updateName(e.target.value)}
            placeholder={`Person ${index + 1}`}
            className="bg-transparent text-lg sm:text-xl font-bold text-zinc-100 placeholder:text-zinc-600 outline-none border-b border-transparent focus:border-brand/50 transition-colors pb-1 w-full max-w-[200px]"
          />
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
            aria-label="Remove person"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {person.items.map((item, idx) => (
          <div key={item.id} className="flex gap-2 sm:gap-3 items-center animate-fade-in">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                placeholder={`Item ${idx + 1}`}
                className="w-full bg-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-700/50 focus:border-brand/50 transition-colors"
              />
            </div>
            <div className="w-28 sm:w-36 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
              <input
                type="number"
                value={item.price || ''}
                onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                placeholder="0"
                className="w-full bg-zinc-800/80 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-700/50 focus:border-brand/50 transition-colors text-right"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              disabled={person.items.length <= 1}
              className="text-zinc-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded-lg hover:bg-red-400/10 flex-shrink-0"
              aria-label="Remove item"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
        <button
          onClick={addItem}
          className="text-brand hover:text-orange-400 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Item
        </button>
        <span className="font-mono text-sm text-zinc-400">
          Subtotal: <span className="text-zinc-100 font-bold">Rp{subtotal.toLocaleString('id-ID')}</span>
        </span>
      </div>
    </div>
  )
}
