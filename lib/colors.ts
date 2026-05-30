// Per-person color system for the split visualization.
// Muted, solid tones only (no gradients). Applied via inline styles since
// Tailwind can't generate dynamic class names.

export type PersonColor = {
  name: string
  /** Solid swatch for bars, dots, avatars. */
  base: string
  /** Soft tint used as a background behind base. */
  soft: string
}

export const PERSON_PALETTE: PersonColor[] = [
  { name: 'pine', base: '#4E6A5A', soft: '#E5EBE6' },
  { name: 'clay', base: '#A8674A', soft: '#F1E3DB' },
  { name: 'ochre', base: '#B08A3F', soft: '#F0E8D4' },
  { name: 'slate', base: '#5E6B79', soft: '#E4E7EB' },
  { name: 'plum', base: '#7E5A6E', soft: '#EBE2E8' },
  { name: 'teal', base: '#3F7C77', soft: '#DDEAE9' },
  { name: 'sand', base: '#9A8C6B', soft: '#EDE9DE' },
  { name: 'rust', base: '#9C5547', soft: '#EFE0DC' },
  { name: 'moss', base: '#6E7A4B', soft: '#E8EADD' },
  { name: 'denim', base: '#566A86', soft: '#E2E6EC' },
]

/** Stable color for a person by their index in the list. */
export function getPersonColor(index: number): PersonColor {
  return PERSON_PALETTE[index % PERSON_PALETTE.length]
}

/** rgba helper for translucent tints from a hex color. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
