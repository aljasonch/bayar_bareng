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
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-ink">Split distribution</h3>
        <span className="text-xs text-faint">{segments.length} paying</span>
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

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
        {segments.map((s) => (
          <div key={s.id} className="flex items-center gap-2 min-w-0">
            <span
              className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color.base }}
            />
            <span className="text-xs text-ink3 truncate flex-1">{s.name}</span>
            <span className="text-xs font-mono text-faint flex-shrink-0">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
