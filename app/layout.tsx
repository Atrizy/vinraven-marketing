import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'VinRaven – Your Website’s 24/7 AI Front Desk',
  description:
    'Done-for-you AI assistant that answers questions 24/7 and captures every lead. Stop losing customers to voicemail. We handle the tech; you get the leads.',
}

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-[#0c0f14] text-slate-100 antialiased ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}
