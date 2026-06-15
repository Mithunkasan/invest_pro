'use server'

import { prisma } from '@/lib/prisma'

/**
 * Recalculates and updates the mainBalance of a user's wallet
 * to be the sum of: depositBalance + rewardBalance + referralBalance + levelBalance + shareBalance + bonusBalance
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
 * Deducts a given amount from the user's sub-wallets in priority order,
 * ensuring no sub-wallet goes negative.
 * Priority order: depositBalance, rewardBalance, referralBalance, levelBalance, shareBalance, bonusBalance
 */
export async function deductFromWallets(tx: any, userId: string, amountToDeduct: number) {
  const wallet = await tx.wallet.findUnique({
    where: { userId },
  })
  if (!wallet) throw new Error('Wallet not found')

  let remaining = amountToDeduct
  const updates: any = {}

  // 1. Deposit
  if (remaining > 0 && wallet.depositBalance > 0) {
    const deduct = Math.min(remaining, wallet.depositBalance)
    updates.depositBalance = { decrement: deduct }
    remaining -= deduct
  }

  // 2. Reward
  if (remaining > 0 && wallet.rewardBalance > 0) {
    const deduct = Math.min(remaining, wallet.rewardBalance)
    updates.rewardBalance = { decrement: deduct }
    remaining -= deduct
  }

  // 3. Referral
  if (remaining > 0 && wallet.referralBalance > 0) {
    const deduct = Math.min(remaining, wallet.referralBalance)
    updates.referralBalance = { decrement: deduct }
    remaining -= deduct
  }

  // 4. Level
  if (remaining > 0 && wallet.levelBalance > 0) {
    const deduct = Math.min(remaining, wallet.levelBalance)
    updates.levelBalance = { decrement: deduct }
    remaining -= deduct
  }

  // 5. Share
  if (remaining > 0 && wallet.shareBalance > 0) {
    const deduct = Math.min(remaining, wallet.shareBalance)
    updates.shareBalance = { decrement: deduct }
    remaining -= deduct
  }

  // 6. Bonus
  if (remaining > 0 && wallet.bonusBalance > 0) {
    const deduct = Math.min(remaining, wallet.bonusBalance)
    updates.bonusBalance = { decrement: deduct }
    remaining -= deduct
  }

  if (remaining > 0) {
    throw new Error('Insufficient total balance across all wallets')
  }

  if (Object.keys(updates).length > 0) {
    await tx.wallet.update({
      where: { userId },
      data: updates,
    })
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
}
