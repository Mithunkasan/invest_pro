import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { FloatingMoneyBackground } from '@/components/common/FloatingMoneyBackground'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'VR Galaxy — Smart Investment Platform',
    template: '%s | VR Galaxy',
  },
  description:
    'VR Galaxy is a trusted investment platform helping thousands grow their wealth through smart, transparent investments with daily ROI.',
  keywords: ['investment', 'mutual funds', 'ROI', 'wealth management', 'fintech', 'India'],
  authors: [{ name: 'VR Galaxy Team' }],
  creator: 'VR Galaxy',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'VR Galaxy — Smart Investment Platform',
    description: 'Grow your wealth with daily ROI. Join 10,000+ investors.',
    siteName: 'VR Galaxy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VR Galaxy Investment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VR Galaxy — Smart Investment Platform',
    description: 'Grow your wealth with daily ROI. Join 10,000+ investors.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange={false}
          >
            <FloatingMoneyBackground />
            <WhatsAppButton />
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
