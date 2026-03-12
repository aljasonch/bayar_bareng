import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bayar Bareng — Split Bill Calculator',
  description: 'Split your bills easily with friends. Calculate discounts, delivery fees, cashback, and share the breakdown via WhatsApp.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
