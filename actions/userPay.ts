'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession, getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// Helper to deduct from main wallet sub-wallets (excluding depositBalance)
async function deductFromMainWallets(tx: any, userId: string, amountToDeduct: number) {
  const wallet = await tx.wallet.findUnique({
    where: { userId },
  })
  if (!wallet) throw new Error('Wallet not found')

  let remaining = amountToDeduct
  const updates: any = {}

  // Priority order of main wallet sub-wallets:
  const subWallets: ('rewardBalance' | 'referralBalance' | 'levelBalance' | 'shareBalance' | 'bonusBalance')[] = [
    'rewardBalance',
    'referralBalance',
    'levelBalance',
    'shareBalance',
    'bonusBalance'
  ]

  for (const key of subWallets) {
    if (remaining > 0 && (wallet[key] || 0) > 0) {
      const deduct = Math.min(remaining, wallet[key] || 0)
      updates[key] = { decrement: deduct }
      remaining -= deduct
    }
  }

  if (remaining > 0) {
    throw new Error('Insufficient Main Wallet balance across sub-wallets')
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

// Helper to credit receiver's Main Wallet (credits to bonusBalance)
async function creditToMainWallet(tx: any, userId: string, amountToCredit: number) {
  await tx.wallet.update({
    where: { userId },
    data: {
      bonusBalance: { increment: amountToCredit }
    }
  })

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

export async function validateRecipientEmailAction(email: string): Promise<ApiResponse & { userId?: string, userName?: string }> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) return { success: false, message: 'Email is required' }

  try {
    const recipient = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { id: true, name: true }
    })
    if (!recipient) {
      return { success: false, message: 'Recipient email does not exist.' }
    }
    if (recipient.id === session.id) {
      return { success: false, message: 'You cannot transfer to yourself.' }
    }
    return { success: true, message: 'Recipient verified.', userId: recipient.id, userName: recipient.name }
  } catch (error) {
    console.error('Error validating recipient email:', error)
    return { success: false, message: 'Failed to validate email' }
  }
}

export async function submitUserPayRequestAction(data: { recipientEmail: string, amount: number }): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const recipientEmail = data.recipientEmail.trim().toLowerCase()
  const amount = Number(data.amount)

  if (!recipientEmail) return { success: false, message: 'Recipient email is required' }
  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Amount must be a positive number' }

  try {
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
      select: { id: true, name: true }
    })
    if (!recipient) return { success: false, message: 'Recipient email does not exist.' }
    if (recipient.id === session.id) return { success: false, message: 'You cannot transfer to yourself.' }

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: session.id }
    })
    if (!senderWallet || (senderWallet.mainBalance || 0) < amount) {
      return { success: false, message: 'Insufficient Main Wallet balance.' }
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    })
    const deductionPercent = settings?.userPayDeductionPercent ?? 0.0
    const deductionAmount = (amount * deductionPercent) / 100
    const finalAmount = amount - deductionAmount

    await prisma.userPayRequest.create({
      data: {
        senderId: session.id,
        receiverId: recipient.id,
        amount,
        deductionPercent,
        deductionAmount,
        finalAmount,
        status: 'PENDING'
      }
    })

    revalidatePath('/dashboard/user-pay')
    revalidatePath('/dashboard/transactions')
    return { success: true, message: 'Transfer request submitted for Admin approval.' }
  } catch (error) {
    console.error('Submit User Pay Request error:', error)
    return { success: false, message: 'Failed to submit transfer request' }
  }
}

export async function getUserPayRequestsAction() {
  const session = await getSession()
  if (!session) return []

  return prisma.userPayRequest.findMany({
    where: {
      OR: [
        { senderId: session.id },
        { receiverId: session.id }
      ]
    },
    include: {
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getAllUserPayRequestsAction(status?: string) {
  const admin = await getAdminSession()
  if (!admin) return []

  const where = status && status !== 'ALL' ? { status: status as any } : {}

  return prisma.userPayRequest.findMany({
    where,
    include: {
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function handleUserPayRequestAction(requestId: string, status: 'APPROVED' | 'REJECTED'): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const request = await prisma.userPayRequest.findUnique({
    where: { id: requestId },
    include: {
      sender: { include: { wallet: true } },
      receiver: { include: { wallet: true } }
    }
  })
  if (!request) return { success: false, message: 'User Pay request not found' }
  if (request.status !== 'PENDING') return { success: false, message: 'Request is already processed' }

  try {
    if (status === 'APPROVED') {
      if (!request.sender.wallet || (request.sender.wallet.mainBalance || 0) < request.amount) {
        return { success: false, message: 'Sender has insufficient Main Wallet balance now.' }
      }

      await prisma.$transaction(async (tx) => {
        await tx.userPayRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' }
        })

        await deductFromMainWallets(tx, request.senderId, request.amount)
        await creditToMainWallet(tx, request.receiverId, request.finalAmount)

        await tx.transaction.create({
          data: {
            userId: request.senderId,
            type: 'USER_PAY_SENT',
            amount: request.amount,
            status: 'COMPLETED',
            description: `User Pay to ${request.receiver.name} (${request.receiver.email})`,
            walletType: 'MAIN',
            reference: request.id
          }
        })

        await tx.transaction.create({
          data: {
            userId: request.receiverId,
            type: 'USER_PAY_RECEIVED',
            amount: request.finalAmount,
            status: 'COMPLETED',
            description: `User Pay from ${request.sender.name} (${request.sender.email})`,
            walletType: 'MAIN',
            reference: request.id
          }
        })

        await tx.notification.create({
          data: {
            userId: request.senderId,
            title: 'User Pay Sent ✅',
            message: `Your transfer of ₹${request.amount} to ${request.receiver.name} has been approved and processed.`,
            type: 'SUCCESS'
          }
        })

        await tx.notification.create({
          data: {
            userId: request.receiverId,
            title: 'User Pay Received 💰',
            message: `You received ₹${request.finalAmount} from ${request.sender.name}.`,
            type: 'SUCCESS'
          }
        })
      })

      revalidatePath('/admin/dashboard/user-pay')
      revalidatePath('/dashboard/user-pay')
      revalidatePath('/dashboard/wallet')
      revalidatePath('/dashboard/transactions')
      return { success: true, message: 'User Pay request approved successfully.' }
    } else {
      await prisma.userPayRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      })

      await prisma.notification.create({
        data: {
          userId: request.senderId,
          title: 'User Pay Request Rejected ❌',
          message: `Your transfer request of ₹${request.amount} to ${request.receiver.name} was rejected.`,
          type: 'ERROR'
        }
      })

      revalidatePath('/admin/dashboard/user-pay')
      revalidatePath('/dashboard/user-pay')
      return { success: true, message: 'User Pay request rejected.' }
    }
  } catch (error) {
    console.error('Handle User Pay Request error:', error)
    return { success: false, message: 'Failed to process User Pay request' }
  }
}
