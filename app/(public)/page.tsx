import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
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
  const [userCount, totalAum] = await Promise.all([
    prisma.user.count(),
    prisma.investment.aggregate({ _sum: { amount: true } })
  ])

  const stats = {
    users: userCount + 500, // Real + Initial base
    aum: (totalAum._sum.amount || 0) + 1500000,
    returns: '1.5% - 3.0%',
    experience: '5+'
  }

  return (
    <div className="relative w-full bg-[#020205] overflow-hidden">
      <AnimatedGalaxyBackground />
      <div className="relative z-10">
        <HeroSection />
        <WhyUsSection />
        {/* <StatsSection stats={stats} /> */}
        <PlansSection />
        <HowItWorksLeaderboard />
        <FeaturesSection />
        <Testimonials />
        <FAQSection />
      </div>
    </div>
  )
}
