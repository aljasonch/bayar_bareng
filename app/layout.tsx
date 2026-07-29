import type { Metadata } from 'next'
import { DM_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  title: 'Bilbil | Kalkulator Patungan',
  description:
    'Catat pesanan tiap orang, hitung diskon, ongkir, dan cashback, lalu tagih lewat WhatsApp. Split bill tanpa salah hitung.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${plexMono.variable}`}>
      <body className="antialiased selection:bg-stamp/20">{children}</body>
    </html>
  )
}
