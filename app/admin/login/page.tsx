'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BilbilLogo from '@/components/BilbilLogo'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.push('/admin')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(
          error.message || 'Gagal masuk. Periksa email dan kata sandi Anda.'
        )
      } else {
        router.push('/admin')
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-counter flex flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-widest text-ink3">
          Memuat...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-counter flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-6 md:p-8 space-y-6 shadow-receipt">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-ink text-paper mb-1">
            <BilbilLogo className="h-7 w-7" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-wider text-ink">
            Bilbil Admin
          </h1>
          <p className="font-sans text-xs text-muted">
            Masuk dengan akun admin untuk mengelola menu dan outlet
          </p>
        </div>

        <div className="perforation my-4" />

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-sm bg-stamp-soft border border-stamp/30 p-3 text-xs text-stamp">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-mono leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bilbil.com"
              className="field field-mono"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Kata Sandi</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field field-mono"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary w-full mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                <span>Memproses...</span>
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2">
          <span className="font-mono text-[10px] text-faint uppercase tracking-widest">
            Sistem Kasir Bilbil &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  )
}
