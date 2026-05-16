'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// ── User Management ───────────────────────────────────────────────────────────
export async function toggleUserStatus(userId: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, message: 'User not found' }

    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus as any },
    })

    revalidatePath('/admin/dashboard/users')
    return { success: true, message: `User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to update user status' }
  }
}

// ── Deposit Management ────────────────────────────────────────────────────────
export async function handleDeposit(depositId: string, action: 'APPROVE' | 'REJECT', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const deposit = await prisma.deposit.findUnique({ 
      where: { id: depositId },
      include: { user: true }
    })
    if (!deposit || deposit.status !== 'PENDING') return { success: false, message: 'Invalid deposit request' }

    if (action === 'APPROVE') {
      await prisma.$transaction([
        // Update deposit status
        prisma.deposit.update({
          where: { id: depositId },
          data: { status: 'APPROVED', approvedById: admin.id, remarks },
        }),
        // Update user wallet
        prisma.wallet.update({
          where: { userId: deposit.userId },
          data: { mainBalance: { increment: deposit.amount } },
        }),
        // Create transaction record
        prisma.transaction.create({
          data: {
            userId: deposit.userId,
            type: 'DEPOSIT',
            amount: deposit.amount,
            status: 'COMPLETED',
            description: `Deposit via ${deposit.method} approved`,
            reference: deposit.utrNumber || depositId,
          },
        }),
        // Notification
        prisma.notification.create({
          data: {
            userId: deposit.userId,
            title: 'Deposit Approved ✅',
            message: `Your deposit of ₹${deposit.amount.toLocaleString()} has been approved.`,
            type: 'SUCCESS',
          },
        }),
      ])
    } else {
      await prisma.deposit.update({
        where: { id: depositId },
        data: { status: 'REJECTED', approvedById: admin.id, remarks },
      })
      await prisma.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Rejected ❌',
          message: `Your deposit of ₹${deposit.amount.toLocaleString()} was rejected. ${remarks || ''}`,
          type: 'ERROR',
        },
      })
    }

    revalidatePath('/admin/dashboard/deposits')
    revalidatePath('/admin/dashboard')
    return { success: true, message: `Deposit ${action.toLowerCase()}d successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to process deposit' }
  }
}

// ── Withdrawal Management ─────────────────────────────────────────────────────
export async function handleWithdrawal(withdrawalId: string, action: 'APPROVE' | 'REJECT', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const withdrawal = await prisma.withdrawal.findUnique({ 
      where: { id: withdrawalId },
      include: { user: true }
    })
    if (!withdrawal || withdrawal.status !== 'PENDING') return { success: false, message: 'Invalid withdrawal request' }

    if (action === 'APPROVE') {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: 'APPROVED', approvedById: admin.id, processedAt: new Date(), remarks },
      })
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Approved ✅',
          message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} has been processed.`,
          type: 'SUCCESS',
        },
      })
    } else {
      await prisma.$transaction([
        // Reject withdrawal
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'REJECTED', approvedById: admin.id, remarks },
        }),
        // Refund to wallet
        prisma.wallet.update({
          where: { userId: withdrawal.userId },
          data: { mainBalance: { increment: withdrawal.amount } },
        }),
        // Notification
        prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Rejected ❌',
            message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} was rejected and refunded.`,
            type: 'ERROR',
          },
        }),
      ])
    }

    revalidatePath('/admin/dashboard/withdrawals')
    revalidatePath('/admin/dashboard')
    return { success: true, message: `Withdrawal ${action.toLowerCase()}d successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to process withdrawal' }
  }
}

// ── KYC Management ────────────────────────────────────────────────────────────
export async function handleKYC(kycId: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.kYC.update({
      where: { id: kycId },
      data: { status: action, reviewedById: admin.id, reviewedAt: new Date(), remarks },
    })

    const kyc = await prisma.kYC.findUnique({ where: { id: kycId } })
    if (kyc) {
      await prisma.notification.create({
        data: {
          userId: kyc.userId,
          title: action === 'APPROVED' ? 'KYC Verified ✅' : 'KYC Rejected ❌',
          message: action === 'APPROVED' ? 'Your identity verification is complete.' : `Your KYC was rejected. ${remarks || ''}`,
          type: action === 'APPROVED' ? 'SUCCESS' : 'ERROR',
        },
      })
    }

    revalidatePath('/admin/dashboard/kyc')
    revalidatePath('/admin/dashboard')
    return { success: true, message: `KYC ${action.toLowerCase()} successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to process KYC' }
  }
}

// ── Investment Plan Management ───────────────────────────────────────────────
export async function upsertInvestmentPlan(data: any): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const { id, ...payload } = data
    if (id) {
      await prisma.investmentPlan.update({ where: { id }, data: payload })
    } else {
      await prisma.investmentPlan.create({ data: payload })
    }

    revalidatePath('/admin/dashboard/plans')
    revalidatePath('/')
    return { success: true, message: `Plan ${id ? 'updated' : 'created'} successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to save investment plan' }
  }
}
