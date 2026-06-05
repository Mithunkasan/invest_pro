'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { deductFromWallets, syncWalletMainBalance } from './walletUtils'

// ── Request Withdrawal ────────────────────────────────────────────────────────
export async function requestWithdrawalAction(
  formData: FormData
): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const amount = parseFloat(formData.get('amount')?.toString() || '0')
  const walletType = (formData.get('walletType')?.toString() || 'MAIN') as 'MAIN' | 'BONUS' | 'REFERRAL'
  const bankName = formData.get('bankName')?.toString()
  const accountNo = formData.get('accountNo')?.toString()
  const ifsc = formData.get('ifsc')?.toString()
  const accountName = formData.get('accountName')?.toString()
  const upiId = formData.get('upiId')?.toString()

  if (!bankName || !accountNo || !ifsc || !accountName) {
    return { success: false, message: 'Missing required bank details' }
  }

  if (!amount || amount < 100) {
    return { success: false, message: 'Minimum withdrawal is ₹100' }
  }

  // Check wallet balance
  const wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
  if (!wallet) return { success: false, message: 'Wallet not found' }

  if (walletType === 'MAIN') {
    if (wallet.mainBalance < amount) {
      return { success: false, message: 'Insufficient balance' }
    }

    await prisma.$transaction(async (tx) => {
      // Deduct from wallets in priority order
      await deductFromWallets(tx, session.id, amount)
      
      // Create withdrawal request
      await tx.withdrawal.create({
        data: {
          userId: session.id,
          amount,
          walletType,
          bankDetails: { bankName, accountNo, ifsc, accountName },
          upiId: upiId || undefined,
          status: 'PENDING',
        },
      })
    })
  } else {
    const balanceKey = walletType === 'BONUS' ? 'bonusBalance' : 'referralBalance'
    if (wallet[balanceKey] < amount) {
      return { success: false, message: 'Insufficient balance' }
    }

    await prisma.$transaction(async (tx) => {
      // Deduct from wallet immediately
      await tx.wallet.update({
        where: { userId: session.id },
        data: { [balanceKey]: { decrement: amount } },
      })
      
      // Sync main balance
      const updatedWallet = await tx.wallet.findUnique({
        where: { userId: session.id }
      })
      if (updatedWallet) {
        const newMain = 
          (updatedWallet.rewardBalance || 0) +
          (updatedWallet.referralBalance || 0) +
          (updatedWallet.levelBalance || 0) +
          (updatedWallet.shareBalance || 0) +
          (updatedWallet.bonusBalance || 0)
        await tx.wallet.update({
          where: { userId: session.id },
          data: { mainBalance: newMain }
        })
      }

      // Create withdrawal request
      await tx.withdrawal.create({
        data: {
          userId: session.id,
          amount,
          walletType,
          bankDetails: { bankName, accountNo, ifsc, accountName },
          upiId: upiId || undefined,
          status: 'PENDING',
        },
      })
    })
  }

  await prisma.notification.create({
    data: {
      userId: session.id,
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal of ₹${amount.toLocaleString('en-IN')} is being processed.`,
      type: 'INFO',
    },
  })

  revalidatePath('/dashboard/withdraw')
  return { success: true, message: 'Withdrawal request submitted. Processing within 24-48 hours.' }
}

// ── Admin: Get All Withdrawals ────────────────────────────────────────────────
export async function getAllWithdrawals(status?: string) {
  const where = status && status !== 'ALL' ? { status: status as 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' } : {}
  return prisma.withdrawal.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Admin: Update Withdrawal Status ──────────────────────────────────────────
export async function updateWithdrawalStatusAction(
  withdrawalId: string,
  status: 'APPROVED' | 'REJECTED',
  remarks?: string
): Promise<ApiResponse> {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } })
  if (!withdrawal) return { success: false, message: 'Withdrawal not found' }

  await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status,
      remarks,
      processedAt: new Date(),
    },
  })

  if (status === 'REJECTED') {
    // Refund if rejected
    const balanceKey = withdrawal.walletType === 'MAIN' ? 'rewardBalance'
      : withdrawal.walletType === 'BONUS' ? 'bonusBalance' : 'referralBalance'

    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: { [balanceKey]: { increment: withdrawal.amount } },
    })

    await syncWalletMainBalance(prisma, withdrawal.userId)

    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} was rejected. Amount refunded. Reason: ${remarks || 'Contact support'}`,
        type: 'ERROR',
      },
    })
  } else {
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: 'Withdrawal Approved ✅',
        message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} has been processed.`,
        type: 'SUCCESS',
      },
    })
  }

  revalidatePath('/admin/dashboard/withdrawals')
  return { success: true, message: `Withdrawal ${status.toLowerCase()} successfully` }
}
