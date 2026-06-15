import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/utils/formatters'
import { Crown, Sparkles, Zap, Shield, Gift, HelpCircle } from 'lucide-react'
import { MembershipUpgradeButton } from '@/components/dashboard/MembershipUpgradeButton'

export const metadata: Metadata = {
  title: 'Membership Club — InvestPro',
  description: 'Manage and upgrade your membership status to unlock premium trading benefits, yield multipliers, and multi-level referral commissions.',
}

export default async function UserMembershipPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch current user along with their active membership relation and wallet
  const [user, dbWalletRaw, activePlans, pendingRequest] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: { membershipPlan: true }
    }),
    prisma.wallet.findUnique({
      where: { userId: session.id }
    }),
    prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    }),
    prisma.membershipUpgradeRequest.findFirst({
      where: { userId: session.id, status: 'PENDING' },
      include: { plan: true }
    })
  ])

  let wallet = dbWalletRaw
  if (wallet) {
    const expectedMain = 
      (wallet.rewardBalance || 0) +
      (wallet.referralBalance || 0) +
      (wallet.levelBalance || 0) +
      (wallet.shareBalance || 0) +
      (wallet.bonusBalance || 0)
    
    if (wallet.mainBalance !== expectedMain) {
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { mainBalance: expectedMain }
      })
    }
  }

  if (!user || !wallet) {
    redirect('/login')
  }

  if (user.memberType === 'FREE') {
    redirect('/dashboard/kyc')
  }

  // Determine current active plan
  const currentPlan = user.membershipPlan || {
    id: 'free-fallback',
    name: 'Free Membership',
    price: 0,
    durationDays: -1,
    depositBonus: 0,
    referralLevel1: 10,
    referralLevel2: 0,
    referralLevel3: 0,
    withdrawalTime: '24-48 Hours',
    support: 'Standard Email',
    color: '#3B82F6',
    features: [
      'Standard L1 Referral Commission (10%)',
      'Access to standard investment plans',
      'Full wallet overview & reports',
      'Daily dividend accrual & payouts',
      'Basic account support (2-3 business days)',
    ]
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Crown className="w-8 h-8 text-amber-500 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          InvestPro VIP Club
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Elevate your financial compounding potential. Unlock exclusive yield bonuses, speed up withdrawal timelines, and multiply your earnings with recursive multi-level referral commissions.
        </p>
      </div>

      {pendingRequest && (
        <div className="premium-card p-4 border border-amber-500/30 bg-amber-500/5 rounded-2xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-extrabold text-amber-400">Upgrade Request Pending:</span> Your request to subscribe to <span className="font-bold text-white">{pendingRequest.plan.name}</span> is currently being reviewed by our administrative team.
          </div>
        </div>
      )}

      {/* Active Membership Status Banner */}
      <div 
        className="premium-card overflow-hidden relative border-0 shadow-2xl p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${currentPlan.color}15, ${currentPlan.color}05), rgba(15, 23, 42, 0.7)`,
          borderLeft: `4px solid ${currentPlan.color}`,
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: currentPlan.color }} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
                style={{ 
                  backgroundColor: `${currentPlan.color}15`, 
                  borderColor: `${currentPlan.color}30` 
                }}
              >
                <Crown className="w-6.5 h-6.5" style={{ color: currentPlan.color }} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Active Subscription Tier</span>
                <h2 className="text-2xl font-black text-white mt-0.5">{currentPlan.name}</h2>
              </div>
            </div>
            
            <p className="text-sm text-brand-200 max-w-2xl leading-relaxed">
              You are currently enjoying the perks of the <strong style={{ color: currentPlan.color }}>{currentPlan.name}</strong>. 
              {currentPlan.price === 0 
                ? " Upgrade your account status to Bronze, Silver, Gold, Diamond, or Platinum to boost deposit rates and unlock multi-level referral earnings."
                : ` Your active tier benefits are synced live. Upgraded duration expires in 365 days from activation.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row md:flex-col gap-4 min-w-[200px] justify-center">
            <div className="bg-brand-950/60 border border-brand-850 rounded-2xl p-4 text-center shrink-0">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Wallet Balance</span>
              <span className="text-xl font-black text-white block mt-1">{formatCurrency(wallet.mainBalance)}</span>
            </div>
            <div className="bg-brand-950/60 border border-brand-850 rounded-2xl p-4 text-center shrink-0">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Active Plan Price</span>
              <span className="text-xl font-black text-white block mt-1" style={{ color: currentPlan.color }}>
                {currentPlan.price === 0 ? 'FREE' : formatCurrency(currentPlan.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Dynamic VIP Membership Tiers
          </h3>
          <p className="text-xs text-muted-foreground">Select a premium membership plan that best fits your trading scale. Subscribe instantly using your Main Wallet balance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.map((plan) => {
            const isCurrent = plan.id === currentPlan.id || (currentPlan.id === 'free-fallback' && plan.price === 0)
            
            return (
              <div 
                key={plan.id}
                className="premium-card flex flex-col justify-between overflow-hidden relative border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: isCurrent 
                    ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7))` 
                    : `linear-gradient(to bottom, rgba(30, 41, 59, 0.3), rgba(15, 23, 42, 0.4))`,
                  borderColor: isCurrent ? plan.color : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: isCurrent ? `0 0 25px ${plan.color}15` : 'none',
                }}
              >
                {/* Glowing Top bar matched to tier color */}
                <div className="h-1.5 w-full absolute top-0 left-0" style={{ backgroundColor: plan.color }} />
                
                {/* Glow accent */}
                <div 
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ backgroundColor: plan.color }}
                />

                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  {/* Tier Title & Price */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-lg font-black text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                        {plan.name}
                      </h4>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">{formatCurrency(plan.price)}</span>
                      <span className="text-xs text-muted-foreground">
                        {plan.durationDays === -1 ? '/ lifetime' : `/ ${plan.durationDays} days`}
                      </span>
                    </div>
                  </div>

                  {/* Core Numeric Benefits (Yield & Referral Rates) */}
                  <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-850 space-y-2.5 my-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Yield Multiplier Bonus:
                      </span>
                      <span className="font-black text-amber-400">+{plan.depositBonus}% yield</span>
                    </div>
                    
                    <div className="h-px bg-brand-850/60" />

                    <div className="space-y-1.5">
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-wider block">Referral Rates:</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="bg-brand-900/50 border border-brand-800 rounded-lg p-1">
                          <span className="text-purple-400 font-bold block">Level 1</span>
                          <span className="font-extrabold text-white block mt-0.5">{plan.referralLevel1}%</span>
                        </div>
                        <div className="bg-brand-900/50 border border-brand-800 rounded-lg p-1">
                          <span className="text-purple-300 font-bold block">Level 2</span>
                          <span className="font-extrabold text-white block mt-0.5">{plan.referralLevel2}%</span>
                        </div>
                        <div className="bg-brand-900/50 border border-brand-800 rounded-lg p-1">
                          <span className="text-purple-300 font-bold block">Level 3</span>
                          <span className="font-extrabold text-white block mt-0.5">{plan.referralLevel3}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-6 border-t border-brand-850 mt-4">
                    {!(currentPlan.name === 'Premium Membership' && (plan.name === 'Free Membership' || plan.name === 'Royal Membership')) && (
                      <MembershipUpgradeButton 
                        planId={plan.id}
                        planName={plan.name}
                        price={plan.price}
                        mainBalance={wallet.mainBalance}
                        isActivePlan={isCurrent}
                        color={plan.color}
                        hasPendingRequest={!!pendingRequest}
                        isLowerOrEqual={plan.price <= currentPlan.price}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trust Badge Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
        <div className="premium-card p-4 flex gap-3 items-center border border-border/40 bg-card/40">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-black text-white uppercase tracking-wider">Secured Vaults</h5>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">Your funds are protected with end-to-end secure asset ledger verification.</p>
          </div>
        </div>
        <div className="premium-card p-4 flex gap-3 items-center border border-border/40 bg-card/40">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-black text-white uppercase tracking-wider">Compounded Yield</h5>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">Deposit yield bonus applies automatically and compounding begins instantly.</p>
          </div>
        </div>
        <div className="premium-card p-4 flex gap-3 items-center border border-border/40 bg-card/40">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-black text-white uppercase tracking-wider">Support Guarantees</h5>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">High-tier support queues guarantee specialized executive chats for resolution.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
