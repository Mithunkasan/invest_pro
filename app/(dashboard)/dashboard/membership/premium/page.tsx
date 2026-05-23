import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/utils/formatters'
import { Crown, Check, ShieldCheck, Zap, Coins, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MembershipUpgradeButton } from '@/components/dashboard/MembershipUpgradeButton'

export const metadata: Metadata = { title: 'Premium Membership — InvestPro' }

export default async function PremiumMembershipPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
  const user = await prisma.user.findUnique({ where: { id: session.id } })
  
  const mainBalance = wallet?.mainBalance || 0
  const isPremium = user?.starPerformer || user?.tlRank || false

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
    name: 'VR Galaxy Premium',
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
    ],
    color: '#F59E0B'
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
    name: dbPremiumPlan.name,
    price: dbPremiumPlan.price,
    durationDays: dbPremiumPlan.durationDays,
    depositBonus: dbPremiumPlan.depositBonus,
    referralLevel1: dbPremiumPlan.referralLevel1,
    referralLevel2: dbPremiumPlan.referralLevel2,
    referralLevel3: dbPremiumPlan.referralLevel3,
    withdrawalTime: dbPremiumPlan.withdrawalTime,
    support: dbPremiumPlan.support,
    features: dbPremiumPlan.features,
    color: dbPremiumPlan.color
  } : defaultPremiumPlan

  const upgradePrice = premiumPlan.price

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Premium Membership
          <span className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center gap-1 border border-amber-300">
            👑 VIP TIER
          </span>
        </h1>
        <p className="text-muted-foreground text-sm">Elevate your earnings, deposits, and referral potential to the absolute maximum.</p>
      </div>

      {/* Main Premium Card */}
      <div className="premium-card overflow-hidden relative border border-amber-500/20 bg-gradient-to-br from-brand-950/80 to-brand-900/60 shadow-[0_4px_30px_rgba(245,158,11,0.05)]">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" style={{ backgroundColor: `${premiumPlan.color}15` }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20" style={{ backgroundImage: `linear-gradient(to right, ${premiumPlan.color}, ${premiumPlan.color}dd)` }}>
                  <Crown className="w-5.5 h-5.5 text-black" />
                </span>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400/90" style={{ color: premiumPlan.color }}>Premium Tier</span>
                  <h2 className="text-2xl font-black text-white mt-0.5">{premiumPlan.name}</h2>
                </div>
              </div>
              <p className="text-sm text-brand-100/80 leading-relaxed">
                Unlock the ultimate investor status. Receive an active +{premiumPlan.depositBonus}% deposit yield multiplier, multi-level referral commission boost, priority withdrawal speed, and dedicated account support features.
              </p>
              
              {isPremium && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Your Premium Status is Active
                </div>
              )}
            </div>

            <div className="w-full lg:w-auto min-w-[240px] bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 text-center flex flex-col justify-between">
              <span className="text-xs text-brand-300 font-bold uppercase tracking-wider">
                {premiumPlan.durationDays === -1 ? 'Lifetime Pass' : `${premiumPlan.durationDays} Days Pass`}
              </span>
              <p className="text-4xl font-black text-white mt-1.5 flex items-center justify-center gap-1.5">
                {formatCurrency(upgradePrice)}
                <span className="text-xs font-normal text-brand-300">{premiumPlan.durationDays === -1 ? ' / once' : ` / ${premiumPlan.durationDays}d`}</span>
              </p>
              
              <div className="my-4 border-t border-white/5 pt-3 flex items-center justify-between text-xs text-brand-200">
                <span>Your Main Balance:</span>
                <span className="font-bold text-white">{formatCurrency(mainBalance)}</span>
              </div>

              <MembershipUpgradeButton 
                upgradePrice={upgradePrice} 
                mainBalance={mainBalance} 
                isPremium={isPremium} 
                color={premiumPlan.color} 
              />
              {!isPremium && mainBalance < upgradePrice && (
                <Link href="/dashboard/deposit" className="block w-full mt-3">
                  <Button variant="outline" className="w-full text-xs text-amber-400 border-amber-400/30 hover:bg-amber-400 hover:text-black">
                    Deposit Funds First
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Zap,
            title: `+${premiumPlan.depositBonus.toFixed(1)}% Deposit Bonus`,
            desc: `Every single deposit receipt processed adds an automated +${premiumPlan.depositBonus.toFixed(1)}% yield multiplier to your balance immediately.`,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10 border-amber-400/20'
          },
          {
            icon: Coins,
            title: 'Multi-Level Referral',
            desc: `Unlock Level 2 (${premiumPlan.referralLevel2}%) and Level 3 (${premiumPlan.referralLevel3}%) commission structures. Turn your network into a compounding revenue loop.`,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10 border-blue-400/20'
          },
          {
            icon: Clock,
            title: 'Express Withdrawal',
            desc: `Priority queues enable withdrawals to clear into your bank account or UPI ID in ${premiumPlan.withdrawalTime}.`,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10 border-purple-400/20'
          }
        ].map((feat, idx) => (
          <div key={idx} className={`premium-card p-5 border ${feat.bg} flex flex-col gap-3.5`}>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <feat.icon className={`w-5.5 h-5.5 ${feat.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{feat.title}</h3>
              <p className="text-xs text-brand-200 mt-1 leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Matrix */}
      <div className="premium-card p-6">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-amber-400" />
          Feature Matrix Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase font-bold">
                <th className="py-3 px-4">Feature / Benefit</th>
                <th className="py-3 px-4">Free Plan</th>
                <th className="py-3 px-4 text-amber-400" style={{ color: premiumPlan.color }}>Premium Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground/90">
              {[
                { name: 'Deposit Cash Back Bonus', free: `+${freePlan.depositBonus.toFixed(1)}%`, premium: `+${premiumPlan.depositBonus.toFixed(1)}% Instant Cash` },
                { name: 'Direct Referral Commission', free: `${freePlan.referralLevel1}% (L1 Only)`, premium: `${premiumPlan.referralLevel1}% (L1) + ${premiumPlan.referralLevel2}% (L2) + ${premiumPlan.referralLevel3}% (L3)` },
                { name: 'Withdrawal Approvals', free: freePlan.withdrawalTime, premium: `${premiumPlan.withdrawalTime} (Priority Queue)` },
                { name: 'Premium Plans Accessibility', free: 'Locked', premium: 'Fully Unlocked' },
                { name: 'Star Performer Rank Eligibility', free: 'Requires ₹5k Active Invest', premium: 'Unlocked Instantly' },
                { name: 'Dedicated Support Account Manager', free: freePlan.support, premium: premiumPlan.support },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 font-medium">{row.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.free}</td>
                  <td className="py-3 px-4 text-amber-400 font-semibold" style={{ color: premiumPlan.color }}>{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
