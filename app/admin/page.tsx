'use client'

import { useEffect, useState } from 'react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

const ITEMS = [
  { name: 'menuItems', label: 'Menu' },
  { name: 'categories', label: 'Kategori' },
  { name: 'modifierGroups', label: 'Grup modifier' },
  { name: 'promoCombos', label: 'Combo promo' },
]

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    Promise.all(ITEMS.map(async (i) => [i.name, (await getCountFromServer(collection(db, i.name))).data().count] as const))
      .then((pairs) => setCounts(Object.fromEntries(pairs)))
      .catch(() => setCounts({}))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold">Ringkasan</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ITEMS.map((i) => (
          <div key={i.name} className="card p-4">
            <div className="num text-2xl">{counts[i.name] ?? '–'}</div>
            <div className="mt-1 text-sm text-muted">{i.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
