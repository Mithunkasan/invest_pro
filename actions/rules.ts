'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { isUplineEligibleForLevel } from '@/lib/referralEligibility'

type ReferralCommissionSource = 'MEMBERSHIP' | 'GIFT'

const COMMISSION_TRANSACTION_ATTEMPTS = 3
const COMMISSION_TRANSACTION_MAX_WAIT_MS = 10_000
const COMMISSION_TRANSACTION_TIMEOUT_MS = 30_000

function isRetryableCommissionTransactionError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError
    && (error.code === 'P2028' || error.code === 'P2034')
}

// ── Check and Apply Performance Badges ─────────────────────────────────────────
export async function checkAndApplyPerformanceBadges(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    // Sum up referral commission earnings
    const referralIncome = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commission: true }
    })
    const totalCommission = referralIncome._sum.commission || 0

    // 1. Star Performer Check
    if (settings.starPerformerEnabled && totalCommission >= settings.starPerformerThreshold && !user.starPerformer) {
      await prisma.user.update({
        where: { id: userId },
        data: { starPerformer: true },
      })
      await prisma.notification.create({
        data: {
          userId,
          title: '⭐ Star Performer Badge! ⭐',
          message: `Congratulations! Your referral earnings have reached ₹${totalCommission.toLocaleString('en-IN')}, and you have been awarded the Star Performer status.`,
          type: 'SUCCESS',
        },
      })
    }

    // 2. Double Star Performer Check
    if (settings.doubleStarEnabled && totalCommission >= settings.doubleStarThreshold && !user.doubleStarPerformer) {
      await prisma.user.update({
        where: { id: userId },
        data: { doubleStarPerformer: true },
      })
      await prisma.notification.create({
        data: {
          userId,
          title: '⭐⭐ Double Star Performer! ⭐⭐',
          message: `Congratulations! Your referral earnings have reached ₹${totalCommission.toLocaleString('en-IN')}, and you have been awarded the Double Star Performer status.`,
          type: 'SUCCESS',
        },
      })
    }

    // 3. Elite Performer Check
    if (settings.eliteEnabled && totalCommission >= settings.eliteThreshold && !user.elitePerformer) {
      await prisma.user.update({
        where: { id: userId },
        data: { elitePerformer: true },
      })
      await prisma.notification.create({
        data: {
          userId,
          title: '💎 Elite Performer Badge! 💎',
          message: `Congratulations! Your referral earnings have reached ₹${totalCommission.toLocaleString('en-IN')}, and you have been awarded the Elite Performer status.`,
          type: 'SUCCESS',
        },
      })
    }
  } catch (error) {
    console.error('Error checking Performance Badges status:', error)
  }
}

// ── Check and Apply TL Rank ──────────────────────────────────────────────────
export async function checkAndApplyTLRank(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings || !settings.tlRankEnabled) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.tlRank) return

    // Count referred users who have at least one active Smart Hybrid Digital Earning
    const activeReferralsCount = await prisma.user.count({
      where: {
        referredById: userId,
        investments: {
          some: { status: 'ACTIVE' }
        }
      }
    })

    // Sum up referral commission earnings
    const referralIncome = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commission: true }
    })
    const totalCommission = referralIncome._sum.commission || 0

    if (activeReferralsCount >= settings.tlRankRequiredReferrals && totalCommission >= settings.tlRankRequiredCommission) {
      // Check if they qualify to be a shareholder (first 25 users)
      const tlShareholdersCount = await prisma.user.count({
        where: { tlShareholder: true }
      })

      const isEligibleShareholder = tlShareholdersCount < settings.tlRankMaxUsers

      await prisma.user.update({
        where: { id: userId },
        data: { 
          tlRank: true, 
          tlRankEarnedAt: new Date(),
          tlShareholder: isEligibleShareholder
        },
      })

      await prisma.notification.create({
        data: {
          userId,
          title: '🏆 Promoted to TL Rank! 🏆',
          message: `Congratulations! You have referred ${activeReferralsCount} active members and earned ₹${totalCommission.toLocaleString('en-IN')} in commissions. You are promoted to TL Rank!${isEligibleShareholder ? ' You are also selected as a 1% Business Shareholder! 📊' : ''}`,
          type: 'SUCCESS',
        },
      })

      // Trigger Director Rank check for their referrer
      if (user.referredById) {
        await checkAndApplyDirectorRank(user.referredById)
      }
    }
  } catch (error) {
    console.error('Error checking TL Rank status:', error)
  }
}

// ── Check and Apply Director Rank ──────────────────────────────────────────
export async function checkAndApplyDirectorRank(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings || !settings.directorRankEnabled) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.directorRank) return

    // Count referred users who have achieved TL Rank
    const tlReferralsCount = await prisma.user.count({
      where: {
        referredById: userId,
        tlRank: true
      }
    })

    if (tlReferralsCount >= settings.directorRankRequiredTLs) {
      // Check if they qualify to be a shareholder (first 5 users)
      const directorShareholdersCount = await prisma.user.count({
        where: { directorShareholder: true }
      })

      const isEligibleShareholder = directorShareholdersCount < settings.directorRankMaxUsers

      await prisma.user.update({
        where: { id: userId },
        data: {
          directorRank: true,
          directorRankEarnedAt: new Date(),
          directorShareholder: isEligibleShareholder
        }
      })

      await prisma.notification.create({
        data: {
          userId,
          title: '👑 Promoted to Director Rank! 👑',
          message: `Congratulations! You have successfully referred ${tlReferralsCount} Team Leaders and are promoted to Director Rank!${isEligibleShareholder ? ' You are also selected as a 1% Business Shareholder! 📊' : ''}`,
          type: 'SUCCESS',
        }
      })
    }
  } catch (error) {
    console.error('Error checking Director Rank status:', error)
  }
}

// ── Distribute Referral & Level Income Commissions ───────────────────────────
export async function distributeReferralAndLevelCommissions(
  purchaserId: string,
  baseAmount: number,
  sourceId: string,
  source: ReferralCommissionSource = 'MEMBERSHIP'
) {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) return

  const [settings, purchaser] = await Promise.all([
    prisma.systemSettings.findUnique({ where: { id: 'default' } }),
    prisma.user.findUnique({
      where: { id: purchaserId },
      select: { name: true, referredById: true },
    }),
  ])
  if (!settings || !purchaser?.referredById) return []

  // Never trust values supplied to a Server Function. Resolve the approved
  // business event from the database and use its authoritative amount.
  let commissionBaseAmount: number | null = null
  if (source === 'MEMBERSHIP') {
    const [upgrade, activation] = await Promise.all([
      prisma.membershipUpgradeRequest.findFirst({
        where: {
          id: sourceId,
          userId: purchaserId,
          status: 'APPROVED',
          plan: { price: { gt: 0 } },
        },
        select: { plan: { select: { price: true } } },
      }),
      prisma.transaction.findFirst({
        where: {
          id: sourceId,
          userId: purchaserId,
          type: 'INVESTMENT',
          status: 'COMPLETED',
          amount: { gt: 0 },
          OR: [
            { description: { startsWith: 'Activated ' } },
            { description: 'Basic Membership activated after KYC approval' },
          ],
        },
        select: { amount: true },
      }),
    ])
    commissionBaseAmount = upgrade?.plan.price ?? activation?.amount ?? null
  } else {
    const giftDeposit = await prisma.giftDeposit.findFirst({
      where: {
        id: sourceId,
        userId: purchaserId,
        status: 'APPROVED',
        amount: { gt: 0 },
      },
      select: { amount: true },
    })
    commissionBaseAmount = giftDeposit?.amount ?? null
  }

  if (commissionBaseAmount === null) {
    throw new Error('Invalid or unapproved referral commission source')
  }
  if (Math.abs(commissionBaseAmount - baseAmount) > 0.005) {
    throw new Error('Referral commission amount does not match its approved source')
  }

  const levelPercentages = (settings.referralCommissionStructure || '10,5,3')
    .split(',')
    .map((percentage) => Number(percentage.trim()))
    .map((percentage) => Number.isFinite(percentage) && percentage > 0 ? percentage : 0)

  const credited = new Set<string>()
  const visitedUserIds = new Set<string>([purchaserId])
  let currentReferrerId: string | null = purchaser.referredById

  for (let index = 0; index < levelPercentages.length && currentReferrerId; index++) {
    const level = index + 1
    const percentage = levelPercentages[index]
    const referrer: { id: string; referredById: string | null } | null = await prisma.user.findUnique({
      where: { id: currentReferrerId },
      select: { id: true, referredById: true },
    })
    if (!referrer || visitedUserIds.has(referrer.id)) break

    visitedUserIds.add(referrer.id)
    currentReferrerId = referrer.referredById
    if (percentage === 0) continue

    let activatedDirectReferralCount = 0
    if (level > 1) {
      activatedDirectReferralCount = await prisma.user.count({
        where: {
          referredById: referrer.id,
          OR: [
            {
              membershipPlanActivatedAt: { not: null },
              membershipPlan: { price: { gt: 0 } },
            },
            {
              basicMembershipActivatedAt: { not: null },
              basicMembershipAmount: { gt: 0 },
            },
          ],
        },
      })
    }
    if (!isUplineEligibleForLevel(level, activatedDirectReferralCount)) continue

    const commissionAmount = Number(((commissionBaseAmount * percentage) / 100).toFixed(2))
    if (commissionAmount <= 0) continue

    const reference = `REFERRAL_COMMISSION:${source}:${sourceId}:L${level}`
    const sourceLabel = source === 'GIFT' ? 'gift purchase' : 'membership activation'
    let wasCredited = false

    // Keep each upline credit in its own short transaction. A long referral
    // chain can no longer expire one transaction while later levels are paid.
    for (let attempt = 1; attempt <= COMMISSION_TRANSACTION_ATTEMPTS; attempt++) {
      try {
        wasCredited = await prisma.$transaction(async (tx) => {
          const alreadyCredited = await tx.transaction.findFirst({
            where: {
              userId: referrer.id,
              type: 'REFERRAL_BONUS',
              walletType: 'REFERRAL',
              reference,
            },
            select: { id: true },
          })
          if (alreadyCredited) return false

          await tx.wallet.upsert({
            where: { userId: referrer.id },
            update: {
              mainBalance: { increment: commissionAmount },
              referralBalance: { increment: commissionAmount },
              totalEarned: { increment: commissionAmount },
            },
            create: {
              userId: referrer.id,
              mainBalance: commissionAmount,
              referralBalance: commissionAmount,
              totalEarned: commissionAmount,
            },
          })

          await tx.transaction.create({
            data: {
              userId: referrer.id,
              type: 'REFERRAL_BONUS',
              amount: commissionAmount,
              status: 'COMPLETED',
              reference,
              description: `Upline Level ${level} (${percentage}%) commission from ${purchaser.name}'s ${sourceLabel}`,
              walletType: 'REFERRAL',
            },
          })
          await tx.notification.create({
            data: {
              userId: referrer.id,
              title: `Upline Level ${level} Commission Received`,
              message: `You earned ₹${commissionAmount.toLocaleString('en-IN')} (${percentage}%) from ${purchaser.name}'s ${sourceLabel}. It was credited to your Referral Wallet.`,
              type: 'SUCCESS',
            },
          })

          const referralRecord = await tx.referral.findFirst({
            where: { referrerId: referrer.id, referredId: purchaserId },
            select: { id: true },
          })
          if (referralRecord) {
            await tx.referral.update({
              where: { id: referralRecord.id },
              data: { commission: { increment: commissionAmount }, level },
            })
          } else {
            await tx.referral.create({
              data: {
                referrerId: referrer.id,
                referredId: purchaserId,
                commission: commissionAmount,
                level,
              },
            })
          }

          return true
        }, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: COMMISSION_TRANSACTION_MAX_WAIT_MS,
          timeout: COMMISSION_TRANSACTION_TIMEOUT_MS,
        })
        break
      } catch (error) {
        if (
          !isRetryableCommissionTransactionError(error)
          || attempt === COMMISSION_TRANSACTION_ATTEMPTS
        ) {
          throw error
        }
      }
    }

    if (wasCredited) credited.add(referrer.id)
  }

  const creditedReferrerIds = [...credited]

  for (const referrerId of creditedReferrerIds) {
    await checkAndApplyPerformanceBadges(referrerId)
    await checkAndApplyTLRank(referrerId)
  }

  return creditedReferrerIds
}
