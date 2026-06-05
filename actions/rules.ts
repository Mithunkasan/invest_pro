'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { syncWalletMainBalance } from './walletUtils'

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

    // Count referred users who have at least one active investment
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

    // Parse the configured percentages
    const percentageString = settings.referralCommissionStructure || '10,5,3'
    const levelPercentages = percentageString
      .split(',')
      .map(p => Number(p.trim()))
      .filter(p => !isNaN(p))

    let currentReferrerId: string | null = investor.referredById
    const referralUpdates: { referrerId: string; amount: number; level: number }[] = []

    for (let index = 0; index < levelPercentages.length; index++) {
      if (!currentReferrerId) break

      const percentage = levelPercentages[index]
      const level = index + 1

      const referrer = (await prisma.user.findUnique({
        where: { id: currentReferrerId },
        select: { id: true, name: true, referredById: true }
      })) as any
      if (!referrer) break

      if (percentage > 0) {
        const commissionAmount = (investmentAmount * percentage) / 100
        const balanceField = level === 1 ? 'referralBalance' : 'levelBalance'
        const walletEnum = level === 1 ? 'REFERRAL' : 'LEVEL'
        const txType = level === 1 ? 'REFERRAL_BONUS' : 'LEVEL_INCOME'

        await prisma.$transaction([
          // Credit the commission to the referrer's balance
          prisma.wallet.update({
            where: { userId: referrer.id },
            data: { [balanceField]: { increment: commissionAmount } }
          }),
          // Create a transaction record
          prisma.transaction.create({
            data: {
              userId: referrer.id,
              type: txType,
              amount: commissionAmount,
              status: 'COMPLETED',
              reference: investmentId,
              description: level === 1
                ? `Level ${level} referral commission from ${investor.name}'s investment`
                : `Level ${level} level income from ${investor.name}'s investment`,
              walletType: walletEnum
            }
          }),
          // Create user notification
          prisma.notification.create({
            data: {
              userId: referrer.id,
              title: level === 1 ? 'Referral Commission Received 👥' : 'Level Income Received 📈',
              message: `You earned ₹${commissionAmount.toLocaleString('en-IN')} Level ${level} ${level === 1 ? 'referral commission' : 'level income'} from ${investor.name}'s investment.`,
              type: 'SUCCESS'
            }
          })
        ])

        // Find or create a Referral record to track this specific commission at this level
        const referralRecord = await prisma.referral.findFirst({
          where: { referrerId: referrer.id, referredId: investorId }
        })
        if (referralRecord) {
          await prisma.referral.update({
            where: { id: referralRecord.id },
            data: { commission: { increment: commissionAmount }, level: level }
          })
        } else {
          await prisma.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: investorId,
              commission: commissionAmount,
              level: level
            }
          })
        }

        referralUpdates.push({ referrerId: referrer.id, amount: commissionAmount, level })
      }

      // Move to the next parent referrer in the chain
      currentReferrerId = referrer.referredById
    }

    // Sync main balances and run badge checks for all referrers who got commissions
    for (const update of referralUpdates) {
      await syncWalletMainBalance(prisma, update.referrerId)
      await checkAndApplyPerformanceBadges(update.referrerId)
      await checkAndApplyTLRank(update.referrerId)
    }
  } catch (error) {
    console.error('Error distributing referral commissions:', error)
  }
}
