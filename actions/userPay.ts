'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession, getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { deductFromWallets, syncWalletMainBalance } from './walletUtils'

export type UserPayTransferType = 'MAIN_TO_DEPOSIT' | 'DEPOSIT_TO_DEPOSIT' | 'DEPOSIT_TO_MAIN'
type TransferWallet = 'MAIN' | 'DEPOSIT'

const TRANSFER_WALLETS: Record<UserPayTransferType, { sourceWallet: TransferWallet; destinationWallet: TransferWallet }> = {
  MAIN_TO_DEPOSIT: { sourceWallet: 'MAIN', destinationWallet: 'DEPOSIT' },
  DEPOSIT_TO_DEPOSIT: { sourceWallet: 'DEPOSIT', destinationWallet: 'DEPOSIT' },
  DEPOSIT_TO_MAIN: { sourceWallet: 'DEPOSIT', destinationWallet: 'MAIN' },
}

function getWalletLabel(walletType: TransferWallet) {
  return walletType === 'MAIN' ? 'Main Wallet' : 'Deposit Wallet'
}

function getTransferLabel(transferType: UserPayTransferType) {
  if (transferType === 'MAIN_TO_DEPOSIT') return 'Main Wallet -> Deposit Wallet'
  if (transferType === 'DEPOSIT_TO_MAIN') return 'Deposit Wallet -> Main Wallet'
  return 'Deposit Wallet -> Deposit Wallet'
}

function getTransferSettings(settings: Awaited<ReturnType<typeof prisma.systemSettings.findUnique>>, transferType: UserPayTransferType) {
  const fallbackPercent = settings?.userPayDeductionPercent ?? 0.0
  const fallbackEnabled = settings?.userPayTransfersEnabled ?? true

  if (transferType === 'MAIN_TO_DEPOSIT') {
    return {
      deductionPercent: settings?.userPayMainToDepositPercent ?? fallbackPercent,
      enabled: settings?.userPayMainToDepositEnabled ?? fallbackEnabled,
    }
  }
  if (transferType === 'DEPOSIT_TO_MAIN') {
    return {
      deductionPercent: settings?.userPayDepositToMainPercent ?? fallbackPercent,
      enabled: settings?.userPayDepositToMainEnabled ?? fallbackEnabled,
    }
  }

  return {
    deductionPercent: settings?.userPayDepositToDepositPercent ?? fallbackPercent,
    enabled: settings?.userPayDepositToDepositEnabled ?? fallbackEnabled,
  }
}

async function debitSelectedWallet(tx: Prisma.TransactionClient, userId: string, walletType: TransferWallet, amountToDebit: number) {
  if (walletType === 'MAIN') {
    await deductFromWallets(tx, userId, amountToDebit)
    return
  }

  const result = await tx.wallet.updateMany({
    where: {
      userId,
      depositBalance: { gte: amountToDebit },
    },
    data: {
      depositBalance: { decrement: amountToDebit },
    },
  })

  if (result.count !== 1) {
    throw new Error('Insufficient Deposit Wallet balance.')
  }
}

async function creditSelectedWallet(tx: Prisma.TransactionClient, userId: string, walletType: TransferWallet, amountToCredit: number) {
  if (walletType === 'DEPOSIT') {
    await tx.wallet.update({
      where: { userId },
      data: {
        depositBalance: { increment: amountToCredit },
      },
    })
    return
  }

  await tx.wallet.update({
    where: { userId },
    data: {
      bonusBalance: { increment: amountToCredit },
    },
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

export async function submitUserPayRequestAction(data: {
  recipientEmail: string
  amount: number
  transferType: UserPayTransferType
}): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const recipientEmail = data.recipientEmail.trim().toLowerCase()
  const amount = Number(data.amount)
  const transferType = data.transferType
  const transferWallets = TRANSFER_WALLETS[transferType]
  const isUserToUserTransfer = transferType === 'DEPOSIT_TO_DEPOSIT'

  if (isUserToUserTransfer && !recipientEmail) return { success: false, message: 'Recipient email is required' }
  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Amount must be a positive number' }
  if (!transferWallets) return { success: false, message: 'Invalid transfer type.' }

  try {
    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true }
    })
    if (!sender) return { success: false, message: 'Sender account not found.' }

    const recipient = isUserToUserTransfer
      ? await prisma.user.findUnique({
        where: { email: recipientEmail },
        select: { id: true, name: true, email: true }
      })
      : { id: session.id, name: sender.name, email: sender.email }
    if (!recipient) return { success: false, message: 'Recipient email does not exist.' }
    if (isUserToUserTransfer && recipient.id === session.id) return { success: false, message: 'You cannot transfer to yourself.' }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    })
    const minimumAmount = settings?.userPayMinimumAmount ?? 1.0
    const maximumAmount = settings?.userPayMaximumAmount ?? 10000000.0
    const transferSettings = getTransferSettings(settings, transferType)

    if (!transferSettings.enabled) {
      return { success: false, message: `${getTransferLabel(transferType)} transfers are currently disabled by admin.` }
    }

    if (amount < minimumAmount || amount > maximumAmount) {
      return {
        success: false,
        message: `Amount must be between ₹${minimumAmount.toLocaleString('en-IN')} and ₹${maximumAmount.toLocaleString('en-IN')}.`
      }
    }

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: session.id }
    })
    const availableBalance = transferWallets.sourceWallet === 'MAIN'
      ? senderWallet?.mainBalance || 0
      : senderWallet?.depositBalance || 0

    if (!senderWallet || availableBalance < amount) {
      return { success: false, message: `Insufficient ${getWalletLabel(transferWallets.sourceWallet)} balance.` }
    }

    const deductionPercent = transferSettings.deductionPercent
    const deductionAmount = (amount * deductionPercent) / 100
    const finalAmount = amount - deductionAmount

    await prisma.$transaction(async (tx) => {
      const request = await tx.userPayRequest.create({
        data: {
          senderId: session.id,
          receiverId: recipient.id,
          amount,
          deductionPercent,
          deductionAmount,
          finalAmount,
          sourceWallet: transferWallets.sourceWallet,
          destinationWallet: transferWallets.destinationWallet,
          status: 'APPROVED'
        }
      })

      await debitSelectedWallet(tx, session.id, transferWallets.sourceWallet, amount)
      await creditSelectedWallet(tx, recipient.id, transferWallets.destinationWallet, finalAmount)

      await tx.transaction.create({
        data: {
          userId: session.id,
          type: 'USER_PAY_SENT',
          amount,
          status: 'COMPLETED',
          description: isUserToUserTransfer
            ? `Sent Money to ${recipient.name} (${recipient.email}) from ${getWalletLabel(transferWallets.sourceWallet)} to ${getWalletLabel(transferWallets.destinationWallet)}`
            : `Transferred funds from ${getWalletLabel(transferWallets.sourceWallet)} to ${getWalletLabel(transferWallets.destinationWallet)}`,
          walletType: transferWallets.sourceWallet,
          reference: request.id
        }
      })

      await tx.transaction.create({
        data: {
          userId: recipient.id,
          type: 'USER_PAY_RECEIVED',
          amount: finalAmount,
          status: 'COMPLETED',
          description: isUserToUserTransfer
            ? `Received Money from ${sender.name} (${sender.email}) into ${getWalletLabel(transferWallets.destinationWallet)}`
            : `Transferred funds from ${getWalletLabel(transferWallets.sourceWallet)} to ${getWalletLabel(transferWallets.destinationWallet)}`,
          walletType: transferWallets.destinationWallet,
          reference: request.id
        }
      })

      await tx.notification.create({
        data: {
          userId: session.id,
          title: 'Money Sent',
          message: isUserToUserTransfer
            ? `Your transfer of ₹${amount} from ${getWalletLabel(transferWallets.sourceWallet)} to ${recipient.name}'s ${getWalletLabel(transferWallets.destinationWallet)} was completed instantly.`
            : `Your transfer of ₹${amount} from ${getWalletLabel(transferWallets.sourceWallet)} to ${getWalletLabel(transferWallets.destinationWallet)} was completed instantly.`,
          type: 'SUCCESS'
        }
      })

      if (isUserToUserTransfer) {
        await tx.notification.create({
          data: {
            userId: recipient.id,
            title: 'Money Received',
            message: `You received ₹${finalAmount} in your ${getWalletLabel(transferWallets.destinationWallet)} from ${sender.name}.`,
            type: 'SUCCESS'
          }
        })
      }
    })

    revalidatePath('/dashboard/user-pay')
    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/admin/dashboard/user-pay')
    return { success: true, message: 'Transfer completed successfully.' }
  } catch (error) {
    console.error('Submit User Pay Request error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process money transfer',
    }
  }
}

export async function updateUserPaySettingsAction(data: {
  mainToDepositPercent: number
  depositToDepositPercent: number
  depositToMainPercent: number
  minimumAmount: number
  maximumAmount: number
  mainToDepositEnabled: boolean
  depositToDepositEnabled: boolean
  depositToMainEnabled: boolean
}): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const mainToDepositPercent = Number(data.mainToDepositPercent)
  const depositToDepositPercent = Number(data.depositToDepositPercent)
  const depositToMainPercent = Number(data.depositToMainPercent)
  const minimumAmount = Number(data.minimumAmount)
  const maximumAmount = Number(data.maximumAmount)
  const mainToDepositEnabled = Boolean(data.mainToDepositEnabled)
  const depositToDepositEnabled = Boolean(data.depositToDepositEnabled)
  const depositToMainEnabled = Boolean(data.depositToMainEnabled)

  const percentages = [mainToDepositPercent, depositToDepositPercent, depositToMainPercent]
  if (percentages.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
    return { success: false, message: 'Transfer charge percentages must be between 0 and 100.' }
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
        userPayDeductionPercent: depositToDepositPercent,
        userPayMinimumAmount: minimumAmount,
        userPayMaximumAmount: maximumAmount,
        userPayTransfersEnabled: mainToDepositEnabled || depositToDepositEnabled || depositToMainEnabled,
        userPayMainToDepositPercent: mainToDepositPercent,
        userPayDepositToDepositPercent: depositToDepositPercent,
        userPayDepositToMainPercent: depositToMainPercent,
        userPayMainToDepositEnabled: mainToDepositEnabled,
        userPayDepositToDepositEnabled: depositToDepositEnabled,
        userPayDepositToMainEnabled: depositToMainEnabled,
      },
      create: {
        id: 'default',
        userPayDeductionPercent: depositToDepositPercent,
        userPayMinimumAmount: minimumAmount,
        userPayMaximumAmount: maximumAmount,
        userPayTransfersEnabled: mainToDepositEnabled || depositToDepositEnabled || depositToMainEnabled,
        userPayMainToDepositPercent: mainToDepositPercent,
        userPayDepositToDepositPercent: depositToDepositPercent,
        userPayDepositToMainPercent: depositToMainPercent,
        userPayMainToDepositEnabled: mainToDepositEnabled,
        userPayDepositToDepositEnabled: depositToDepositEnabled,
        userPayDepositToMainEnabled: depositToMainEnabled,
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
