import { prisma } from '@/lib/prisma'
import { syncWalletMainBalance } from '@/actions/walletUtils'

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
  let eligibleTimestamps: Date[] = []
  let k = 1
  while (true) {
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
    k++
    
    // Safety break to prevent infinite loop
    if (k > 5000) break
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

    // Update User record with new lastDailyYieldAt
    await tx.user.update({
      where: { id: user.id },
      data: {
        lastDailyYieldAt: lastYieldTimestamp,
      },
    })

    // Sync user's main wallet balance
    await syncWalletMainBalance(tx, user.id)
  })
}
