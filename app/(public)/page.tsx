import { createPageMetadata, getSiteUrl, serializeJsonLd, SITE_NAME } from '@/lib/seo'
import { HeroSection } from '@/components/home/HeroSection'
import { ScrollingStatsBar } from '@/components/home/ScrollingStatsBar'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import { PlansSection } from '@/components/home/PlansSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { HowItWorksLeaderboard } from '@/components/home/HowItWorksLeaderboard'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQSection } from '@/components/home/FAQSection'
import { AnimatedGalaxyBackground } from '@/components/common/AnimatedGalaxyBackground'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const metadata = createPageMetadata({
  title: 'Digital Earning & Community Growth Platform',
  description: 'Join VR Galaxy Networks for community growth, membership benefits, task rewards, referral opportunities, and transparent digital earning tools.',
  path: '/',
  keywords: ['VR Galaxy Networks', 'digital earning platform', 'community growth', 'membership benefits', 'referral rewards', 'task rewards'],
})

export const revalidate = 60

const isDatabaseConnectionError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001'

async function loadHomepageData() {
  try {
    return await Promise.all([
      prisma.systemSettings.findUnique({ where: { id: 'default' } }),
      prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
      prisma.transaction.groupBy({
        by: ['userId'],
        where: {
          user: { is: { role: 'USER' as const } },
          status: 'COMPLETED' as const,
          walletType: { in: ['REWARD', 'REFERRAL', 'LEVEL', 'SHARE', 'BONUS'] as const },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
        _max: { createdAt: true },
        orderBy: [
          { _sum: { amount: 'desc' as const } },
          { _max: { createdAt: 'asc' as const } },
        ],
        take: 3,
      }),
    ])
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error

    // Neon may briefly reject the first connection while the endpoint wakes.
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return Promise.all([
      prisma.systemSettings.findUnique({ where: { id: 'default' } }),
      prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
      prisma.transaction.groupBy({
        by: ['userId'],
        where: {
          user: { is: { role: 'USER' } },
          status: 'COMPLETED',
          walletType: { in: ['REWARD', 'REFERRAL', 'LEVEL', 'SHARE', 'BONUS'] },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
        _max: { createdAt: true },
        orderBy: [
          { _sum: { amount: 'desc' } },
          { _max: { createdAt: 'asc' } },
        ],
        take: 3,
      }),
    ])
  }
}

export default async function HomePage() {
  let settings: Prisma.SystemSettingsGetPayload<object> | null = null
  let membershipPlans: Prisma.MembershipPlanGetPayload<object>[] = []
  let leaderboardData: Array<{
    rank: number
    name: string
    amount: string
    avatar: string
  }> = []

  try {
    // Aggregate in PostgreSQL and return only three rows. Previously this page
    // downloaded every matching transaction on every revalidation.
    const [currentSettings, plans, topEarnings] = await loadHomepageData()

    settings = currentSettings
    membershipPlans = plans

    const topUsers = await prisma.user.findMany({
      where: { id: { in: topEarnings.map((entry) => entry.userId) } },
      select: { id: true, name: true, profilePictureUrl: true },
    })
    const usersById = new Map(topUsers.map((user) => [user.id, user]))

    leaderboardData = topEarnings.flatMap((entry, index) => {
      const user = usersById.get(entry.userId)
      if (!user) return []

      return [{
        rank: index + 1,
        name: user.name,
        amount: `₹${(entry._sum.amount || 0).toLocaleString('en-IN')}`,
        avatar: user.profilePictureUrl || '',
      }]
    })
  } catch (error) {
    // Keep the public page available during a temporary database/quota outage.
    // Authenticated and transactional routes still require a live database.
    if (isDatabaseConnectionError(error)) {
      console.warn('Homepage database connection is temporarily unavailable after retrying.')
    } else {
      console.error('Failed to load homepage database data', error)
    }
  }

  const formattedPlans = membershipPlans.map((p, index) => ({
    id: p.name.toLowerCase().replace(/\s+/g, '-'),
    name: p.name.toUpperCase(),
    price: `₹${p.price.toLocaleString('en-IN')}`,
    period: p.durationDays === -1 ? 'One Time' : `${p.durationDays} Days`,
    popular: index === Math.floor(membershipPlans.length / 2), // Make the middle plan popular by default
    ctaLabel: `Join ${p.name}`,
    ctaHref: `/register?plan=${encodeURIComponent(p.name)}`,
    features: p.features,
    color: p.color
  }))

  const baseUrl = getSiteUrl()
  
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE_NAME,
    'url': baseUrl,
  }

  const earningPlatformJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': `${SITE_NAME} Earning Platform`,
    'description': 'Digital earning services with membership benefits, task rewards, referrals, and community growth opportunities.',
    'url': `${baseUrl}/plans`,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': '1000.00',
    },
  }

  return (
    <div className="relative w-full bg-[#020205] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(earningPlatformJsonLd) }}
      />
      <AnimatedGalaxyBackground />
      <div className="relative z-10">
        <HeroSection
          stats={{
            membersVal: settings?.heroMembers,
            activeVal: settings?.heroActive,
            paidVal: settings?.heroPaid,
            rateVal: settings?.heroRate,
          }}
        />
        <ScrollingStatsBar />
        <WhyUsSection />
        <PlansSection plans={formattedPlans} />
        <HowItWorksLeaderboard leaderboard={leaderboardData} />
        <FeaturesSection />
        <Testimonials />
        <FAQSection />
      </div>
    </div>
  )
}
