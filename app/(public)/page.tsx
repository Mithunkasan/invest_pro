import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { PlansSection } from '@/components/home/PlansSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQSection } from '@/components/home/FAQSection'
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
    <>
      <HeroSection />
      <StatsSection stats={stats} />
      <PlansSection />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <FAQSection />
    </>
  )
}
