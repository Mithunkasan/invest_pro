'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { distributeReferralAndLevelCommissions } from './rules'

export async function approveGiftDepositAction(giftDepositId: string): Promise<ApiResponse> {
  try {
    const admin = await getAdminSession()
    if (!admin || admin.type !== 'admin') {
      return { success: false, message: 'Unauthorized. Admin login required.' }
    }

    const giftDeposit = await prisma.giftDeposit.findUnique({
      where: { id: giftDepositId },
      include: { user: { select: { name: true, referredById: true } } }
    })

    if (!giftDeposit) {
      return { success: false, message: 'Gift deposit request not found.' }
    }
    if (giftDeposit.status !== 'PENDING') {
      return { success: false, message: 'This request has already been processed.' }
    }

    // Claim the pending request atomically so concurrent approvals cannot pay twice.
    const approval = await prisma.giftDeposit.updateMany({
      where: { id: giftDepositId, status: 'PENDING' },
      data: { status: 'APPROVED', approvedById: admin.id }
    })
    if (approval.count !== 1) {
      return { success: false, message: 'This request has already been processed.' }
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId: giftDeposit.userId,
        title: 'Gift Deposit Approved! 🎁',
        message: `Your gift deposit of ₹${giftDeposit.amount.toLocaleString('en-IN')} has been approved. You can now fill in your shipping address to claim your gift.`,
        type: 'SUCCESS'
      }
    })

    // Gift purchases use the same qualification-based upline structure as memberships.
    if (giftDeposit.amount > 0 && giftDeposit.user.referredById) {
      await distributeReferralAndLevelCommissions(
        giftDeposit.userId,
        giftDeposit.amount,
        giftDepositId,
        'GIFT'
      )
    }

    revalidatePath('/admin/dashboard/gifts')
    revalidatePath('/dashboard/gift')
    return { success: true, message: 'Gift deposit approved successfully!' }
  } catch (error: any) {
    console.error('Error approving gift deposit:', error)
    return { success: false, message: error.message || 'An error occurred during approval.' }
  }
}

export async function rejectGiftDepositAction(
  giftDepositId: string,
  remarks?: string
): Promise<ApiResponse> {
  try {
    const admin = await getAdminSession()
    if (!admin || admin.type !== 'admin') {
      return { success: false, message: 'Unauthorized. Admin login required.' }
    }

    const giftDeposit = await prisma.giftDeposit.findUnique({
      where: { id: giftDepositId }
    })

    if (!giftDeposit) {
      return { success: false, message: 'Gift deposit request not found.' }
    }
    if (giftDeposit.status !== 'PENDING') {
      return { success: false, message: 'This request has already been processed.' }
    }

    await prisma.giftDeposit.update({
      where: { id: giftDepositId },
      data: { status: 'REJECTED', approvedById: admin.id, remarks: remarks || null }
    })

    await prisma.notification.create({
      data: {
        userId: giftDeposit.userId,
        title: 'Gift Deposit Rejected',
        message: `Your gift deposit request of ₹${giftDeposit.amount.toLocaleString('en-IN')} was rejected.${remarks ? ` Reason: ${remarks}` : ' Please contact support for more details.'}`,
        type: 'ERROR'
      }
    })

    revalidatePath('/admin/dashboard/gifts')
    revalidatePath('/dashboard/gift')
    return { success: true, message: 'Gift deposit rejected.' }
  } catch (error: any) {
    console.error('Error rejecting gift deposit:', error)
    return { success: false, message: error.message || 'An error occurred during rejection.' }
  }
}
