import Link from 'next/link'
import { Camera, History, ReceiptText } from 'lucide-react'
import BilbilLogo from '@/components/BilbilLogo'

export default function Home() {
  return (
    <div data-theme="hangat" className="px-5 pb-12 pt-6">
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

        <h1 className="anim-rise mt-12 text-[2.5rem] font-semibold leading-[1.08] tracking-tight">
          Siapa pesan apa,
          <br />
          bayar berapa.
        </h1>
        <p className="anim-rise mt-4 max-w-sm text-base text-muted" style={{ animationDelay: '80ms' }}>
          Bagi pesanan ke teman, promo dihitung otomatis, lalu tagih lewat WhatsApp.
        </p>

        <div className="mt-10 space-y-3">
          <Link
            href="/kopken"
            className="anim-rise group block overflow-hidden rounded-[1.75rem] bg-[#c8102e] p-5 text-white shadow-[0_18px_40px_-20px_rgba(200,16,46,.7)] transition-transform active:scale-[.99]"
            style={{ animationDelay: '160ms' }}
          >
            <div className="flex items-start justify-between">
              <span className="text-xl font-semibold">
                Kopi Kenangan <span className="anim-beat text-[#ff9aac]">♥</span>
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Paling sering</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Susun pesanan dari menu, atau scan struk dari aplikasi. Combo promo blu dan cashback sudah siap.
            </p>
            <div className="mt-5 flex gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 font-medium text-[#c8102e]">
                <Camera size={16} /> Scan struk
              </span>
              <span className="inline-flex items-center rounded-full border border-white/40 px-3.5 py-2">Susun dari menu</span>
            </div>
          </Link>

          <Link
            href="/umum"
            className="anim-rise card flex items-center gap-4 p-5 transition-colors hover:border-accent/40"
            style={{ animationDelay: '220ms' }}
          >
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
