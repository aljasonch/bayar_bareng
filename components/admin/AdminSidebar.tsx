'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Coffee,
  Sliders,
  Store,
  LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import BilbilLogo from '@/components/BilbilLogo'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kategori', href: '/admin/categories', icon: FolderOpen },
  { label: 'Menu Items', href: '/admin/menu', icon: Coffee },
  { label: 'Modifiers', href: '/admin/modifiers', icon: Sliders },
  { label: 'Outlet Config', href: '/admin/outlet', icon: Store },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isLinkActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-ink text-paper flex flex-col justify-between shrink-0 min-h-screen border-r border-ink2/20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-ink2/30 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-paper/10 text-paper">
            <BilbilLogo className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider text-paper uppercase">
              Bilbil
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isLinkActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs tracking-wider uppercase transition-colors ${
                  active
                    ? 'bg-paper/15 text-paper font-semibold shadow-sm'
                    : 'text-faint hover:text-paper hover:bg-paper/5'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-ink2/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs tracking-wider uppercase text-faint hover:text-stamp hover:bg-stamp/10 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
