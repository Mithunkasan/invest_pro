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
  title: 'InvestPro — Smart Investment Platform',
  description: 'Grow your wealth with daily ROI starting from 1.5%. Join 10,000+ investors. Min investment ₹1,000.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [userCount, totalAum, settings, membershipPlans] = await Promise.all([
    prisma.user.count(),
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.systemSettings.findUnique({ where: { id: 'default' } }),
    prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } })
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
    'name': 'VR Galaxy Daily ROI Investment Plan',
    'description': 'High-yield smart investment plans starting from ₹1,000 with a daily ROI ranging from 1.5% to 3.0%.',
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
        <HowItWorksLeaderboard />
        <FeaturesSection />
        <Testimonials />
        <FAQSection />
      </div>
    </div>
  )
}
