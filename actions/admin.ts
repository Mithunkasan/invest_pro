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

// ── Admin: Get System Settings ────────────────────────────────────────────────
export async function getSystemSettings(): Promise<any> {
  const admin = await getAdminSession()
  if (!admin) return null

  try {
    let settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          referralPercent: 10.0,
          level1Percent: 10.0,
          level2Percent: 5.0,
          level3Percent: 2.0,
          levelIncomeEnabled: true,
          starPerformerThreshold: 5000.0,
          starPerformerEnabled: true,
          tlRankRequiredReferrals: 5,
          tlRankMaxUsers: 25,
          tlRankEnabled: true,
        }
      })
    }
    return settings
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return null
  }
}

// ── Admin: Update System Settings ────────────────────────────────────────────
export async function updateSystemSettingsAction(data: any): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        referralPercent: Number(data.referralPercent),
        level1Percent: Number(data.level1Percent),
        level2Percent: Number(data.level2Percent),
        level3Percent: Number(data.level3Percent),
        levelIncomeEnabled: Boolean(data.levelIncomeEnabled),
        starPerformerThreshold: Number(data.starPerformerThreshold),
        starPerformerEnabled: Boolean(data.starPerformerEnabled),
        tlRankRequiredReferrals: Number(data.tlRankRequiredReferrals),
        tlRankMaxUsers: Number(data.tlRankMaxUsers),
        tlRankEnabled: Boolean(data.tlRankEnabled),
      },
      create: {
        id: 'default',
        referralPercent: Number(data.referralPercent),
        level1Percent: Number(data.level1Percent),
        level2Percent: Number(data.level2Percent),
        level3Percent: Number(data.level3Percent),
        levelIncomeEnabled: Boolean(data.levelIncomeEnabled),
        starPerformerThreshold: Number(data.starPerformerThreshold),
        starPerformerEnabled: Boolean(data.starPerformerEnabled),
        tlRankRequiredReferrals: Number(data.tlRankRequiredReferrals),
        tlRankMaxUsers: Number(data.tlRankMaxUsers),
        tlRankEnabled: Boolean(data.tlRankEnabled),
      }
    })

    revalidatePath('/admin/dashboard/settings')
    return { success: true, message: 'System settings updated successfully' }
  } catch (error) {
    console.error('Error updating system settings:', error)
    return { success: false, message: 'Failed to update system settings' }
  }
}

// ── Admin: Manual Adjust Wallet Balance ───────────────────────────────────────
export async function adjustUserBalanceAction(
  userId: string,
  walletType: 'MAIN' | 'BONUS' | 'REFERRAL' | 'LEVEL' | 'REWARD' | 'SHARE',
  amount: number,
  operation: 'ADD' | 'SUBTRACT'
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Invalid amount' }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return { success: false, message: 'Wallet not found' }

    let field: keyof typeof wallet
    let txType: any = 'BONUS'

    switch (walletType) {
      case 'MAIN':
        field = 'mainBalance'
        txType = operation === 'ADD' ? 'DEPOSIT' : 'WITHDRAWAL'
        break
      case 'BONUS':
        field = 'bonusBalance'
        txType = 'BONUS'
        break
      case 'REFERRAL':
        field = 'referralBalance'
        txType = 'REFERRAL_BONUS'
        break
      case 'LEVEL':
        field = 'levelBalance'
        txType = 'LEVEL_INCOME'
        break
      case 'REWARD':
        field = 'rewardBalance'
        txType = 'REWARD'
        break
      case 'SHARE':
        field = 'shareBalance'
        txType = 'SHARE_BONUS'
        break
      default:
        return { success: false, message: 'Invalid wallet type' }
    }

    const currentVal = wallet[field] as number
    if (operation === 'SUBTRACT' && currentVal < amount) {
      return { success: false, message: `Insufficient balance in ${walletType} wallet (Current: ₹${currentVal})` }
    }

    const delta = operation === 'ADD' ? amount : -amount

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { [field]: { increment: delta } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: txType,
          amount,
          status: 'COMPLETED',
          description: `Admin manual ${operation === 'ADD' ? 'addition' : 'deduction'} of ₹${amount} to ${walletType} wallet`,
          walletType: walletType as any,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: `Wallet Adjusted 💼`,
          message: `Admin has manually ${operation === 'ADD' ? 'added' : 'deducted'} ₹${amount.toLocaleString('en-IN')} ${operation === 'ADD' ? 'to' : 'from'} your ${walletType} wallet.`,
          type: operation === 'ADD' ? 'SUCCESS' : 'WARNING',
        },
      }),
    ])

    // Trigger promotions check if MAIN wallet got incremented
    if (walletType === 'MAIN' && operation === 'ADD') {
      const { checkStarPerformer } = require('./rules')
      await checkStarPerformer(userId)
    }

    revalidatePath('/admin/dashboard/wallet')
    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard')
    return { success: true, message: `Manually adjusted balance successfully` }
  } catch (error) {
    console.error('Error adjusting wallet balance:', error)
    return { success: false, message: 'Failed to adjust wallet balance' }
  }
}

// ── Admin: Toggle Rank/Badge manually ─────────────────────────────────────────
export async function toggleUserRankAction(
  userId: string,
  rankType: 'starPerformer' | 'tlRank',
  value: boolean
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const updateData: any = { [rankType]: value }
    if (rankType === 'tlRank' && value) {
      updateData.tlRankEarnedAt = new Date()
    } else if (rankType === 'tlRank' && !value) {
      updateData.tlRankEarnedAt = null
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    await prisma.notification.create({
      data: {
        userId,
        title: value ? `Badge Awarded! 🏆` : `Rank Revoked ⚠️`,
        message: value 
          ? `Admin has manually awarded you the ${rankType === 'starPerformer' ? 'Star Performer' : 'TL Rank'} status.` 
          : `Admin has manually removed your ${rankType === 'starPerformer' ? 'Star Performer' : 'TL Rank'} status.`,
        type: value ? 'SUCCESS' : 'WARNING',
      },
    })

    revalidatePath('/admin/dashboard/users')
    revalidatePath('/dashboard')
    return { success: true, message: `Successfully ${value ? 'awarded' : 'removed'} rank/badge` }
  } catch (error) {
    console.error('Error toggling rank status:', error)
    return { success: false, message: 'Failed to toggle user rank status' }
  }
}

// ── Membership Plan Management ───────────────────────────────────────────────
export async function upsertMembershipPlanAction(data: any): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const { id, ...payload } = data

    const planData = {
      name: payload.name,
      price: Number(payload.price),
      durationDays: Number(payload.durationDays),
      depositBonus: Number(payload.depositBonus || 0),
      referralLevel1: Number(payload.referralLevel1 || 10.0),
      referralLevel2: Number(payload.referralLevel2 || 0.0),
      referralLevel3: Number(payload.referralLevel3 || 0.0),
      withdrawalTime: payload.withdrawalTime || '24-48 Hours',
      support: payload.support || 'Standard Email',
      features: Array.isArray(payload.features) ? payload.features : [],
      color: payload.color || '#3B82F6',
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    }

    if (id) {
      await prisma.membershipPlan.update({
        where: { id },
        data: planData,
      })
    } else {
      await prisma.membershipPlan.create({
        data: planData,
      })
    }

    revalidatePath('/admin/dashboard/memberships')
    revalidatePath('/dashboard/membership/free')
    revalidatePath('/dashboard/membership/premium')
    return { success: true, message: `Membership plan ${id ? 'updated' : 'created'} successfully` }
  } catch (error) {
    console.error('Error saving membership plan:', error)
    return { success: false, message: 'Failed to save membership plan' }
  }
}

export async function deleteMembershipPlanAction(id: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.membershipPlan.delete({
      where: { id },
    })

    revalidatePath('/admin/dashboard/memberships')
    revalidatePath('/dashboard/membership/free')
    revalidatePath('/dashboard/membership/premium')
    return { success: true, message: 'Membership plan deleted successfully' }
  } catch (error) {
    console.error('Error deleting membership plan:', error)
    return { success: false, message: 'Failed to delete membership plan' }
  }
}

