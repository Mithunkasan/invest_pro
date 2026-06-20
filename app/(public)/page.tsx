import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { ScrollingStatsBar } from '@/components/home/ScrollingStatsBar'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import { StatsSection } from '@/components/home/StatsSection'
import { PlansSection } from '@/components/home/PlansSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { HowItWorksLeaderboard } from '@/components/home/HowItWorksLeaderboard'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQSection } from '@/components/home/FAQSection'
import { AnimatedGalaxyBackground } from '@/components/common/AnimatedGalaxyBackground'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'VR Galaxy Network — Smart activation plan platform',
  description: 'Grow your wealth with Daily Reward Earnings starting from 1.5%. Join 10,000+ investors. Minimum Smart Hybrid Digital Earning ₹1,000.',
  alternates: { canonical: '/' },
}

export const revalidate = 60

export default async function HomePage() {
  const [userCount, totalAum, settings, membershipPlans, usersRaw] = await Promise.all([
    prisma.user.count(),
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.systemSettings.findUnique({ where: { id: 'default' } }),
    prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
    prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        profilePictureUrl: true,
        createdAt: true,
        transactions: {
          where: {
            status: 'COMPLETED',
            walletType: {
              in: ['REWARD', 'REFERRAL', 'LEVEL', 'SHARE', 'BONUS']
            },
            amount: { gt: 0 }
          },
          select: {
            amount: true,
            createdAt: true
          }
        }
      }
    })
  ])

  const stats = {
    users: userCount + 500, // Real + Initial base
    aum: (totalAum._sum.amount || 0) + 1500000,
    returns: '1.5% - 3.0%',
    experience: '5+'
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

  const leaderboardData = usersRaw
    .map(u => {
      const totalEarnings = u.transactions.reduce((sum, tx) => sum + tx.amount, 0)
      const lastTxTime = u.transactions.length > 0
        ? Math.max(...u.transactions.map(t => t.createdAt.getTime()))
        : u.createdAt.getTime()

      return {
        name: u.name,
        avatar: u.profilePictureUrl || '',
        totalEarnings,
        lastTxTime,
        createdAt: u.createdAt.getTime()
      }
    })
    .sort((a, b) => {
      if (b.totalEarnings !== a.totalEarnings) {
        return b.totalEarnings - a.totalEarnings
      }
      if (a.lastTxTime !== b.lastTxTime) {
        return a.lastTxTime - b.lastTxTime
      }
      return a.createdAt - b.createdAt
    })
    .slice(0, 3)
    .map((u, index) => ({
      rank: index + 1,
      name: u.name,
      amount: `₹${u.totalEarnings.toLocaleString('en-IN')}`,
      avatar: u.avatar
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
        {/* <StatsSection stats={stats} /> */}
        <PlansSection plans={formattedPlans} />
        <HowItWorksLeaderboard leaderboard={leaderboardData} />
        <FeaturesSection />
        <Testimonials />
        <FAQSection />
      </div>
    </div>
  )
}
