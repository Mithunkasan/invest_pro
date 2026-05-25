'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ── Check and Apply Star Performer Badge ─────────────────────────────────────
export async function checkStarPerformer(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings || !settings.starPerformerEnabled) return

    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return

    if (wallet.mainBalance >= settings.starPerformerThreshold) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user && !user.starPerformer) {
        await prisma.user.update({
          where: { id: userId },
          data: { starPerformer: true },
        })
        await prisma.notification.create({
          data: {
            userId,
            title: '⭐ Star Performer Badge! ⭐',
            message: `Congratulations! Your Main Wallet balance has reached ₹${wallet.mainBalance.toLocaleString('en-IN')}, and you have been awarded the Star Performer status.`,
            type: 'SUCCESS',
          },
        })
      }
    }
  } catch (error) {
    console.error('Error checking Star Performer status:', error)
  }
}

// ── Check and Apply TL Rank ──────────────────────────────────────────────────
export async function checkAndApplyTLRank(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings || !settings.tlRankEnabled) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.tlRank) return

    // Count referred users who have at least one active investment
    const activeReferralsCount = await prisma.user.count({
      where: {
        referredById: userId,
        investments: {
          some: { status: 'ACTIVE' }
        }
      }
    })

    if (activeReferralsCount >= settings.tlRankRequiredReferrals) {
      // Check total users who automatically/manually earned TL Rank
      const tlRankedCount = await prisma.user.count({
        where: { tlRank: true }
      })

      if (tlRankedCount < settings.tlRankMaxUsers) {
        await prisma.user.update({
          where: { id: userId },
          data: { tlRank: true, tlRankEarnedAt: new Date() },
        })
        await prisma.notification.create({
          data: {
            userId,
            title: '🏆 Promoted to TL Rank! 🏆',
            message: `Congratulations! You have referred ${activeReferralsCount} active members and are promoted to TL Rank!`,
            type: 'SUCCESS',
          },
        })
      }
    }
  } catch (error) {
    console.error('Error checking TL Rank status:', error)
  }
}

// ── Distribute Referral & Level Income Commissions ───────────────────────────
export async function distributeReferralAndLevelCommissions(
  investorId: string,
  investmentAmount: number,
  investmentId: string
) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings) return

    const investor = await prisma.user.findUnique({
      where: { id: investorId },
      select: { name: true, referredById: true }
    })
    if (!investor || !investor.referredById) return

    // 1. Direct Referral Income
    const directReferrerId = investor.referredById
    const referralCommission = (investmentAmount * settings.referralPercent) / 100

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: directReferrerId },
        data: { referralBalance: { increment: referralCommission } }
      }),
      prisma.transaction.create({
        data: {
          userId: directReferrerId,
          type: 'REFERRAL_BONUS',
          amount: referralCommission,
          status: 'COMPLETED',
          reference: investmentId,
          description: `Referral income from ${investor.name}'s investment`,
          walletType: 'REFERRAL'
        }
      }),
      prisma.notification.create({
        data: {
          userId: directReferrerId,
          title: 'Referral Income Received 👥',
          message: `You earned ₹${referralCommission.toLocaleString('en-IN')} referral commission from ${investor.name}'s investment.`,
          type: 'SUCCESS'
        }
      })
    ])

    // Update referral model record
    const referralRecord = await prisma.referral.findFirst({
      where: { referrerId: directReferrerId, referredId: investorId }
    })
    if (referralRecord) {
      await prisma.referral.update({
        where: { id: referralRecord.id },
        data: { commission: { increment: referralCommission } }
      })
    }

    // Check TL Rank for the direct referrer
    await checkAndApplyTLRank(directReferrerId)

    // 2. Recursive Level Income (Level 1, Level 2, Level 3)
    if (settings.levelIncomeEnabled) {
      let currentReferrerId: string | null = investor.referredById
      const levelPercentages = [settings.level1Percent, settings.level2Percent, settings.level3Percent]

      for (let level = 1; level <= 3; level++) {
        if (!currentReferrerId) break

        const parentReferrer = (await prisma.user.findUnique({
          where: { id: currentReferrerId },
          include: { membershipPlan: true }
        })) as any
        if (!parentReferrer) break

        // Determine Level Commission based on Referrer's active membership plan
        let commissionPercent = 0
        if (parentReferrer.membershipPlan) {
          if (level === 1) commissionPercent = parentReferrer.membershipPlan.referralLevel1
          else if (level === 2) commissionPercent = parentReferrer.membershipPlan.referralLevel2
          else if (level === 3) commissionPercent = parentReferrer.membershipPlan.referralLevel3
        } else {
          // Fallback to system settings for Level 1, but Level 2 & 3 require an active membership plan by default
          if (level === 1) commissionPercent = settings.referralPercent || 10
          else commissionPercent = 0
        }

        // If the percentage is 0 or less, they are ineligible for this level's commission
        if (commissionPercent <= 0) {
          currentReferrerId = parentReferrer.referredById || null
          continue
        }

        const levelCommission = (investmentAmount * commissionPercent) / 100

        await prisma.$transaction([
          prisma.wallet.update({
            where: { userId: parentReferrer.id },
            data: { levelBalance: { increment: levelCommission } }
          }),
          prisma.transaction.create({
            data: {
              userId: parentReferrer.id,
              type: 'LEVEL_INCOME',
              amount: levelCommission,
              status: 'COMPLETED',
              reference: investmentId,
              description: `Level ${level} income from ${investor.name}'s investment`,
              walletType: 'LEVEL'
            }
          }),
          prisma.notification.create({
            data: {
              userId: parentReferrer.id,
              title: `Level ${level} Income Received 📈`,
              message: `You earned ₹${levelCommission.toLocaleString('en-IN')} level ${level} income from ${investor.name}'s investment.`,
              type: 'SUCCESS'
            }
          })
        ])

        // Add a helper referral tracking record for levels > 1
        if (level > 1) {
          await prisma.referral.create({
            data: {
              referrerId: parentReferrer.id,
              referredId: investorId,
              commission: levelCommission,
              level: level
            }
          })
        }

        // Trigger TL Rank check for each level referrer
        await checkAndApplyTLRank(parentReferrer.id)

        // Go to next parent in tree
        currentReferrerId = parentReferrer.referredById || null
      }
    }
  } catch (error) {
    console.error('Error distributing referral & level commissions:', error)
  }
}
