import { createPageMetadata, getSiteUrl, serializeJsonLd, SITE_NAME } from '@/lib/seo'
import { AboutClient } from './AboutClient'

export const metadata = createPageMetadata({
  title: 'About Our Community Growth Platform',
  description: 'Discover the mission, vision, and technology behind VR Galaxy Networks, a secure digital community for networking, skills, leadership, and professional growth.',
  path: '/about',
  keywords: ['about VR Galaxy Networks', 'community growth platform', 'technology network', 'professional networking'],
})

export default function AboutPage() {
  const baseUrl = getSiteUrl()
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': `About ${SITE_NAME}`,
    'description': 'Learn about our secure, technology-driven digital community for peer networking and professional growth.',
    'url': `${baseUrl}/about`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutJsonLd) }}
      />
      <AboutClient />
    </>
  )
}
