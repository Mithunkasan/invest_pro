import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/utils/formatters'
import { CheckCircle2, Crown, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Free Membership — InvestPro' }

export default async function FreeMembershipPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
  const user = await prisma.user.findUnique({ where: { id: session.id } })

  const dbFreePlan = await prisma.membershipPlan.findFirst({
    where: { name: 'Free Membership', isActive: true }
  })
  const dbPremiumPlan = await prisma.membershipPlan.findFirst({
    where: { name: 'Premium Membership', isActive: true }
  })

  const defaultFreePlan = {
    price: 0,
    durationDays: -1,
    depositBonus: 0,
    referralLevel1: 10,
    referralLevel2: 0,
    referralLevel3: 0,
    withdrawalTime: '24-48 Hours',
    support: 'Standard Email',
    features: [
      'Standard 1x Referral Commission (10%)',
      'Access to Standard Investment Plans',
      'Full Wallet Overview & Reports',
      'Daily Dividend Accrual & Payouts',
      'Basic Account Support (2-3 business days)',
    ]
  }

  const defaultPremiumPlan = {
    price: 1999,
    durationDays: 365,
    depositBonus: 5,
    referralLevel1: 10,
    referralLevel2: 5,
    referralLevel3: 2,
    withdrawalTime: 'Under 2 Hours',
    support: '24/7 Priority VIP Chat Group',
    features: [
      'Unlock Level 2 (5%) and Level 3 (2%) referral payouts',
      'Instant +5.0% yield multiplier on all deposit approvals',
      'Priority express withdrawal queue (processed in under 2 hours)',
      'Full access to VIP compounding algorithms & investment plans',
      'Direct account access to Dedicated Support Chat Manager',
    ]
  }

  const freePlan = dbFreePlan ? {
    price: dbFreePlan.price,
    durationDays: dbFreePlan.durationDays,
    depositBonus: dbFreePlan.depositBonus,
    referralLevel1: dbFreePlan.referralLevel1,
    referralLevel2: dbFreePlan.referralLevel2,
    referralLevel3: dbFreePlan.referralLevel3,
    withdrawalTime: dbFreePlan.withdrawalTime,
    support: dbFreePlan.support,
    features: dbFreePlan.features
  } : defaultFreePlan

  const premiumPlan = dbPremiumPlan ? {
    price: dbPremiumPlan.price,
    durationDays: dbPremiumPlan.durationDays,
    depositBonus: dbPremiumPlan.depositBonus,
    referralLevel1: dbPremiumPlan.referralLevel1,
    referralLevel2: dbPremiumPlan.referralLevel2,
    referralLevel3: dbPremiumPlan.referralLevel3,
    withdrawalTime: dbPremiumPlan.withdrawalTime,
    support: dbPremiumPlan.support,
    features: dbPremiumPlan.features
  } : defaultPremiumPlan

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Membership Status</h1>
        <p className="text-muted-foreground text-sm">Manage and view your active membership tier benefits.</p>
      </div>

      {/* Plan Card */}
      <div className="premium-card overflow-hidden relative border border-border bg-card">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-muted-foreground" />
              </span>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Current Tier</span>
                <h2 className="text-xl font-black text-foreground mt-0.5">Free Membership</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              You are currently on the standard plan. Enjoy basic investment tools, daily wallet payouts, and standard referral commissions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            <div className="bg-muted/50 rounded-xl p-4 border border-border/40 text-center">
              <p className="text-xs text-muted-foreground">Membership Price</p>
              <p className="text-2xl font-black text-foreground mt-1">
                {formatCurrency(freePlan.price)} <span className="text-xs font-normal text-muted-foreground">/{freePlan.durationDays === -1 ? 'lifetime' : ` ${freePlan.durationDays}d`}</span>
              </p>
            </div>
            <Link href="/dashboard/membership/premium" className="w-full">
              <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-sm border border-amber-400">
                <Crown className="w-4 h-4 text-black shrink-0" />
                Upgrade to Premium
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features Checklist */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="font-bold text-base border-b border-border/50 pb-3">Included Benefits</h3>
          
          <ul className="space-y-3">
            {freePlan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-foreground/95">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="font-bold text-base text-amber-500 border-b border-border/50 pb-3">Tiers Restrictions</h3>
          
          <ul className="space-y-3">
            {[
              `No deposit yield bonuses (+0.0% vs Premium's +${premiumPlan.depositBonus.toFixed(1)}%)`,
              'No access to VIP compounds & high-yield plans',
              `No multi-level referral commissions (L2 at ${premiumPlan.referralLevel2}% and L3 at ${premiumPlan.referralLevel3}% are Locked)`,
              `Standard withdrawal processing times (${freePlan.withdrawalTime})`,
              'Ineligible for special rewards and leaderboard badges',
            ].map((restriction, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{restriction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade Callout */}
      <div className="premium-card p-6 bg-gradient-to-r from-blue-950/20 to-primary/10 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-primary">Unleash Full Potential</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upgrade to Premium today to earn +{premiumPlan.depositBonus}% bonus on all deposits and unlock massive multi-level referral earnings!
          </p>
        </div>
        <Link href="/dashboard/membership/premium">
          <Button variant="outline" size="sm" className="border-primary/40 hover:bg-primary hover:text-white shrink-0">
            View Premium Perks
          </Button>
        </Link>
      </div>
    </div>
  )
}
