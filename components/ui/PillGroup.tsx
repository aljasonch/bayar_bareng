'use client'

export type PillOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: readonly PillOption<T>[]
  value: T
  onChange: (value: T) => void
  variant?: 'solid' | 'soft'
  size?: 'md' | 'sm'
}

/** Single-select pill group shared across menu options and promo selectors. */
export default function PillGroup<T extends string>({ options, value, onChange, variant = 'solid', size = 'md' }: Props<T>) {
  const activeClass = variant === 'soft' ? 'pill-soft' : 'pill-active'
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`pill ${size === 'sm' ? 'pill-sm' : ''} ${active ? activeClass : ''}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
