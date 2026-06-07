import { prisma } from '@/lib/prisma'

export const BASIC_MEMBERSHIP_AMOUNT = 2500
export const BASIC_MEMBERSHIP_DAYS = 1000

export function getBasicMembershipExpiry(from: Date) {
  const expiresAt = new Date(from)
  expiresAt.setDate(expiresAt.getDate() + BASIC_MEMBERSHIP_DAYS)
  return expiresAt
}

export async function ensureBasicMembershipPlan() {
  return prisma.membershipPlan.upsert({
    where: { name: 'Basic Membership' },
    update: {
      price: BASIC_MEMBERSHIP_AMOUNT,
      durationDays: BASIC_MEMBERSHIP_DAYS,
      isActive: true,
    },
    create: {
      name: 'Basic Membership',
      price: BASIC_MEMBERSHIP_AMOUNT,
      durationDays: BASIC_MEMBERSHIP_DAYS,
      depositBonus: 0,
      referralLevel1: 10,
      referralLevel2: 0,
      referralLevel3: 0,
      withdrawalTime: '24-48 Hours',
      support: 'Basic Support',
      features: [
        'Deposit Amount: Rs. 2,500',
        'Validity: 1,000 Days',
        'Daily yield credited to wallet',
      ],
      color: '#10B981',
      isActive: true,
    },
  })
}

export async function creditDueBasicDailyYield(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      memberType: true,
      basicMembershipAmount: true,
      basicMembershipActivatedAt: true,
      basicMembershipExpiresAt: true,
      lastDailyYieldAt: true,
    },
  })

  if (
    !user ||
    user.memberType !== 'BASIC' ||
    user.basicMembershipAmount <= 0 ||
    !user.basicMembershipActivatedAt
  ) {
    return
  }

  const now = new Date()
  if (user.basicMembershipExpiresAt && user.basicMembershipExpiresAt <= now) return

  const lastYieldAt = user.lastDailyYieldAt || user.basicMembershipActivatedAt
  const elapsedDays = Math.floor((startOfDay(now).getTime() - startOfDay(lastYieldAt).getTime()) / 86400000)
  if (elapsedDays <= 0) return

  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  })
  const dailyPercent = settings.basicDailyYieldPercent ?? 0.2
  const creditAmount = Number(((user.basicMembershipAmount * dailyPercent) / 100 * elapsedDays).toFixed(2))
  if (creditAmount <= 0) return

  await prisma.$transaction(async (tx) => {
    await tx.wallet.upsert({
      where: { userId },
      update: {
        rewardBalance: { increment: creditAmount },
        mainBalance: { increment: creditAmount },
      },
      create: {
        userId,
        rewardBalance: creditAmount,
        mainBalance: creditAmount,
      },
    })

    await tx.transaction.create({
      data: {
        userId,
        type: 'PROFIT',
        amount: creditAmount,
        status: 'COMPLETED',
        walletType: 'REWARD',
        description: `Basic Membership daily yield (${dailyPercent}% x ${elapsedDays} day${elapsedDays > 1 ? 's' : ''})`,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: { lastDailyYieldAt: now },
    })
  })
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
