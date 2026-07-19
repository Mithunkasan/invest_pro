import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getTimeWallConfig, TIMEWALL_REFERENCE_PREFIX } from '@/lib/timewall'
import { isUplineEligibleForLevel } from '@/lib/referralEligibility'

export const dynamic = 'force-dynamic'

const TIMEWALL_TRANSACTION_ATTEMPTS = 3
const TIMEWALL_TRANSACTION_MAX_WAIT_MS = 10_000
const TIMEWALL_TRANSACTION_TIMEOUT_MS = 30_000

function isRetryableTimeWallTransactionError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError
    && (error.code === 'P2028' || error.code === 'P2034')
}

// ── Local helpers (not Server Actions — tx must stay in-process) ────────────
// NOTE: syncWalletMainBalance and distributeTimeWallReferralCommission are
// intentionally duplicated here from their 'use server' action files.
// Passing a Prisma transaction object (tx) across a 'use server' boundary
// causes argument serialization to fail at runtime → HTTP 500.
// By declaring them as plain local functions in this Route Handler,
// the tx is passed by reference within the same process.

async function syncWalletMainBalance(tx: Prisma.TransactionClient, userId: string) {
  const wallet = await tx.wallet.findUnique({ where: { userId } })
  if (!wallet) return
  const newMainBalance =
    (wallet.rewardBalance || 0) +
    (wallet.referralBalance || 0) +
    (wallet.levelBalance || 0) +
    (wallet.shareBalance || 0) +
    (wallet.bonusBalance || 0) +
    (wallet.taskBalance || 0)
  await tx.wallet.update({ where: { userId }, data: { mainBalance: newMainBalance } })
}

async function distributeTimeWallReferralCommission(
  tx: Prisma.TransactionClient,
  purchaserId: string,
  userAmount: number,
  timeWallTransactionId: string,
  purchaserName: string
): Promise<string[]> {
  if (!Number.isFinite(userAmount) || userAmount <= 0) return []

  const settings = await tx.systemSettings.findUnique({ where: { id: 'default' } })
  if (!settings) return []

  const levelPercentages = (settings.timeWallReferralCommissionStructure || '10,5,3')
    .split(',')
    .map((p: string) => Number(p.trim()))
    .map((p: number) => (Number.isFinite(p) && p > 0 ? p : 0))

  const credited = new Set<string>()
  const visitedUserIds = new Set<string>([purchaserId])

  const purchaser = await tx.user.findUnique({
    where: { id: purchaserId },
    select: { referredById: true },
  })
  if (!purchaser?.referredById) return []

  let currentReferrerId: string | null = purchaser.referredById

  for (let index = 0; index < levelPercentages.length && currentReferrerId; index++) {
    const level = index + 1
    const percentage = levelPercentages[index]
    const referrer: { id: string; referredById: string | null } | null = await tx.user.findUnique({
      where: { id: currentReferrerId },
      select: { id: true, referredById: true },
    })
    if (!referrer || visitedUserIds.has(referrer.id)) break

    visitedUserIds.add(referrer.id)
    currentReferrerId = referrer.referredById
    if (percentage === 0) continue

    let activatedDirectReferralCount = 0
    if (level > 1) {
      activatedDirectReferralCount = await tx.user.count({
        where: {
          referredById: referrer.id,
          OR: [
            { membershipPlanActivatedAt: { not: null }, membershipPlan: { price: { gt: 0 } } },
            { basicMembershipActivatedAt: { not: null }, basicMembershipAmount: { gt: 0 } },
          ],
        },
      })
    }
    if (!isUplineEligibleForLevel(level, activatedDirectReferralCount)) continue

    const commissionAmount = Number(((userAmount * percentage) / 100).toFixed(2))
    if (commissionAmount <= 0) continue

    const reference = `REFERRAL_COMMISSION:TIMEWALL:${timeWallTransactionId}:L${level}`

    const alreadyCredited = await tx.transaction.findFirst({
      where: { userId: referrer.id, type: 'REFERRAL_BONUS', walletType: 'REFERRAL', reference },
      select: { id: true },
    })
    if (alreadyCredited) {
      credited.add(referrer.id)
      continue
    }

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
        description: `Upline Level ${level} (${percentage}%) commission from ${purchaserName}'s TimeWall earnings`,
        walletType: 'REFERRAL',
      },
    })

    await tx.notification.create({
      data: {
        userId: referrer.id,
        title: `TimeWall Referral Commission Received`,
        message: `You earned ₹${commissionAmount.toLocaleString('en-IN')} (${percentage}%) from ${purchaserName}'s TimeWall earnings. It was credited to your Referral Wallet.`,
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

    credited.add(referrer.id)
  }

  return [...credited]
}

// ── Param helpers ───────────────────────────────────────────────────────────

async function checkAndApplyPerformanceBadges(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    const referralIncome = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commission: true },
    })
    const totalCommission = referralIncome._sum.commission || 0

    if (settings.starPerformerEnabled && totalCommission >= settings.starPerformerThreshold && !user.starPerformer) {
      await prisma.user.update({ where: { id: userId }, data: { starPerformer: true } })
      await prisma.notification.create({
        data: {
          userId,
          title: 'Star Performer Badge!',
          message: `Congratulations! Your referral earnings have reached Rs. ${totalCommission.toLocaleString('en-IN')}, and you have been awarded the Star Performer status.`,
          type: 'SUCCESS',
        },
      })
    }

    if (settings.doubleStarEnabled && totalCommission >= settings.doubleStarThreshold && !user.doubleStarPerformer) {
      await prisma.user.update({ where: { id: userId }, data: { doubleStarPerformer: true } })
      await prisma.notification.create({
        data: {
          userId,
          title: 'Double Star Performer!',
          message: `Congratulations! Your referral earnings have reached Rs. ${totalCommission.toLocaleString('en-IN')}, and you have been awarded the Double Star Performer status.`,
          type: 'SUCCESS',
        },
      })
    }

    if (settings.eliteEnabled && totalCommission >= settings.eliteThreshold && !user.elitePerformer) {
      await prisma.user.update({ where: { id: userId }, data: { elitePerformer: true } })
      await prisma.notification.create({
        data: {
          userId,
          title: 'Elite Performer Badge!',
          message: `Congratulations! Your referral earnings have reached Rs. ${totalCommission.toLocaleString('en-IN')}, and you have been awarded the Elite Performer status.`,
          type: 'SUCCESS',
        },
      })
    }
  } catch (error) {
    console.error('Error checking TimeWall Performance Badges status:', error)
  }
}

async function checkAndApplyTLRank(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings || !settings.tlRankEnabled) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.tlRank) return

    const activeReferralsCount = await prisma.user.count({
      where: {
        referredById: userId,
        investments: { some: { status: 'ACTIVE' } },
      },
    })

    const referralIncome = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commission: true },
    })
    const totalCommission = referralIncome._sum.commission || 0

    if (activeReferralsCount >= settings.tlRankRequiredReferrals && totalCommission >= settings.tlRankRequiredCommission) {
      const tlShareholdersCount = await prisma.user.count({ where: { tlShareholder: true } })
      const isEligibleShareholder = tlShareholdersCount < settings.tlRankMaxUsers

      await prisma.user.update({
        where: { id: userId },
        data: {
          tlRank: true,
          tlRankEarnedAt: new Date(),
          tlShareholder: isEligibleShareholder,
        },
      })

      await prisma.notification.create({
        data: {
          userId,
          title: 'Promoted to TL Rank!',
          message: `Congratulations! You have referred ${activeReferralsCount} active members and earned Rs. ${totalCommission.toLocaleString('en-IN')} in commissions. You are promoted to TL Rank!${isEligibleShareholder ? ' You are also selected as a 1% Business Shareholder!' : ''}`,
          type: 'SUCCESS',
        },
      })

      if (user.referredById) {
        await checkAndApplyDirectorRank(user.referredById)
      }
    }
  } catch (error) {
    console.error('Error checking TimeWall TL Rank status:', error)
  }
}

async function checkAndApplyDirectorRank(userId: string) {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings || !settings.directorRankEnabled) return

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.directorRank) return

    const tlReferralsCount = await prisma.user.count({
      where: {
        referredById: userId,
        tlRank: true,
      },
    })

    if (tlReferralsCount >= settings.directorRankRequiredTLs) {
      const directorShareholdersCount = await prisma.user.count({ where: { directorShareholder: true } })
      const isEligibleShareholder = directorShareholdersCount < settings.directorRankMaxUsers

      await prisma.user.update({
        where: { id: userId },
        data: {
          directorRank: true,
          directorRankEarnedAt: new Date(),
          directorShareholder: isEligibleShareholder,
        },
      })

      await prisma.notification.create({
        data: {
          userId,
          title: 'Promoted to Director Rank!',
          message: `Congratulations! You have successfully referred ${tlReferralsCount} Team Leaders and are promoted to Director Rank!${isEligibleShareholder ? ' You are also selected as a 1% Business Shareholder!' : ''}`,
          type: 'SUCCESS',
        },
      })
    }
  } catch (error) {
    console.error('Error checking TimeWall Director Rank status:', error)
  }
}

async function runTimeWallCreditTransaction(
  userId: string,
  userName: string,
  userAmount: number,
  reference: string
) {
  let lastError: unknown

  for (let attempt = 1; attempt <= TIMEWALL_TRANSACTION_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const timeWallTx = await tx.transaction.create({
          data: {
            userId,
            type: 'BONUS',
            amount: userAmount,
            status: 'COMPLETED',
            walletType: 'TASK',
            reference,
            description: `TimeWall Reward: ₹${userAmount.toFixed(2)}`,
          },
        })

        await tx.wallet.upsert({
          where: { userId },
          update: {
            mainBalance: { increment: userAmount },
            taskBalance: { increment: userAmount },
            totalEarned: { increment: userAmount },
          },
          create: {
            userId,
            mainBalance: userAmount,
            taskBalance: userAmount,
            totalEarned: userAmount,
          },
        })

        const referrerIds = await distributeTimeWallReferralCommission(
          tx,
          userId,
          userAmount,
          timeWallTx.id,
          userName
        )

        await syncWalletMainBalance(tx, userId)

        await tx.notification.create({
          data: {
            userId,
            title: 'TimeWall Reward',
            message: `TimeWall reward: ₹${userAmount.toFixed(2)}`,
            type: 'SUCCESS',
            link: '/dashboard/wallet',
          },
        })

        return referrerIds
      }, {
        maxWait: TIMEWALL_TRANSACTION_MAX_WAIT_MS,
        timeout: TIMEWALL_TRANSACTION_TIMEOUT_MS,
      })
    } catch (error) {
      lastError = error
      if (!isRetryableTimeWallTransactionError(error) || attempt === TIMEWALL_TRANSACTION_ATTEMPTS) {
        break
      }
    }
  }

  throw lastError
}

function firstValue(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key)
    if (value) return value
  }
  return ''
}

async function parseParams(request: NextRequest) {
  const params = new URL(request.url).searchParams

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => null)
      if (body && typeof body === 'object') {
        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined && value !== null) params.set(key, String(value))
        }
      }
    } else {
      const form = await request.formData().catch(() => null)
      form?.forEach((value, key) => params.set(key, String(value)))
    }
  }

  return params
}

// ── Main handler ────────────────────────────────────────────────────────────

async function handlePostback(request: NextRequest) {
  const params = await parseParams(request)
  const config = await getTimeWallConfig()

  const providedSecret = firstValue(params, ['secret', 'key', 'api_key', 'token'])
  if (config.postbackSecret && providedSecret !== config.postbackSecret) {
    return new Response('Invalid postback secret', { status: 401 })
  }

  const userId = firstValue(params, [
    'user_id', 'userid', 'userId',
    'external_user_id', 'externalUserId', 'externaluserid',
    'sub_id', 'subid', 'subId',
    's1', 'uid', 'custom', 'user',
  ])

  // Extract TimeWall points. We must NOT calculate the reward using the USD payout.
  let rawPoints =
    params.get('points') ||
    params.get('currency_amount') ||
    params.get('currencyAmount') ||
    params.get('currencyamount') ||
    params.get('placement_currency_amount') ||
    params.get('placementCurrencyAmount') ||
    params.get('placementcurrencyamount') ||
    params.get('rate_points') ||
    params.get('ratePoints') ||
    params.get('ratepoints')

  if (!rawPoints && params.get('amount')) {
    const amountVal = Number(params.get('amount'))
    const payoutVal = params.get('payout') ? Number(params.get('payout')) : null
    if (payoutVal !== null && amountVal !== payoutVal) {
      rawPoints = params.get('amount')
    } else if (amountVal >= 1) {
      rawPoints = params.get('amount')
    } else {
      rawPoints = String(Math.round(amountVal * 10000))
    }
  }
  if (!rawPoints && params.get('reward')) {
    const rewardVal = Number(params.get('reward'))
    const payoutVal = params.get('payout') ? Number(params.get('payout')) : null
    if (payoutVal !== null && rewardVal !== payoutVal) {
      rawPoints = params.get('reward')
    } else if (rewardVal >= 1) {
      rawPoints = params.get('reward')
    } else {
      rawPoints = String(Math.round(rewardVal * 10000))
    }
  }

  let points = Number(rawPoints)
  if (Number.isFinite(points) && points > 0 && points < 1) {
    points = Math.round(points * 10000)
  }

  const externalTransactionId = firstValue(params, [
    'transaction_id', 'transactionId', 'txid', 'tx_id',
    'id', 'withdraw_id', 'withdrawId', 'withdrawid',
  ])

  if (!userId || !Number.isFinite(points) || points <= 0) {
    return new Response('Invalid user or points', { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      membershipPlanId: true,
      membershipPlan: { select: { price: true, timeWallPercent: true } },
    },
  })
  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const referenceId = externalTransactionId || `${userId}:${points}:${Date.now()}`
  const reference = `${TIMEWALL_REFERENCE_PREFIX}${referenceId}`
  const existing = await prisma.transaction.findFirst({ where: { reference } })
  if (existing) {
    return new Response('1', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: { timeWallPercentFree: true },
  })
  const timeWallPercentFree = systemSettings?.timeWallPercentFree ?? 0.005

  const isFree = !user.membershipPlan || user.membershipPlan.price === 0
  const configuredMultiplier = isFree
    ? timeWallPercentFree
    : (user.membershipPlan?.timeWallPercent ?? 0.005)

  const userAmount = points * configuredMultiplier

  const creditedReferrerIds = await runTimeWallCreditTransaction(
    userId,
    user.name,
    userAmount,
    reference
  )

  for (const referrerId of creditedReferrerIds) {
    await checkAndApplyPerformanceBadges(referrerId)
    await checkAndApplyTLRank(referrerId)
  }

  return new Response('1', { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

export async function GET(request: NextRequest) {
  return handlePostback(request)
}

export async function POST(request: NextRequest) {
  return handlePostback(request)
}
