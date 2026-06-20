import { prisma } from '@/lib/prisma'
import { syncWalletMainBalance } from '@/actions/walletUtils'

const MAX_MEMBERSHIP_YIELD_DAYS = 1000

function get10AMIST(d: Date): Date {
  const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in ms
  const istTime = new Date(d.getTime() + istOffset)
  const year = istTime.getUTCFullYear()
  const month = istTime.getUTCMonth()
  const dateVal = istTime.getUTCDate()
  
  // 10:00 AM IST is 04:30 AM UTC
  return new Date(Date.UTC(year, month, dateVal, 4, 30, 0, 0))
}

export async function creditDueDepositYields(userId: string) {
  // 1. Fetch user and their active membership plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      membershipPlan: true,
    },
  })

  if (!user || !user.membershipPlan || !user.membershipPlanActivatedAt) return

  // Verify that the membership plan is valid and has a price > 0
  if (user.membershipPlan.price <= 0) return

  // Fetch yield percentage configured by the admin from system settings
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
  })
  const yieldPercent = settings?.basicDailyYieldPercent ?? 0.2
  if (yieldPercent <= 0) return

  const now = new Date()
  const activationDate = user.membershipPlanActivatedAt
  const expiresAt = user.membershipPlanExpiresAt

  // Generate daily 10:00 AM IST timestamps starting from activationDate
  const T_0 = get10AMIST(activationDate)
  const firstCreditDate = activationDate.getTime() < T_0.getTime() ? T_0 : new Date(T_0.getTime() + 24 * 60 * 60 * 1000)

  // Filter the daily dates for those that are <= now and >= activationDate.getTime()
  // and <= expiresAt (if it is set) and > user.lastDailyYieldAt (or if lastDailyYieldAt is null)
  const eligibleTimestamps: Date[] = []
  for (let k = 1; k <= MAX_MEMBERSHIP_YIELD_DAYS; k++) {
    const D_k = new Date(firstCreditDate.getTime() + (k - 1) * 24 * 60 * 60 * 1000)
    
    // Stop generating if D_k is in the future
    if (D_k.getTime() > now.getTime()) {
      break
    }
    
    // Stop generating if D_k is after expiration date
    if (expiresAt && D_k.getTime() > expiresAt.getTime()) {
      break
    }

    if (D_k.getTime() >= activationDate.getTime()) {
      if (!user.lastDailyYieldAt || D_k.getTime() > user.lastDailyYieldAt.getTime()) {
        eligibleTimestamps.push(D_k)
      }
    }
  }

  const dueDays = eligibleTimestamps.length
  if (dueDays <= 0) return

  // Calculate daily return: (plan.price * yieldPercent) / 100
  const dailyReturn = (user.membershipPlan.price * yieldPercent) / 100
  const totalCreditAmount = Number((dailyReturn * dueDays).toFixed(2))

  if (totalCreditAmount <= 0) return

  // Credit to Reward Wallet and create transaction and update user lastDailyYieldAt
  const lastYieldTimestamp = eligibleTimestamps[dueDays - 1]

  await prisma.$transaction(async (tx) => {
    // Claim this range before crediting it. Concurrent dashboard/cron requests
    // cannot both advance the same membership from the same last-yield value.
    const claim = await tx.user.updateMany({
      where: {
        id: user.id,
        membershipPlanId: user.membershipPlanId,
        membershipPlanActivatedAt: activationDate,
        ...(user.lastDailyYieldAt
          ? { lastDailyYieldAt: user.lastDailyYieldAt }
          : { lastDailyYieldAt: null }),
      },
      data: { lastDailyYieldAt: lastYieldTimestamp },
    })
    if (claim.count !== 1) return

    // Increment Reward Wallet and totalEarned (daily yield is income)
    await tx.wallet.upsert({
      where: { userId: user.id },
      update: {
        rewardBalance: { increment: totalCreditAmount },
        totalEarned: { increment: totalCreditAmount },
      },
      create: {
        userId: user.id,
        rewardBalance: totalCreditAmount,
        totalEarned: totalCreditAmount,
      },
    })

    // Create a Transaction record
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'PROFIT',
        amount: totalCreditAmount,
        status: 'COMPLETED',
        walletType: 'REWARD',
        description: `Daily yield of ${yieldPercent}% on membership plan (${user.membershipPlan!.name}) x ${dueDays} day${dueDays > 1 ? 's' : ''}`,
        reference: `MEMBERSHIP_YIELD:${user.membershipPlanId}:${lastYieldTimestamp.getTime()}`,
      },
    })

    // Sync user's main wallet balance
    await syncWalletMainBalance(tx, user.id)
  })
}

export async function creditAllDueMembershipYields() {
  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      membershipPlanId: { not: null },
      membershipPlanActivatedAt: { not: null },
    },
    select: { id: true },
  })

  let succeeded = 0
  let failed = 0
  for (const user of users) {
    try {
      await creditDueDepositYields(user.id)
      succeeded++
    } catch (error) {
      failed++
      console.error(`Failed to process membership yield for user ${user.id}:`, error)
    }
  }

  return { processed: users.length, succeeded, failed }
}
