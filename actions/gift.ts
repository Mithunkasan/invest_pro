'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { giftSchema } from '@/utils/validators'
import type { ApiResponse } from '@/types'
import { getLocationsTree } from '@/lib/indiaLocationsLoader'

export async function submitGiftAction(
  data: {
    fullName: string
    age: number
    mobile: string
    email: string
    houseNo: string
    area: string
    state: string
    district: string
    city: string
    pinCode: string
  }
): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, message: 'Unauthorized. Please login again.' }
    }

    // 1. Verify user is Premium member in DB and get their plan details
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: { membershipPlan: true }
    })

    if (!dbUser) {
      return { success: false, message: 'User not found.' }
    }


    // 1c. Check if user has activated a membership plan
    const hasMembership = Boolean(dbUser.membershipPlanId && dbUser.membershipPlanActivatedAt) ||
                          Boolean(dbUser.basicMembershipActivatedAt && dbUser.basicMembershipAmount > 0)
    if (!hasMembership) {
      return { success: false, message: 'You must activate a membership plan before applying for a welcome gift.' }
    }

    // 2. Validate details with Zod
    const parsed = giftSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      // Extract the first error message for user-facing alert
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Validation failed'
      return { 
        success: false, 
        message: firstError, 
        errors: fieldErrors as Record<string, string> 
      }
    }

    // 2b. Validate cascading location combination against CSV data
    const tree = await getLocationsTree()
    const stateData = tree[parsed.data.state]
    if (!stateData) {
      return { success: false, message: `Invalid location: State "${parsed.data.state}" is not valid.` }
    }
    const districtData = stateData[parsed.data.district]
    if (!districtData) {
      return { success: false, message: `Invalid location: District "${parsed.data.district}" is not valid for state "${parsed.data.state}".` }
    }
    const expectedPincode = districtData[parsed.data.city]
    if (!expectedPincode) {
      return { success: false, message: `Invalid location: City "${parsed.data.city}" is not valid for district "${parsed.data.district}".` }
    }
    if (expectedPincode !== parsed.data.pinCode) {
      return { success: false, message: `Invalid location: PIN Code "${parsed.data.pinCode}" does not match city "${parsed.data.city}".` }
    }

    // 3. Save to database or update pending request
    const activeGift = await prisma.gift.findFirst({
      where: {
        userId: session.id,
        deliveryStatus: { in: ['PENDING', 'ACCEPTED', 'POSTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] }
      }
    })

    if (activeGift) {
      if (activeGift.deliveryStatus === 'PENDING') {
        // Allow updating the pending address details
        await prisma.gift.update({
          where: { id: activeGift.id },
          data: {
            fullName: parsed.data.fullName,
            age: parsed.data.age,
            mobile: parsed.data.mobile,
            email: parsed.data.email,
            houseNo: parsed.data.houseNo,
            area: parsed.data.area,
            state: parsed.data.state,
            district: parsed.data.district,
            city: parsed.data.city,
            pinCode: parsed.data.pinCode,
          }
        })
      } else {
        // Status is ACCEPTED, POSTED, IN_TRANSIT or OUT_FOR_DELIVERY
        return {
          success: false,
          message: 'You cannot submit or modify a gift request while your previous gift is being processed or in transit.'
        }
      }
    } else {
      // No active gift request. Count past gifts to see if we should charge.
      const giftCount = await prisma.gift.count({
        where: { userId: session.id }
      })

      if (giftCount >= 1) {
        const latestGift = await prisma.gift.findFirst({
          where: { userId: session.id },
          orderBy: { createdAt: 'desc' },
          select: { deliveryStatus: true },
        })
        if (latestGift?.deliveryStatus !== 'DELIVERED') {
          return {
            success: false,
            message: 'You can apply for the next gift only after your previous gift has been delivered.',
          }
        }

        const settings = await prisma.systemSettings.findUnique({
          where: { id: 'default' },
          select: { giftDepositAmount: true },
        })
        const configuredAmount = settings?.giftDepositAmount ?? 0
        const subsequentGiftAmount = Number.isFinite(configuredAmount)
          ? Math.max(0, configuredAmount)
          : 0

        // Subsequent gift request -> debit the admin-configured amount from Deposit Wallet.
        if (subsequentGiftAmount > 0) {
          const wallet = await prisma.wallet.findUnique({
            where: { userId: session.id },
            select: { depositBalance: true },
          })
          if (!wallet || wallet.depositBalance < subsequentGiftAmount) {
            return {
              success: false,
              message: `Insufficient Deposit Wallet balance. A payment of ₹${subsequentGiftAmount.toLocaleString('en-IN')} is required for subsequent gift requests.`,
            }
          }
        }

        // Deduct payment and create new gift
        await prisma.$transaction(async (tx) => {
          if (subsequentGiftAmount > 0) {
            const deduction = await tx.wallet.updateMany({
              where: {
                userId: session.id,
                depositBalance: { gte: subsequentGiftAmount },
              },
              data: { depositBalance: { decrement: subsequentGiftAmount } },
            })
            if (deduction.count !== 1) {
              throw new Error('Insufficient Deposit Wallet balance.')
            }

            await tx.transaction.create({
              data: {
                userId: session.id,
                type: 'INVESTMENT',
                amount: subsequentGiftAmount,
                status: 'COMPLETED',
                description: `Gift Request Payment from Deposit Wallet (Request #${giftCount + 1})`,
                walletType: 'MAIN'
              }
            })
          }

          await tx.gift.create({
            data: {
              userId: session.id,
              fullName: parsed.data.fullName,
              age: parsed.data.age,
              mobile: parsed.data.mobile,
              email: parsed.data.email,
              houseNo: parsed.data.houseNo,
              area: parsed.data.area,
              state: parsed.data.state,
              district: parsed.data.district,
              city: parsed.data.city,
              pinCode: parsed.data.pinCode,
              deliveryStatus: 'PENDING'
            }
          })
        })
      } else {
        // First gift request -> Free
        await prisma.gift.create({
          data: {
            userId: session.id,
            fullName: parsed.data.fullName,
            age: parsed.data.age,
            mobile: parsed.data.mobile,
            email: parsed.data.email,
            houseNo: parsed.data.houseNo,
            area: parsed.data.area,
            state: parsed.data.state,
            district: parsed.data.district,
            city: parsed.data.city,
            pinCode: parsed.data.pinCode,
            deliveryStatus: 'PENDING'
          }
        })
      }
    }

    // 4. Get current pending welcome gift requests for admin processing.
    const pendingGifts = await prisma.gift.count({
      where: { deliveryStatus: 'PENDING' },
    })

    // Create an in-app notification
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: `Gift Request Received! 🎁 (Pending: ${pendingGifts})`,
        message: `Your Premium Welcome Gift request has been sent to the admin for approval. Total pending gift requests: ${pendingGifts}.`,
        type: 'SUCCESS'
      }
    })

    revalidatePath('/dashboard/gift')
    return { success: true, message: 'Gift request submitted to the admin successfully!' }
  } catch (error: unknown) {
    console.error('Error submitting gift address:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during submission',
    }
  }
}
