import type { MetadataRoute } from 'next'
import { CANONICAL_SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = CANONICAL_SITE_URL
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/login', '/register', '/forgot-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
