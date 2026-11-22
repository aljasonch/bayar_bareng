'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

const LINKS = [
  { href: '/admin', label: 'Ringkasan' },
  { href: '/admin/menu', label: 'Menu' },
  { href: '/admin/categories', label: 'Kategori' },
  { href: '/admin/modifiers', label: 'Modifier' },
  { href: '/admin/combos', label: 'Combo promo' },
  { href: '/admin/outlet', label: 'Outlet' },
]

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-line pb-3 md:flex-col md:items-stretch md:border-b-0 md:border-r md:pb-0 md:pr-4">
      <Link href="/" className="mr-3 font-semibold md:mb-4">Bilbil admin</Link>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-xl px-3 py-2 text-sm ${pathname === l.href ? 'bg-accentSoft font-medium text-accent' : 'text-muted hover:text-ink'}`}
        >
          {l.label}
        </Link>
      ))}
      <div className="text-xs text-muted md:mt-6 md:px-3">{email}</div>
      <button type="button" className="btn-ghost min-h-9 justify-start px-3" onClick={() => signOut(auth)}>
        Keluar
      </button>
    </nav>
  )
}
