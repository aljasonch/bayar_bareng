'use client'

import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

/** A collection ordered by sortOrder, with reload() to call after writes. */
export function useCollection<T extends { id: string }>(name: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, name), orderBy('sortOrder')))
      setItems(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T))
      setError('')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, loading, error, reload }
}

/** Create (no id) or overwrite (id) a document. The id field itself is never stored. */
export async function saveDoc(name: string, id: string | undefined, data: Record<string, unknown>) {
  const rest = { ...data }
  delete rest.id
  if (id) await setDoc(doc(db, name, id), rest)
  else await addDoc(collection(db, name), rest)
}

export function removeDoc(name: string, id: string) {
  return deleteDoc(doc(db, name, id))
}

export function errorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  return msg.includes('permission') ? 'Akun ini tidak punya izin mengubah data.' : msg
}
