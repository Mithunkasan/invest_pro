import type { Metadata } from 'next'
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
import type { Prisma } from '@prisma/client'

export const metadata: Metadata = {
  title: 'VR Galaxy Network — Smart activation plan platform',
  description: 'Grow your wealth with Daily Reward Earnings starting from 1.5%. Join 10,000+ investors. Minimum Smart Hybrid Digital Earning ₹1,000.',
  alternates: { canonical: '/' },
}

export const revalidate = 60

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
    const [currentSettings, plans, topEarnings] = await Promise.all([
      prisma.systemSettings.findUnique({ where: { id: 'default' } }),
      prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
      // Aggregate in PostgreSQL and return only three rows. Previously this page
      // downloaded every matching transaction on every revalidation.
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
    console.error('Failed to load homepage database data', error)
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'VR Galaxy',
    'url': baseUrl,
  }

  const financeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    'name': 'VR Galaxy Daily Reward Earnings Activation Plan',
    'description': 'High-yield smart activation plans starting from ₹1,000 with Daily Reward Earnings ranging from 1.5% to 3.0%.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financeJsonLd) }}
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
