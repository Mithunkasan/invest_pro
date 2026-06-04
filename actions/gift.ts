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

    // 1. Verify user is Premium member in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { memberType: true }
    })

    if (!dbUser || dbUser.memberType !== 'PREMIUM') {
      return { success: false, message: 'This feature is only available for Premium Members.' }
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

    // 3. Save to database using upsert (allow updates before shipping)
    await prisma.gift.upsert({
      where: { userId: session.id },
      update: {
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
      },
      create: {
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

    // 4. Create an in-app notification
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: 'Gift Address Received! 🎁',
        message: 'Your address details for the Premium Welcome Gift have been saved. We are preparing it for shipment.',
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
