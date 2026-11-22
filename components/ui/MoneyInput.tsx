'use client'

type Props = {
  value: number
  onChange: (value: number) => void
  label?: string
  id?: string
  placeholder?: string
  className?: string
  'aria-label'?: string
}

/** Integer rupiah input that shows id-ID grouping while typing. */
export default function MoneyInput({ value, onChange, label, className = '', ...rest }: Props) {
  const input = (
    <input
      {...rest}
      inputMode="numeric"
      value={value ? value.toLocaleString('id-ID') : ''}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
      className={`field num ${label ? 'mt-1' : ''} ${className}`}
    />
  )
  if (!label) return input
  return (
    <label className="block text-xs text-muted">
      {label}
      {input}
    </label>
  )
}
