import { prisma } from '@/lib/prisma'
import { distributeReferralAndLevelCommissions } from '@/actions/rules'

interface MembershipCommissionEvent {
  purchaserId: string
  baseAmount: number
  sourceId: string
}

export async function backfillMembershipReferralCommissions() {
  const [approvedUpgrades, activationTransactions] = await Promise.all([
    prisma.membershipUpgradeRequest.findMany({
      where: {
        status: 'APPROVED',
        plan: { price: { gt: 0 } },
      },
      select: {
        id: true,
        userId: true,
        plan: { select: { price: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.transaction.findMany({
      where: {
        type: 'INVESTMENT',
        status: 'COMPLETED',
        amount: { gt: 0 },
        OR: [
          { description: { startsWith: 'Activated ' } },
          { description: 'Basic Membership activated after KYC approval' },
        ],
      },
      select: { id: true, userId: true, amount: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const discoveredEvents: MembershipCommissionEvent[] = [
    ...approvedUpgrades.map((request) => ({
      purchaserId: request.userId,
      baseAmount: request.plan.price,
      sourceId: request.id,
    })),
    ...activationTransactions.map((transaction) => ({
      purchaserId: transaction.userId,
      baseAmount: transaction.amount,
      sourceId: transaction.id,
    })),
  ]
  const events = [...new Map(
    discoveredEvents.map((event) => [event.sourceId, event])
  ).values()]

  let creditedCommissions = 0
  let failedEvents = 0

  for (const event of events) {
    try {
      const creditedUplines = await distributeReferralAndLevelCommissions(
        event.purchaserId,
        event.baseAmount,
        event.sourceId,
        'MEMBERSHIP'
      )
      creditedCommissions += creditedUplines?.length ?? 0
    } catch (error) {
      failedEvents++
      console.error(`Failed to backfill membership referral event ${event.sourceId}:`, error)
    }
  }

  return {
    processedEvents: events.length,
    creditedCommissions,
    failedEvents,
  }
}
