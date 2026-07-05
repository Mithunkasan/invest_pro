import { createPageMetadata, getSiteUrl, serializeJsonLd } from '@/lib/seo'
import { prisma } from '@/lib/prisma'
import { MembershipPlansClient } from './MembershipPlansClient'

export const metadata = createPageMetadata({
  title: 'Membership Plans for Community Growth',
  description: 'Explore VR Galaxy Networks membership plans designed for community growth, business networking, team building, leadership development, and digital earning opportunities.',
  path: '/membership-plans',
  keywords: ['VR Galaxy Networks membership plans', 'community growth membership', 'business networking', 'leadership development', 'referral rewards'],
})

export default async function MembershipPlansPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })

  const baseUrl = getSiteUrl()
  
  // Dynamic JSON-LD Structured Data to optimize SEO for product/service offers
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'VR Galaxy Networks Membership Plans',
    'description': 'Explore VR Galaxy Networks membership plans designed for community growth, business networking, team building, leadership development, and digital earning opportunities.',
    'url': `${baseUrl}/membership-plans`,
    'numberOfItems': plans.length,
    'itemListElement': plans.map((plan, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'item': {
        '@type': 'Product',
        'name': `${plan.name} Membership`,
        'description': `Unlock premium community features and team rewards with the ${plan.name} membership plan.`,
        'image': `${baseUrl}/logo.png`,
        'offers': {
          '@type': 'Offer',
          'price': String(plan.price),
          'priceCurrency': 'INR',
          'url': `${baseUrl}/membership-plans`,
          'availability': 'https://schema.org/InStock',
        }
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaJsonLd) }}
      />
      <MembershipPlansClient plans={plans} />
    </>
  )
}
