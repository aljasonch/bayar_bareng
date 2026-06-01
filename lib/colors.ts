// Per-person color system for the split visualization.
// The RGB values live in app/globals.css so the app palette stays centralized.

export type PersonColor = {
  name: string
  /** Solid swatch for bars, dots, avatars. */
  base: string
  /** Soft tint used as a background behind base. */
  soft: string
}

const personColor = (name: string): PersonColor => ({
  name,
  base: `rgb(var(--color-person-${name}) / 1)`,
  soft: `rgb(var(--color-person-${name}-soft) / 1)`,
})

export const PERSON_PALETTE: PersonColor[] = [
  personColor('pine'),
  personColor('clay'),
  personColor('ochre'),
  personColor('slate'),
  personColor('teal'),
  personColor('sand'),
  personColor('rust'),
  personColor('moss'),
  personColor('denim'),
  personColor('stone'),
]

/** Stable color for a person by their index in the list. */
export function getPersonColor(index: number): PersonColor {
  return PERSON_PALETTE[index % PERSON_PALETTE.length]
}
