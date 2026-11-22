'use client'

type Props = {
  value: number
  onChange: (value: number) => void
  id?: string
  placeholder?: string
  className?: string
  'aria-label'?: string
}

/** Integer rupiah input that shows id-ID grouping while typing. */
export default function MoneyInput({ value, onChange, className = '', ...rest }: Props) {
  return (
    <input
      {...rest}
      inputMode="numeric"
      value={value ? value.toLocaleString('id-ID') : ''}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
      className={`field num ${className}`}
    />
  )
}
