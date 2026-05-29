'use client'

import { BillResult } from '@/types'
import { formatBillDate } from '@/lib/date'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp } from '@/lib/item-display'

interface HistoryCardProps {
  result: BillResult
  onDelete: (id: string) => void
  onView: (result: BillResult) => void
}

export default function HistoryCard({ result, onDelete, onView }: HistoryCardProps) {
  const formattedSplitDate = formatBillDate(result, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const formattedSavedTime = new Date(result.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 transition-all duration-200 hover:border-brand/40 cursor-pointer animate-fade-in group"
      onClick={() => onView(result)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 font-mono">Split: {formattedSplitDate}</p>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">Saved {formattedSavedTime}</p>
          <p className="text-sm text-zinc-300 mt-1">
            {result.people.length} {result.people.length === 1 ? 'person' : 'people'}
          </p>
          {result.billMode === 'kopiKenangan' && (
            <p className="text-xs text-brand mt-1">
              Kopi Kenangan - {formatOutletName(result.kopiKenanganOutlet)}
            </p>
          )}
          {result.payerName && (
            <p className="text-xs text-zinc-500 mt-1">
              Talangan: <span className="text-zinc-300">{result.payerName}</span>
              {result.payerAccountNumber ? ` - ${result.payerAccountNumber}` : ''}
            </p>
          )}
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation()
            onDelete(result.id)
          }}
          className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100 text-sm"
          aria-label="Delete entry"
        >
          Delete
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex -space-x-2">
          {result.people.slice(0, 4).map((person, index) => (
            <div
              key={person.id}
              className="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-950"
              title={person.name}
            >
              {person.name ? person.name[0].toUpperCase() : index + 1}
            </div>
          ))}
          {result.people.length > 4 && (
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 border-2 border-zinc-950">
              +{result.people.length - 4}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-brand">
            {formatRp(result.totalFinal)}
          </p>
          {result.totalSaved > 0 && (
            <p className="font-mono text-xs text-teal-400">
              Saved {formatRp(result.totalSaved)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
