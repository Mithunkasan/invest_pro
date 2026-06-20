'use server'

import { prisma } from '@/lib/prisma'

/**
 * Recalculates and updates the mainBalance of a user's wallet
 * to be the sum of: rewardBalance + referralBalance + levelBalance + shareBalance + bonusBalance
 * NOTE: depositBalance is intentionally excluded from mainBalance.
 */
export async function syncWalletMainBalance(tx: any, userId: string) {
  const wallet = await tx.wallet.findUnique({
    where: { userId },
  })
  if (!wallet) return

  const newMainBalance =
    (wallet.rewardBalance || 0) +
    (wallet.referralBalance || 0) +
    (wallet.levelBalance || 0) +
    (wallet.shareBalance || 0) +
    (wallet.bonusBalance || 0)

  await tx.wallet.update({
    where: { userId },
    data: { mainBalance: newMainBalance },
  })
}

/**
 * Increments the totalEarned (Total Wallet) for a user.
 * This is a permanent, cumulative counter that tracks all lifetime earnings.
 * It is NEVER decremented — not even on withdrawals.
 * Only earnings count: reward, referral, level, share, bonus.
 * Deposit funds are NOT earnings and must NOT be included.
 */
export async function incrementTotalEarned(tx: any, userId: string, amount: number) {
  if (!amount || amount <= 0) return
  await tx.wallet.update({
    where: { userId },
    data: { totalEarned: { increment: amount } },
  })
}

/**
 * Deducts a given amount from the user's Main Wallet sub-wallets in priority order,
 * ensuring no sub-wallet goes negative.
 * Priority order: rewardBalance, referralBalance, levelBalance, shareBalance, bonusBalance
 * NOTE: depositBalance is never touched here — it can only be used for membership activation.
 */
export async function deductFromWallets(tx: any, userId: string, amountToDeduct: number) {
  const wallet = await tx.wallet.findUnique({
    where: { userId },
  })
  if (!wallet) throw new Error('Wallet not found')

  let remaining = amountToDeduct
  const updates: any = {}
  const deductions: Record<string, number> = {}

  // 1. Reward
  if (remaining > 0 && wallet.rewardBalance > 0) {
    const deduct = Math.min(remaining, wallet.rewardBalance)
    updates.rewardBalance = { decrement: deduct }
    deductions.rewardBalance = deduct
    remaining -= deduct
  }

  // 2. Referral
  if (remaining > 0 && wallet.referralBalance > 0) {
    const deduct = Math.min(remaining, wallet.referralBalance)
    updates.referralBalance = { decrement: deduct }
    deductions.referralBalance = deduct
    remaining -= deduct
  }

  // 3. Level
  if (remaining > 0 && wallet.levelBalance > 0) {
    const deduct = Math.min(remaining, wallet.levelBalance)
    updates.levelBalance = { decrement: deduct }
    deductions.levelBalance = deduct
    remaining -= deduct
  }

  // 4. Share
  if (remaining > 0 && wallet.shareBalance > 0) {
    const deduct = Math.min(remaining, wallet.shareBalance)
    updates.shareBalance = { decrement: deduct }
    deductions.shareBalance = deduct
    remaining -= deduct
  }

  // 5. Bonus
  if (remaining > 0 && wallet.bonusBalance > 0) {
    const deduct = Math.min(remaining, wallet.bonusBalance)
    updates.bonusBalance = { decrement: deduct }
    deductions.bonusBalance = deduct
    remaining -= deduct
  }

  if (remaining > 0) {
    throw new Error('Insufficient total balance across all wallets')
  }

  if (Object.keys(updates).length > 0) {
    const balanceGuards = Object.fromEntries(
      Object.entries(deductions).map(([field, amount]) => [field, { gte: amount }])
    )
    const deduction = await tx.wallet.updateMany({
      where: { userId, ...balanceGuards },
      data: updates,
    })
    if (deduction.count !== 1) {
      throw new Error('Insufficient Main Wallet balance')
    }
  }

  // Recalculate mainBalance
  const updatedWallet = await tx.wallet.findUnique({
    where: { userId }
  })
  if (updatedWallet) {
    const newMainBalance =
      (updatedWallet.rewardBalance || 0) +
      (updatedWallet.referralBalance || 0) +
      (updatedWallet.levelBalance || 0) +
      (updatedWallet.shareBalance || 0) +
      (updatedWallet.bonusBalance || 0)

    await tx.wallet.update({
      where: { userId },
      data: { mainBalance: newMainBalance },
    })
  }

  return deductions
}

/**
 * Restores the exact earning-wallet amounts reserved for a rejected withdrawal.
 * Legacy withdrawals without a saved breakdown fall back to Reward Wallet.
 */
export async function refundWithdrawalToWallets(
  tx: any,
  userId: string,
  rawBreakdown: unknown,
  legacyAmount: number
) {
  const allowedFields = [
    'rewardBalance',
    'referralBalance',
    'levelBalance',
    'shareBalance',
    'bonusBalance',
  ] as const

  const data: Record<string, { increment: number }> = {}
  if (rawBreakdown && typeof rawBreakdown === 'object' && !Array.isArray(rawBreakdown)) {
    for (const field of allowedFields) {
      const amount = Number((rawBreakdown as Record<string, unknown>)[field])
      if (Number.isFinite(amount) && amount > 0) {
        data[field] = { increment: amount }
      }
    }
  }

  if (Object.keys(data).length === 0 && legacyAmount > 0) {
    data.rewardBalance = { increment: legacyAmount }
  }

  await tx.wallet.update({
    where: { userId },
    data,
  })
  await syncWalletMainBalance(tx, userId)
}
