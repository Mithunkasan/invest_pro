import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()
  const lastModified = new Date('2026-06-24')

  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1, images: [`${baseUrl}/logo3.png`] },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8, images: [`${baseUrl}/about.jpeg`] },
    { url: `${baseUrl}/membership-plans`, lastModified, changeFrequency: 'weekly', priority: 0.9, images: [`${baseUrl}/membership_hero_galaxy.png`] },
    { url: `${baseUrl}/plans`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
