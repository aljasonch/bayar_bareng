'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import BilbilLogo from '@/components/BilbilLogo'
import {
  FolderOpen,
  Coffee,
  Sliders,
  Store,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

interface DashboardStats {
  categoriesCount: number
  menuItemsCount: number
  modifiersCount: number
  outletConfigCount: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    categoriesCount: 0,
    menuItemsCount: 0,
    modifiersCount: 0,
    outletConfigCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      const [
        { count: catCount },
        { count: menuCount },
        { count: modCount },
        { count: outletCount },
      ] = await Promise.all([
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('modifiers').select('*', { count: 'exact', head: true }),
        supabase.from('outlet_config').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        categoriesCount: catCount ?? 0,
        menuItemsCount: menuCount ?? 0,
        modifiersCount: modCount ?? 0,
        outletConfigCount: outletCount ?? 0,
      })
    } catch (err) {
      console.error('Gagal mengambil statistik:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  const statCards = [
    {
      title: 'Kategori Menu',
      count: stats.categoriesCount,
      label: 'Kategori terdaftar',
      href: '/admin/categories',
      icon: FolderOpen,
    },
    {
      title: 'Menu Items',
      count: stats.menuItemsCount,
      label: 'Item minuman & makanan',
      href: '/admin/menu',
      icon: Coffee,
    },
    {
      title: 'Modifiers',
      count: stats.modifiersCount,
      label: 'Varian & opsi tambahan',
      href: '/admin/modifiers',
      icon: Sliders,
    },
    {
      title: 'Outlet Config',
      count: stats.outletConfigCount,
      label: 'Pengaturan outlet & pajak',
      href: '/admin/outlet',
      icon: Store,
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-paper shadow-sm">
            <BilbilLogo className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-ink">
              Admin Panel
            </h1>
            <p className="font-sans text-xs text-muted">
              Ringkasan data menu & pengelolaan sistem Bilbil
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="button-secondary text-xs self-start sm:self-auto"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="card p-5 flex flex-col justify-between hover:border-ink/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="label">{card.title}</span>
                  <div className="p-2 rounded bg-paper2 text-ink">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="font-mono text-3xl font-bold text-ink tracking-tight mb-1">
                  {loading ? (
                    <span className="inline-block h-8 w-12 animate-pulse bg-paper2 rounded" />
                  ) : (
                    card.count
                  )}
                </div>
                <p className="font-sans text-xs text-muted mb-4">
                  {card.label}
                </p>
              </div>

              <Link
                href={card.href}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ink hover:text-stamp uppercase tracking-wider transition-colors pt-3 border-t border-rule"
              >
                <span>Kelola</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Quick Action Banner */}
      <div className="card p-6 bg-paper2 border-rule2/80 space-y-3">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-ink">
          Petunjuk Pengelolaan
        </h2>
        <p className="font-sans text-xs text-ink3 leading-relaxed max-w-3xl">
          Gunakan menu di navigasi sebelah kiri untuk mengedit daftar Kategori, Item Menu, Modifiers, dan Pengaturan Outlet. Semua perubahan akan langsung memperbarui database Supabase secara real-time.
        </p>
      </div>
    </div>
  )
}
