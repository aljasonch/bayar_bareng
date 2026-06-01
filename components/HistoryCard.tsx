'use client'

import { BillResult } from '@/types'
import { formatBillDate } from '@/lib/date'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp } from '@/lib/item-display'
import { getPersonColor } from '@/lib/colors'
import { IoTrashOutline } from 'react-icons/io5'

interface HistoryCardProps {
  result: BillResult
  onDelete: (id: string) => void
  onView: (result: BillResult) => void
  active?: boolean
}

export default function HistoryCard({ result, onDelete, onView, active }: HistoryCardProps) {
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
      className={`card p-4 sm:p-5 transition-all cursor-pointer animate-fade-in group ${
        active ? 'border-ink ring-1 ring-ink' : 'hover:border-line2'
      }`}
      onClick={() => onView(result)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted font-mono">Split: {formattedSplitDate}</p>
          <p className="text-[11px] text-faint font-mono mt-0.5">Saved {formattedSavedTime}</p>
          <p className="text-sm text-ink2 mt-1">
            {result.people.length} {result.people.length === 1 ? 'person' : 'people'}
          </p>
          {result.billMode === 'kopiKenangan' && (
            <p className="text-xs text-accent mt-1 font-medium">
              Kopi Kenangan - {formatOutletName(result.kopiKenanganOutlet)}
            </p>
          )}
          {result.payerName && (
            <p className="text-xs text-muted mt-1">
              Talangan: <span className="text-ink2">{result.payerName}</span>
              {result.payerAccountNumber ? ` - ${result.payerAccountNumber}` : ''}
            </p>
          )}
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation()
            onDelete(result.id)
          }}
          className="text-faint2 hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-dangerSoft opacity-0 group-hover:opacity-100"
          aria-label="Delete entry"
        >
          <IoTrashOutline className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex -space-x-2">
          {result.people.slice(0, 4).map((person, index) => (
            <div
              key={person.id}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
              style={{ backgroundColor: getPersonColor(index).base }}
              title={person.name}
            >
              {person.name ? person.name[0].toUpperCase() : index + 1}
            </div>
          ))}
          {result.people.length > 4 && (
            <div className="w-7 h-7 rounded-md bg-surface flex items-center justify-center text-[10px] font-bold text-ink3 border-2 border-white">
              +{result.people.length - 4}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-ink">{formatRp(result.totalFinal)}</p>
          {result.totalSaved > 0 && (
            <p className="font-mono text-xs text-accent">Saved {formatRp(result.totalSaved)}</p>
          )}
        </div>
      </div>

      {result.totalFinal > 0 && result.results.length > 0 && (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-surface">
          {result.results
            .filter((r) => r.final > 0)
            .map((r, i) => (
              <div
                key={r.person.id}
                className="h-full"
                style={{
                  width: `${(r.final / result.totalFinal) * 100}%`,
                  backgroundColor: getPersonColor(i).base,
                  borderRight: '1.5px solid rgb(var(--color-white) / 1)',
                }}
              />
            ))}
        </div>
      )}
    </div>
  )
}
