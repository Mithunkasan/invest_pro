import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { FloatingMoneyBackground } from '@/components/common/FloatingMoneyBackground'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'VR Galaxy — Smart activation plan platform',
    template: '%s | VR Galaxy',
  },
  description:
    'VR Galaxy is a trusted activation plan platform helping thousands grow their wealth through Smart Hybrid Digital Earnings with Daily Reward Earnings.',
  keywords: ['Smart Hybrid Digital Earning', 'mutual funds', 'Daily Reward Earnings', 'wealth management', 'fintech', 'India'],
  authors: [{ name: 'VR Galaxy Team' }],
  creator: 'VR Galaxy',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'VR Galaxy — Smart activation plan platform',
    description: 'Grow your wealth with Daily Reward Earnings. Join 10,000+ investors.',
    siteName: 'VR Galaxy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VR Galaxy activation plan platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VR Galaxy — Smart activation plan platform',
    description: 'Grow your wealth with Daily Reward Earnings. Join 10,000+ investors.',
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

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'VR Galaxy',
    'url': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'logo': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo3.png`,
    'sameAs': [
      'https://twitter.com/vrgalaxy',
      'https://github.com/vrgalaxy'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-98765-43210',
      'contactType': 'customer support',
      'email': 'support@vrgalaxynetwork.com',
      'availableLanguage': 'en'
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange={false}
          >
            <FloatingMoneyBackground />
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
