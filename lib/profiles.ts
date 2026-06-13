import { PersonProfile } from '@/types'

const STORAGE_KEY = 'bayar-bareng-people-profiles'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function sanitizeProfiles(value: unknown): PersonProfile[] {
  if (!Array.isArray(value)) return []

  return value
    .map((profile) => {
      if (!profile || typeof profile !== 'object') return null
      const record = profile as Record<string, unknown>
      const id = typeof record.id === 'string' ? record.id : generateId()
      const name = typeof record.name === 'string' ? normalizeName(record.name) : ''
      return name ? { id, name } : null
    })
    .filter((profile): profile is PersonProfile => profile !== null)
}

export function getProfiles(): PersonProfile[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return sanitizeProfiles(JSON.parse(raw))
  } catch {
    return []
  }
}

export function saveProfiles(profiles: PersonProfile[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeProfiles(profiles)))
}

export function createProfile(name: string): PersonProfile | null {
  const normalizedName = normalizeName(name)
  if (!normalizedName) return null

  return {
    id: generateId(),
    name: normalizedName,
  }
}
