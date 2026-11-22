import { getPersonColor } from '@/lib/colors'

type Props = {
  name: string
  index: number
  selected?: boolean
  showName?: boolean
  onClick?: () => void
  className?: string
}

/** Initial (or full name) in the person's stable color. Filled when selected. */
export default function PersonChip({ name, index, selected = true, showName, onClick, className = '' }: Props) {
  const color = getPersonColor(index)
  const label = showName ? name || 'Tanpa nama' : (name.trim()[0] ?? '?').toUpperCase()
  const style = selected
    ? { background: color.base, color: '#fff' }
    : { background: color.soft, color: color.base }
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      title={name}
      className={`chip ${showName ? 'px-3' : ''} ${className}`}
      style={style}
    >
      {label}
    </Tag>
  )
}
