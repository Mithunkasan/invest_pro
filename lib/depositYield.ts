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

  // Determine yield percentage.
  const yieldPercent = user.membershipPlan.depositBonus
  if (yieldPercent <= 0) return

  const now = new Date()
  const activationDate = user.membershipPlanActivatedAt

  // Generate 1000 daily 10:00 AM IST timestamps starting from activationDate
  const T_0 = get10AMIST(activationDate)
  const firstCreditDate = activationDate.getTime() < T_0.getTime() ? T_0 : new Date(T_0.getTime() + 24 * 60 * 60 * 1000)

  // Filter the 1000 days for those that are <= now and >= activationDate.getTime()
  // and > user.lastDailyYieldAt (or if lastDailyYieldAt is null)
  let eligibleTimestamps: Date[] = []
  for (let k = 1; k <= 1000; k++) {
    const D_k = new Date(firstCreditDate.getTime() + (k - 1) * 24 * 60 * 60 * 1000)
    if (D_k.getTime() <= now.getTime() && D_k.getTime() >= activationDate.getTime()) {
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
    // Increment Reward Wallet
    await tx.wallet.upsert({
      where: { userId: user.id },
      update: {
        rewardBalance: { increment: totalCreditAmount },
      },
      create: {
        userId: user.id,
        rewardBalance: totalCreditAmount,
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
