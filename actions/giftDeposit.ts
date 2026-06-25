'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function submitGiftDepositAction(data: {
  amount: number
  proofUrl?: string
  utrNumber?: string
}): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, message: 'Unauthorized. Please login again.' }
    }

    // 1. Verify user has an active membership
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: { membershipPlan: true }
    })

    if (!dbUser) {
      return { success: false, message: 'User not found.' }
    }

    const hasMembership =
      Boolean(dbUser.membershipPlanId && dbUser.membershipPlanActivatedAt) ||
      Boolean(dbUser.basicMembershipActivatedAt && dbUser.basicMembershipAmount > 0)
    if (!hasMembership) {
      return { success: false, message: 'You must activate a membership plan before applying for a welcome gift.' }
    }

    const latestGift = await prisma.gift.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, deliveryStatus: true },
    })

    if (!latestGift) {
      return { success: false, message: 'Your first gift request is free. Please submit your shipping address first.' }
    }

    if (latestGift.deliveryStatus !== 'DELIVERED') {
      return { success: false, message: 'You can deposit for the next gift only after confirming your previous gift has been received.' }
    }

    // 4. Get required gift deposit amount from settings
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    const required = settings?.giftDepositAmount ?? 0

    if (required <= 0) {
      return { success: false, message: 'No gift deposit is required at this time.' }
    }

    // 5. Validate submitted amount matches required
    if (Math.abs(data.amount - required) > 0.005) {
      return {
        success: false,
        message: `The deposit amount must be exactly ₹${required.toLocaleString('en-IN')}.`
      }
    }

    // 6. Check for an existing PENDING gift deposit (don't allow duplicates)
    const existingPending = await prisma.giftDeposit.findFirst({
      where: {
        userId: session.id,
        status: 'PENDING',
        createdAt: { gt: latestGift.createdAt },
      }
    })
    if (existingPending) {
      return {
        success: false,
        message: 'You already have a pending gift deposit request. Please wait for admin approval.'
      }
    }

    // 7. Check if already approved
    const existingApproved = await prisma.giftDeposit.findFirst({
      where: {
        userId: session.id,
        status: 'APPROVED',
        createdAt: { gt: latestGift.createdAt },
      }
    })
    if (existingApproved) {
      return {
        success: false,
        message: 'Your gift deposit has already been approved. You can now fill in your shipping address.'
      }
    }

    // 8. Create the gift deposit record
    await prisma.giftDeposit.create({
      data: {
        userId: session.id,
        amount: data.amount,
        proofUrl: data.proofUrl || null,
        utrNumber: data.utrNumber || null,
        status: 'PENDING'
      }
    })

    // Get current pending welcome gifts and gift deposits count
    const [pendingGifts, pendingGiftDeps] = await Promise.all([
      prisma.gift.count({ where: { deliveryStatus: 'PENDING' } }),
      prisma.giftDeposit.count({ where: { status: 'PENDING' } }),
    ])
    const totalGiftsPending = pendingGifts + pendingGiftDeps

    // 9. Notify user
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: `Gift Deposit Submitted 🎁 (Pending: ${totalGiftsPending})`,
        message: `Your gift deposit of ₹${data.amount.toLocaleString('en-IN')} has been submitted and is pending admin approval. Total pending gifts/deposits: ${totalGiftsPending}.`,
        type: 'INFO'
      }
    })

    revalidatePath('/dashboard/gift')
    return { success: true, message: 'Gift deposit submitted successfully! Please wait for admin approval.' }
  } catch (error: unknown) {
    console.error('Error submitting gift deposit:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }
}
