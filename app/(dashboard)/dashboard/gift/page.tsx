import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GiftFormClient } from './GiftFormClient'

export const metadata: Metadata = {
  title: 'Premium Gift Section — InvestPro',
  description: 'Manage and track your welcome gift shipment.',
}

export default async function GiftPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Check database if user is premium and fetch wallet/membership info
  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      membershipPlan: true,
      wallet: {
        select: {
          mainBalance: true
        }
      }
    }
  })

  if (!dbUser || dbUser.memberType !== 'PREMIUM') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <span className="text-5xl mb-4">💎</span>
        <h1 className="text-2xl font-black text-white">Premium Feature Only</h1>
        <p className="text-muted-foreground text-sm max-w-md mt-2">
          The Welcome Gift Section is exclusive to our Premium Members. Register or upgrade to a Premium plan to unlock this reward!
        </p>
      </div>
    )
  }

  // Check if user has made at least one approved deposit
  const approvedDeposit = await prisma.deposit.findFirst({
    where: { userId: session.id, status: 'APPROVED' }
  })

  if (!approvedDeposit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <span className="text-5xl mb-4">💳</span>
        <h1 className="text-2xl font-black text-white">Deposit Required</h1>
        <p className="text-muted-foreground text-sm max-w-md mt-2">
          A user can apply for a gift only after making a deposit. Please complete and obtain approval for a deposit to unlock this section.
        </p>
      </div>
    )
  }

  // Check if user has activated a membership plan
  const hasMembership = (dbUser.membershipPlanId && dbUser.membershipPlan && dbUser.membershipPlan.price > 0) ||
                        (dbUser.basicMembershipActivatedAt && dbUser.basicMembershipAmount > 0)

  if (!hasMembership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <span className="text-5xl mb-4">⚡</span>
        <h1 className="text-2xl font-black text-white">Membership Plan Required</h1>
        <p className="text-muted-foreground text-sm max-w-md mt-2">
          A user can apply for a gift only after activating a membership plan. Please purchase or activate a membership plan to unlock this reward.
        </p>
      </div>
    )
  }

  // Fetch the latest submitted gift details (to display status)
  const latestGift = await prisma.gift.findFirst({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' }
  })

  // Get total number of gift requests submitted by this user
  const giftCount = await prisma.gift.count({
    where: { userId: session.id }
  })

  const walletBalance = dbUser.wallet?.mainBalance ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          🎁 Premium Welcome Gift
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {giftCount === 0 
            ? 'Complete your details to claim your free exclusive InvestPro premium welcome kit.'
            : `Apply for your next premium gift. Subsequent requests require a payment of ₹2,500.`}
        </p>
      </div>

      <GiftFormClient 
        gift={latestGift ? JSON.parse(JSON.stringify(latestGift)) : null} 
        giftCount={giftCount}
        walletBalance={walletBalance}
      />
    </div>
  )
}
