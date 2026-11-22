import { newId } from '@/lib/bill/reducer'
import type { Profile } from '@/lib/types'

const KEY = 'bilbil-people-profiles'

export const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ')

export function getProfiles(): Profile[] {
  if (typeof window === 'undefined') return []
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return []
      const { id, name } = entry as Record<string, unknown>
      const clean = typeof name === 'string' ? normalizeName(name) : ''
      return clean ? [{ id: typeof id === 'string' ? id : newId(), name: clean }] : []
    })
  } catch {
    return []
  }
}

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(KEY, JSON.stringify(profiles))
}
