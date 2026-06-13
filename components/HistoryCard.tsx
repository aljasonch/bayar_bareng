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
    <article
      className={`card group cursor-pointer p-4 transition-all animate-fade-in sm:p-5 ${
        active ? 'border-ink ring-1 ring-ink/70' : 'hover:border-ink/20'
      }`}
      onClick={() => onView(result)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="label">{formattedSplitDate}</p>
          <p className="mt-1 text-[11px] text-muted">Saved {formattedSavedTime}</p>
          <p className="mt-2 text-sm font-medium text-ink2">
            {result.people.length} {result.people.length === 1 ? 'person' : 'people'}
          </p>
          {result.billMode === 'kopiKenangan' && (
            <p className="mt-1 text-xs font-medium text-muted">
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
          className="icon-button opacity-100 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Delete entry"
        >
          <IoTrashOutline className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex -space-x-2">
          {result.people.slice(0, 4).map((person, index) => (
            <div
              key={person.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
              style={{ backgroundColor: getPersonColor(index).base }}
              title={person.name}
            >
              {person.name ? person.name[0].toUpperCase() : index + 1}
            </div>
          ))}
          {result.people.length > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surface text-[10px] font-semibold text-ink3">
              +{result.people.length - 4}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-ink">{formatRp(result.totalFinal)}</p>
          {result.totalSaved > 0 && (
            <p className="font-mono text-xs text-muted">Saved {formatRp(result.totalSaved)}</p>
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
    </article>
  )
}
