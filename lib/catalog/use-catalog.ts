'use client'

import { useEffect, useState } from 'react'
import { fetchCatalog, fetchPromoCombos } from '@/lib/catalog/firestore'
import type { Catalog, PromoCombo } from '@/lib/types'

type State = { catalog: Catalog | null; combos: PromoCombo[]; error: string }

/** Kopi Kenangan menu + promo combos from Firestore, with retry. */
export function useCatalog() {
  const [state, setState] = useState<State>({ catalog: null, combos: [], error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    // Firestore keeps retrying while offline; give up after 12s so the user sees a retry button.
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
    Promise.race([Promise.all([fetchCatalog(), fetchPromoCombos()]), timeout])
      .then(([catalog, combos]) => alive && setState({ catalog, combos, error: '' }))
      .catch(() => alive && setState((s) => ({ ...s, error: 'Menu gagal dimuat. Cek koneksi lalu coba lagi.' })))
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = () => {
    setState((s) => ({ ...s, error: '' }))
    setAttempt((n) => n + 1)
  }

  return { ...state, retry }
}
