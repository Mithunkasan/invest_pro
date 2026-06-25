'use server'

import { prisma } from '@/lib/prisma'
import { distributeReferralAndLevelCommissions } from './rules'

export async function distributeGiftCommissionsForDeliveredGift(giftId: string) {
  const gift = await prisma.gift.findUnique({
    where: { id: giftId },
    select: { id: true, userId: true, createdAt: true },
  })
  if (!gift) return []

  const previousDeliveredGift = await prisma.gift.findFirst({
    where: {
      userId: gift.userId,
      id: { not: gift.id },
      deliveryStatus: 'DELIVERED',
      createdAt: { lt: gift.createdAt },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  if (!previousDeliveredGift) return []

  const approvedGiftDeposit = await prisma.giftDeposit.findFirst({
    where: {
      userId: gift.userId,
      status: 'APPROVED',
      amount: { gt: 0 },
      createdAt: {
        gt: previousDeliveredGift.createdAt,
        lte: gift.createdAt,
      },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, amount: true },
  })
  if (!approvedGiftDeposit) return []

  return distributeReferralAndLevelCommissions(
    gift.userId,
    approvedGiftDeposit.amount,
    approvedGiftDeposit.id,
    'GIFT'
  )
}
