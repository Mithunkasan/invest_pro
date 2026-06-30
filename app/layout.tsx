import type { Metadata } from 'next'
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { FloatingMoneyBackground } from '@/components/common/FloatingMoneyBackground'
import { CANONICAL_SITE_URL, getSiteUrl, serializeJsonLd, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo'
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next"
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

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vrgalaxynetworks.com"),
  title: {
    default: `${SITE_NAME} | Digital Earning & Community Growth Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['digital earning platform', 'community growth platform', 'membership benefits', 'referral rewards', 'task rewards', 'business networking', 'India'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: CANONICAL_SITE_URL,
    title: `${SITE_NAME} | Digital Earning & Community Growth Platform`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: `${SITE_NAME} digital earning platform` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Digital Earning & Community Growth Platform`,
    description: SITE_DESCRIPTION,
    images: [`${CANONICAL_SITE_URL}/opengraph-image`],
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()
  const baseUrl = getSiteUrl()
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/logo3.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'customer support',
      email: 'support@vrgalaxynetwork.com',
      availableLanguage: ['English', 'Tamil'],
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgJsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange={false}
          >
            <FloatingMoneyBackground />
            {children}

            <GoogleAnalytics gaId="G-WP9QG8WK79" />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
