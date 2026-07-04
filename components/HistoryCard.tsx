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
      className={`card group animate-fade-in cursor-pointer p-4 transition-colors sm:p-5 ${
        active ? 'border-ink' : 'hover:border-ink'
      }`}
      onClick={() => onView(result)}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink">
            {formattedSplitDate}
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            disimpan {formattedSavedTime}
          </p>
          <p className="mt-2 text-sm text-ink2">{result.people.length} orang</p>
          {result.billMode === 'kopiKenangan' && (
            <p className="mt-0.5 text-xs text-muted">
              Kopi Kenangan · {formatOutletName(result.kopiKenanganOutlet)}
            </p>
          )}
          {result.payerName && (
            <p className="mt-0.5 text-xs text-muted">
              Talangan: <span className="text-ink2">{result.payerName}</span>
              {result.payerAccountNumber ? ` · ${result.payerAccountNumber}` : ''}
            </p>
          )}
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation()
            onDelete(result.id)
          }}
          className="icon-button opacity-100 hover:text-stamp sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Hapus nota"
        >
          <IoTrashOutline className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex gap-1">
          {result.people.slice(0, 4).map((person, index) => (
            <div
              key={person.id}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-[10px] font-semibold text-white"
              style={{ backgroundColor: getPersonColor(index).base }}
              title={person.name}
            >
              {person.name ? person.name[0].toUpperCase() : index + 1}
            </div>
          ))}
          {result.people.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-paper2 font-mono text-[10px] font-semibold text-ink3">
              +{result.people.length - 4}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-ink">{formatRp(result.totalFinal)}</p>
          {result.totalSaved > 0 && (
            <p className="font-mono text-xs text-stamp">hemat {formatRp(result.totalSaved)}</p>
          )}
        </div>
      </div>

      {result.totalFinal > 0 && result.results.length > 0 && (
        <div className="mt-3 flex h-1 w-full overflow-hidden bg-paper2">
          {result.results
            .filter((r) => r.final > 0)
            .map((r, i) => (
              <div
                key={r.person.id}
                className="h-full"
                style={{
                  width: `${(r.final / result.totalFinal) * 100}%`,
                  backgroundColor: getPersonColor(i).base,
                  borderRight: '1.5px solid rgb(var(--color-paper) / 1)',
                }}
              />
            ))}
        </div>
      )}
    </article>
  )
}
