'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'

type Gate =
  | { state: 'loading' }
  | { state: 'out' }
  | { state: 'notAdmin'; user: User }
  | { state: 'admin'; user: User }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [gate, setGate] = useState<Gate>({ state: 'loading' })
  const isLogin = pathname === '/admin/login'

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) return setGate({ state: 'out' })
        const marker = await getDoc(doc(db, 'admins', user.uid)).catch(() => null)
        setGate(marker?.exists() ? { state: 'admin', user } : { state: 'notAdmin', user })
      }),
    [],
  )

  useEffect(() => {
    if (gate.state === 'out' && !isLogin) router.replace('/admin/login')
    if (gate.state === 'admin' && isLogin) router.replace('/admin')
  }, [gate.state, isLogin, router])

  if (isLogin) return <>{children}</>

  return (
    <div className="px-5 py-6">
      {gate.state === 'loading' || gate.state === 'out' ? (
        <p className="text-sm text-muted">Memeriksa akun…</p>
      ) : gate.state === 'notAdmin' ? (
        <div className="card mx-auto max-w-sm p-6">
          <h1 className="font-semibold">Akun ini bukan admin</h1>
          <p className="mt-1 text-sm text-muted">{gate.user.email} belum terdaftar di koleksi admins.</p>
          <button type="button" className="btn-secondary mt-4" onClick={() => signOut(auth)}>
            Keluar
          </button>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[12rem_1fr]">
          <AdminSidebar email={gate.user.email ?? ''} />
          <main className="min-w-0">{children}</main>
        </div>
      )}
    </div>
  )
}
