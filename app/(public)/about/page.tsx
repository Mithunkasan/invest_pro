import type { Metadata } from 'next'
import { AboutClient } from './AboutClient'

export const metadata: Metadata = {
  title: 'About VR Galaxy Network | Community Growth & Technology Innovation',
  description: 'Explore the genesis, mission, vision, and core pillars of VR Galaxy Network. Connect with a secure, technology-driven digital community focused on peer networking and professional growth.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About VR Galaxy Network',
    'description': 'Explore the genesis, mission, vision, and core pillars of VR Galaxy Network. Connect with a secure, technology-driven digital community focused on peer networking and professional growth.',
    'url': `${baseUrl}/about`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutClient />
    </>
  )
}
