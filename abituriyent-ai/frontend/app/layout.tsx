import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif-display',
})

export const metadata: Metadata = {
  title: 'Abituriyent AI - Karyera Məsləhətçisi',
  description: 'Azərbaycan universitetləri üçün ixtisas seçimi məsləhətçisi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body className="font-sans bg-navy text-text-body antialiased min-h-screen selection:bg-gold selection:text-navy">
        {children}
      </body>
    </html>
  )
}
