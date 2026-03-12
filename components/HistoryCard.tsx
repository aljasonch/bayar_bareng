'use client'

import { BillResult } from '@/types'
import { HiOutlineTrash } from 'react-icons/hi2'

interface HistoryCardProps {
  result: BillResult
  onDelete: (id: string) => void
  onView: (result: BillResult) => void
}

export default function HistoryCard({ result, onDelete, onView }: HistoryCardProps) {
  const date = new Date(result.createdAt)
  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 transition-all duration-200 hover:border-brand/30 cursor-pointer animate-fade-in group"
      onClick={() => onView(result)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 font-mono">{formattedDate} · {formattedTime}</p>
          <p className="text-sm text-zinc-300 mt-1">
            {result.people.length} {result.people.length === 1 ? 'person' : 'people'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(result.id)
          }}
          className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100"
          aria-label="Delete entry"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex -space-x-2">
          {result.people.slice(0, 4).map((p, i) => (
            <div
              key={p.id}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-900"
              title={p.name}
            >
              {p.name ? p.name[0].toUpperCase() : i + 1}
            </div>
          ))}
          {result.people.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 border-2 border-zinc-900">
              +{result.people.length - 4}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-brand">
            Rp{result.totalFinal.toLocaleString('id-ID')}
          </p>
          {result.totalSaved > 0 && (
            <p className="font-mono text-xs text-teal-400">
              Saved Rp{result.totalSaved.toLocaleString('id-ID')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
