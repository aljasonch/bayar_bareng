import type { Metadata, Viewport } from 'next'
import { Google_Sans, Google_Sans_Code } from 'next/font/google'
import './globals.css'

const sans = Google_Sans({ subsets: ['latin'], variable: '--font-sans', adjustFontFallback: false })
const mono = Google_Sans_Code({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Bilbil | Patungan tanpa salah hitung',
  description: 'Scan struk, bagi pesanan ke teman, hitung promo, lalu tagih lewat WhatsApp.',
}

export const viewport: Viewport = { themeColor: '#f6efe6' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
