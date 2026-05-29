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
  { name: 'indigo', base: '#5B4BE0', soft: '#EDEAFB' },
  { name: 'teal', base: '#0F9E8E', soft: '#CCF3EE' },
  { name: 'amber', base: '#E08A1E', soft: '#FCEBCF' },
  { name: 'rose', base: '#E0418A', soft: '#FBDCEC' },
  { name: 'sky', base: '#2D8FE0', soft: '#D6EAFB' },
  { name: 'violet', base: '#9B4BE0', soft: '#F0E2FB' },
  { name: 'green', base: '#3FA34D', soft: '#DBF1DE' },
  { name: 'coral', base: '#E0543C', soft: '#FBDFD9' },
  { name: 'cyan', base: '#0FA0B5', soft: '#CFF0F5' },
  { name: 'slate', base: '#5B6478', soft: '#E3E6ED' },
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
