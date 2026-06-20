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
    const hasMembership = (dbUser.membershipPlanId && dbUser.membershipPlan && dbUser.membershipPlan.price > 0) ||
                          (dbUser.basicMembershipActivatedAt && dbUser.basicMembershipAmount > 0)
    if (!hasMembership) {
      return { success: false, message: 'You must activate a membership plan before applying for a welcome gift.' }
    }

    // 1d. Check if a gift deposit is required and has been approved
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    const requiredGiftDeposit = settings?.giftDepositAmount ?? 0
    if (requiredGiftDeposit > 0) {
      const approvedGiftDeposit = await prisma.giftDeposit.findFirst({
        where: { userId: session.id, status: 'APPROVED' }
      })
      if (!approvedGiftDeposit) {
        return {
          success: false,
          message: `A gift deposit of ₹${requiredGiftDeposit.toLocaleString('en-IN')} is required and must be approved by admin before you can submit a shipping address.`
        }
      }
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
        // Subsequent gift request -> Pay ₹2,500
        const wallet = await prisma.wallet.findUnique({
          where: { userId: session.id }
        })
        if (!wallet || wallet.mainBalance < 2500) {
          return { success: false, message: 'Insufficient balance in wallet. A payment of ₹2,500 is required for subsequent gift requests.' }
        }

        // Deduct payment and create new gift
        await prisma.$transaction(async (tx) => {
          const { deductFromWallets } = await import('./walletUtils')
          await deductFromWallets(tx, session.id, 2500)

          await tx.transaction.create({
            data: {
              userId: session.id,
              type: 'INVESTMENT',
              amount: 2500,
              status: 'COMPLETED',
              description: `Gift Request Payment (Request #${giftCount + 1})`,
              walletType: 'MAIN'
            }
          })

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

    // 4. Get current pending welcome gifts and gift deposits count
    const [pendingGifts, pendingGiftDeps] = await Promise.all([
      prisma.gift.count({ where: { deliveryStatus: 'PENDING' } }),
      prisma.giftDeposit.count({ where: { status: 'PENDING' } }),
    ])
    const totalGiftsPending = pendingGifts + pendingGiftDeps

    // Create an in-app notification
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: `Gift Address Received! 🎁 (Pending: ${totalGiftsPending})`,
        message: `Your address details for the Premium Welcome Gift have been saved. Total pending gifts/deposits: ${totalGiftsPending}.`,
        type: 'SUCCESS'
      }
    })

    revalidatePath('/dashboard/gift')
    return { success: true, message: 'Gift shipping details submitted successfully!' }
  } catch (error: any) {
    console.error('Error submitting gift address:', error)
    return { success: false, message: error.message || 'An error occurred during submission' }
  }
}
