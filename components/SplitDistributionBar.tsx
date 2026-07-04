'use client'

import { PersonResult } from '@/types'
import { getPersonColor } from '@/lib/colors'
import { formatRp } from '@/lib/item-display'

interface SplitDistributionBarProps {
  results: PersonResult[]
  total: number
}

/**
 * Horizontal stacked bar showing each person's share of the total, with a
 * compact legend. Flat solid colors only.
 */
export default function SplitDistributionBar({ results, total }: SplitDistributionBarProps) {
  if (total <= 0) return null

  const segments = results
    .map((r, i) => ({
      id: r.person.id,
      name: r.person.name || `Orang ${i + 1}`,
      value: r.final,
      pct: (r.final / total) * 100,
      color: getPersonColor(i),
    }))
    .filter((s) => s.value > 0)

  if (segments.length === 0) return null

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="label">Porsi</p>
          <h3 className="mt-1 text-base font-semibold text-ink">Bagian tiap orang</h3>
        </div>
        <span className="font-mono text-xs text-muted">{segments.length} bayar</span>
      </div>

      <div className="flex h-3 w-full overflow-hidden bg-paper2">
        {segments.map((s, i) => (
          <div
            key={s.id}
            className="h-full animate-grow-bar"
            style={{
              width: `${s.pct}%`,
              backgroundColor: s.color.base,
              animationDelay: `${i * 60}ms`,
              borderRight: i < segments.length - 1 ? '2px solid rgb(var(--color-paper) / 1)' : undefined,
            }}
            title={`${s.name}: ${formatRp(s.value)} (${s.pct.toFixed(0)}%)`}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((s) => (
          <div key={s.id} className="flex min-w-0 items-baseline gap-2">
            <span
              className="h-2 w-2 flex-shrink-0 self-center"
              style={{ backgroundColor: s.color.base }}
            />
            <span className="flex-1 truncate text-xs text-ink3">{s.name}</span>
            <span className="flex-shrink-0 font-mono text-xs text-muted">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </section>
  )
}
