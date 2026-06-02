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

    if (amount <= 0) {
      return { success: false, message: 'Invalid reward amount' }
    }

    // Process in a secure transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch user wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.id }
      })

      if (!wallet) {
        throw new Error('Wallet not found')
      }

      // 2. Increment reward balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: session.id },
        data: {
          rewardBalance: {
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
          walletType: 'REWARD',
          description: `Earned from ${activityName}`
        }
      })

      // 4. Create an in-app notification
      await tx.notification.create({
        data: {
          userId: session.id,
          title: 'Reward Credited! 🎁',
          message: `Congratulations! You received ₹${amount.toFixed(2)} reward coins from ${activityName}.`,
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
