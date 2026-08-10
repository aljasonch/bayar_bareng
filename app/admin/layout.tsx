'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // If current route is login, bypass layout shell and auth check
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }

    let isMounted = true

    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          if (isMounted) {
            setAuthenticated(false)
            router.push('/admin/login')
          }
        } else {
          if (isMounted) {
            setAuthenticated(true)
          }
        }
      } catch {
        if (isMounted) {
          setAuthenticated(false)
          router.push('/admin/login')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session && !isLoginPage) {
          setAuthenticated(false)
          router.push('/admin/login')
        } else if (session && !isLoginPage) {
          setAuthenticated(true)
        }
      }
    )

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [isLoginPage, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-counter flex flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-widest text-ink3">
          Memeriksa Autentikasi...
        </p>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-counter text-ink">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
