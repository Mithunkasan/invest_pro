'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession, getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { deductFromWallets, syncWalletMainBalance } from './walletUtils'

// Helper to credit receiver's Bonus Wallet (user-pay received goes to bonusBalance)
async function creditToMainWallet(tx: any, userId: string, amountToCredit: number) {
  await tx.wallet.update({
    where: { userId },
    data: {
      bonusBalance: { increment: amountToCredit },
      // User-pay received is income — increment Total Wallet
      totalEarned: { increment: amountToCredit },
    }
  })

  await syncWalletMainBalance(tx, userId)
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
    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true }
    })
    if (!sender) return { success: false, message: 'Sender account not found.' }

    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
      select: { id: true, name: true, email: true }
    })
    if (!recipient) return { success: false, message: 'Recipient email does not exist.' }
    if (recipient.id === session.id) return { success: false, message: 'You cannot transfer to yourself.' }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    })
    const minimumAmount = settings?.userPayMinimumAmount ?? 1.0
    const maximumAmount = settings?.userPayMaximumAmount ?? 10000000.0

    if (amount < minimumAmount || amount > maximumAmount) {
      return {
        success: false,
        message: `Amount must be between ₹${minimumAmount.toLocaleString('en-IN')} and ₹${maximumAmount.toLocaleString('en-IN')}.`
      }
    }

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: session.id }
    })
    if (!senderWallet || (senderWallet.mainBalance || 0) < amount) {
      return { success: false, message: 'Insufficient Main Wallet balance.' }
    }

    const deductionPercent = settings?.userPayDeductionPercent ?? 0.0
    const deductionAmount = (amount * deductionPercent) / 100
    const finalAmount = amount - deductionAmount

    await prisma.$transaction(async (tx) => {
      // Create the userPayRequest with APPROVED status directly
      const request = await tx.userPayRequest.create({
        data: {
          senderId: session.id,
          receiverId: recipient.id,
          amount,
          deductionPercent,
          deductionAmount,
          finalAmount,
          status: 'APPROVED'
        }
      })

      // Deduct from sender
      await deductFromWallets(tx, session.id, amount)

      // Credit to receiver
      await creditToMainWallet(tx, recipient.id, finalAmount)

      // Create transaction logs
      await tx.transaction.create({
        data: {
          userId: session.id,
          type: 'USER_PAY_SENT',
          amount,
          status: 'COMPLETED',
          description: `Sent Money to ${recipient.name} (${recipient.email})`,
          walletType: 'MAIN',
          reference: request.id
        }
      })

      await tx.transaction.create({
        data: {
          userId: recipient.id,
          type: 'USER_PAY_RECEIVED',
          amount: finalAmount,
          status: 'COMPLETED',
          description: `Received Money from ${sender.name} (${sender.email})`,
          walletType: 'BONUS',
          reference: request.id
        }
      })

      // Create notifications
      await tx.notification.create({
        data: {
          userId: session.id,
          title: 'Money Sent ✅',
          message: `Your transfer of ₹${amount} to ${recipient.name} was completed instantly.`,
          type: 'SUCCESS'
        }
      })

      await tx.notification.create({
        data: {
          userId: recipient.id,
          title: 'Money Received 💰',
          message: `You received ₹${finalAmount} from ${sender.name}.`,
          type: 'SUCCESS'
        }
      })
    })

    revalidatePath('/dashboard/user-pay')
    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard/transactions')
    return { success: true, message: 'Transfer completed successfully.' }
  } catch (error) {
    console.error('Submit User Pay Request error:', error)
    return { success: false, message: 'Failed to process money transfer' }
  }
}

export async function updateUserPaySettingsAction(data: {
  deductionPercent: number
  minimumAmount: number
  maximumAmount: number
}): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const deductionPercent = Number(data.deductionPercent)
  const minimumAmount = Number(data.minimumAmount)
  const maximumAmount = Number(data.maximumAmount)

  if (!Number.isFinite(deductionPercent) || deductionPercent < 0 || deductionPercent > 100) {
    return { success: false, message: 'Deduction percentage must be between 0 and 100.' }
  }
  if (!Number.isFinite(minimumAmount) || minimumAmount <= 0) {
    return { success: false, message: 'Minimum Amount must be greater than 0.' }
  }
  if (!Number.isFinite(maximumAmount) || maximumAmount < minimumAmount) {
    return { success: false, message: 'Maximum Amount must be greater than or equal to Minimum Amount.' }
  }

  try {
    await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        userPayDeductionPercent: deductionPercent,
        userPayMinimumAmount: minimumAmount,
        userPayMaximumAmount: maximumAmount,
      },
      create: {
        id: 'default',
        userPayDeductionPercent: deductionPercent,
        userPayMinimumAmount: minimumAmount,
        userPayMaximumAmount: maximumAmount,
      }
    })

    revalidatePath('/admin/dashboard/user-pay')
    revalidatePath('/dashboard/user-pay')
    return { success: true, message: 'Send Money settings updated successfully.' }
  } catch (error) {
    console.error('Update User Pay Settings error:', error)
    return { success: false, message: 'Failed to update Send Money settings.' }
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

export async function getAllUserPayRequestsAction() {
  const admin = await getAdminSession()
  if (!admin) return []

  return prisma.userPayRequest.findMany({
    include: {
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function handleUserPayRequestAction(requestId: string, status: 'APPROVED' | 'REJECTED'): Promise<ApiResponse> {
  return { success: false, message: 'Admin approval is disabled. Transfers are processed instantly.' }
}
