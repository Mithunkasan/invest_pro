import type { Metadata } from 'next'

export const SITE_NAME = 'VR Galaxy Networks'
export const SITE_DESCRIPTION =
  'VR Galaxy Networks is a digital earning platform for community growth, membership benefits, task rewards, referrals, and professional networking.'

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const isLocalConfiguredUrl = configuredUrl?.includes('localhost') || configuredUrl?.includes('127.0.0.1')
  const siteUrl = vercelHost && (!configuredUrl || isLocalConfiguredUrl)
    ? `https://${vercelHost}`
    : configuredUrl || 'http://localhost:3000'

  return siteUrl.replace(/\/$/, '')
}

type PageMetadata = {
  title: string
  description: string
  path: string
  keywords?: string[]
}

export function createPageMetadata({ title, description, path, keywords = [] }: PageMetadata): Metadata {
  const canonical = path === '/' ? '/' : path.replace(/\/$/, '')

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME} digital earning platform` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
