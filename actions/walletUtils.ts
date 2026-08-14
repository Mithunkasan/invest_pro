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
    (wallet.bonusBalance || 0) +
    (wallet.taskBalance || 0)

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
  const EPSILON = 1e-9

  const walletFields = [
    'rewardBalance',
    'referralBalance',
    'levelBalance',
    'shareBalance',
    'bonusBalance',
    'taskBalance',
  ] as const

  for (const field of walletFields) {
    const balance = wallet[field] || 0
    if (remaining > 0 && balance > 0) {
      const deduct = Math.min(remaining, balance)
      
      // If we are exhausting this sub-wallet (deduct is extremely close to the balance),
      // we set the balance to 0 directly to avoid floating-point issues or negative values.
      if (Math.abs(deduct - balance) < EPSILON) {
        updates[field] = 0
      } else {
        updates[field] = { decrement: deduct }
      }
      
      deductions[field] = deduct
      remaining -= deduct
    }
  }

  if (remaining > 0) {
    throw new Error('Insufficient total balance across all wallets')
  }

  if (Object.keys(updates).length > 0) {
    const balanceGuards: Record<string, any> = {}
    for (const [field, amount] of Object.entries(deductions)) {
      const originalBalance = wallet[field as keyof typeof wallet] as number
      if (Math.abs(amount - originalBalance) < EPSILON) {
        balanceGuards[field] = { gte: amount - EPSILON }
      } else {
        balanceGuards[field] = { gte: amount }
      }
    }

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
      (updatedWallet.bonusBalance || 0) +
      (updatedWallet.taskBalance || 0)

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
    'taskBalance',
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
