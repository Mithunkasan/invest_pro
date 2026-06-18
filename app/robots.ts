import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/membership-plans', '/contact', '/faq', '/terms', '/privacy'],
        disallow: ['/dashboard/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
