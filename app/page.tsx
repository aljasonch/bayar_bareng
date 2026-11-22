import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Camera, History, ReceiptText } from 'lucide-react'
import BilbilLogo from '@/components/BilbilLogo'

export default function Home() {
  return (
    <div className="px-5 pb-12 pt-6">
      <div className="mx-auto max-w-lg">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BilbilLogo className="h-7 w-7 text-accent" />
            <span className="text-lg font-semibold">Bilbil</span>
          </div>
          <Link href="/history" className="btn-ghost -mr-3 min-h-10 px-3">
            <History size={18} />
            Riwayat
          </Link>
        </header>

        <h1 className="hero-title anim-rise mt-12">
          Siapa pesan apa,
          <br />
          bayar berapa.
        </h1>
        <p className="anim-rise mt-4 max-w-sm text-base text-muted" style={{ '--stagger': 2 } as CSSProperties}>
          Bagi pesanan ke teman, promo dihitung otomatis, lalu tagih lewat WhatsApp.
        </p>

        <div className="mt-10 space-y-3">
          <Link href="/kopken" data-theme="kopken" className="kopken-hero anim-rise group" style={{ '--stagger': 3 } as CSSProperties}>
            <div className="flex items-start justify-between">
              <span className="text-xl font-semibold">
                Kopi Kenangan <span className="anim-beat kopken-heart">♥</span>
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Paling sering</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Susun pesanan dari menu, atau scan struk dari aplikasi. Combo promo blu dan cashback sudah siap.
            </p>
            <div className="mt-5 flex gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-onAccent px-3.5 py-2 font-medium text-accent">
                <Camera size={16} /> Scan struk
              </span>
              <span className="inline-flex items-center rounded-full border border-white/40 px-3.5 py-2">Susun dari menu</span>
            </div>
          </Link>

          <Link href="/umum" className="anim-rise card flex items-center gap-4 p-5 transition-colors hover:border-accent/40" style={{ '--stagger': 4 } as CSSProperties}>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accentSoft text-accent">
              <ReceiptText size={22} />
            </span>
            <span>
              <span className="block font-semibold">Nota umum</span>
              <span className="mt-0.5 block text-sm text-muted">Restoran, warung, belanjaan: tulis item dan harganya sendiri.</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
