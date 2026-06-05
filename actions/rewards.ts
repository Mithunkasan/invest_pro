'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function claimRewardAction(
  amount: number,
  activityName: string
): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, message: 'Unauthorized. Please login again.' }
    }

    if (amount === 0) {
      return { success: false, message: 'Invalid reward amount' }
    }

    // Process in a secure transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch user and wallet
      const user = await tx.user.findUnique({
        where: { id: session.id },
        select: { memberType: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId: session.id }
      })

      if (!wallet) {
        throw new Error('Wallet not found')
      }

      const isFree = user.memberType === 'FREE'
      const actualWalletType: 'MAIN' | 'REWARD' = isFree ? 'MAIN' : 'REWARD'
      const actualBalanceField = isFree ? 'mainBalance' : 'rewardBalance'

      // Check for negative amounts (e.g., laser upgrade costs)
      if (amount < 0) {
        const balance = isFree ? wallet.mainBalance : wallet.rewardBalance
        if (balance < Math.abs(amount)) {
          throw new Error(`Insufficient balance in ${isFree ? 'Main' : 'Reward'} Wallet to upgrade laser`)
        }
      }

      // 2. Increment balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: session.id },
        data: {
          [actualBalanceField]: {
            increment: amount
          }
        }
      })

      // 3. Create a transaction log
      await tx.transaction.create({
        data: {
          userId: session.id,
          type: 'REWARD',
          amount: amount,
          status: 'COMPLETED',
          walletType: actualWalletType,
          description: amount < 0 ? activityName : `Earned from ${activityName}`
        }
      })

      // 4. Create an in-app notification
      await tx.notification.create({
        data: {
          userId: session.id,
          title: amount < 0 ? 'Laser Upgraded! ⚡' : 'Reward Credited! 🎁',
          message: amount < 0
            ? `Successfully spent ₹${Math.abs(amount).toFixed(2)} on ${activityName}.`
            : `Congratulations! You received ₹${amount.toFixed(2)} reward cash credited to your ${isFree ? 'Main' : 'Reward'} Wallet from ${activityName}.`,
          type: 'SUCCESS'
        }
      })

      return updatedWallet
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/wallet')

    return {
      success: true,
      message: `Successfully claimed ₹${amount.toFixed(2)} from ${activityName}!`
    }
  } catch (error: any) {
    console.error('Error claiming reward:', error)
    return { success: false, message: error.message || 'Failed to claim reward' }
  }
}
