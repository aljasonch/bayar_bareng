'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { errorText } from '@/lib/admin/firestore'
import { DEFAULT_OUTLET } from '@/lib/catalog/firestore'
import MoneyInput from '@/components/ui/MoneyInput'
import type { OutletConfig, Size } from '@/lib/types'

const SIZES: Size[] = ['R', 'L', 'J']

export default function OutletConfigPage() {
  const [config, setConfig] = useState<OutletConfig>(DEFAULT_OUTLET)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getDoc(doc(db, 'config', 'outlet'))
      .then((snap) => snap.exists() && setConfig({ ...DEFAULT_OUTLET, ...(snap.data() as Partial<OutletConfig>) }))
      .catch((e) => setMessage(errorText(e)))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    try {
      await setDoc(doc(db, 'config', 'outlet'), config)
      setMessage('Tersimpan.')
    } catch (err) {
      setMessage(errorText(err))
    }
  }

  function toggleSize(s: Size) {
    const has = config.availableSizes.includes(s)
    setConfig({ ...config, availableSizes: has ? config.availableSizes.filter((x) => x !== s) : SIZES.filter((x) => x === s || config.availableSizes.includes(x)) })
  }

  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Outlet</h1>
      <MoneyInput label="Tambahan harga per item di outlet mall" value={config.mallAdjustment} onChange={(mallAdjustment) => setConfig({ ...config, mallAdjustment })} />
      <fieldset>
        <legend className="text-sm text-muted">Ukuran yang tersedia</legend>
        <div className="mt-2 flex gap-4">
          {SIZES.map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input type="checkbox" checked={config.availableSizes.includes(s)} onChange={() => toggleSize(s)} />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      {message && <p className="text-sm text-muted">{message}</p>}
      <button className="btn-primary">Simpan</button>
    </form>
  )
}
