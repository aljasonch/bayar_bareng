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
      name: r.person.name || `Person ${i + 1}`,
      value: r.final,
      pct: (r.final / total) * 100,
      color: getPersonColor(i),
    }))
    .filter((s) => s.value > 0)

  if (segments.length === 0) return null

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="label">Distribution</p>
          <h3 className="mt-1 text-base font-semibold text-ink">Share of total</h3>
        </div>
        <span className="rounded-full border border-line2 bg-white px-3 py-1 text-xs text-muted">
          {segments.length} paying
        </span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
        {segments.map((s, i) => (
          <div
            key={s.id}
            className="h-full animate-grow-bar"
            style={{
              width: `${s.pct}%`,
              backgroundColor: s.color.base,
              animationDelay: `${i * 60}ms`,
              borderRight: i < segments.length - 1 ? '2px solid rgb(var(--color-white) / 1)' : undefined,
            }}
            title={`${s.name}: ${formatRp(s.value)} (${s.pct.toFixed(0)}%)`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((s) => (
          <div key={s.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-white/70 px-3 py-2">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
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
