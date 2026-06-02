'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function updateGiftTrackingAction(
  giftId: string,
  data: {
    trackingNumber: string
    courierName: string
    dispatchDate: string | null
    expectedDeliveryDate: string | null
    deliveryStatus: 'PENDING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  }
): Promise<ApiResponse> {
  try {
    // 1. Verify Admin session
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return { success: false, message: 'Unauthorized. Admin login required.' }
    }

    // 2. Validate dispatch dates
    const dispatchDateVal = data.dispatchDate ? new Date(data.dispatchDate) : null
    const expectedDeliveryDateVal = data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null

    // 3. Update Gift database record
    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        trackingNumber: data.trackingNumber,
        courierName: data.courierName,
        dispatchDate: dispatchDateVal,
        expectedDeliveryDate: expectedDeliveryDateVal,
        deliveryStatus: data.deliveryStatus
      }
    })

    // 4. Dispatch in-app notification to the target premium user
    let statusText = 'Updated'
    if (data.deliveryStatus === 'SHIPPED') statusText = 'Shipped'
    if (data.deliveryStatus === 'OUT_FOR_DELIVERY') statusText = 'Out for Delivery'
    if (data.deliveryStatus === 'DELIVERED') statusText = 'Delivered'

    await prisma.notification.create({
      data: {
        userId: gift.userId,
        title: `Gift Package ${statusText}! 🎁`,
        message: data.deliveryStatus === 'PENDING' 
          ? 'Your welcome gift packaging is currently being prepared.'
          : `Your welcome gift has been updated to: ${statusText}. Carrier: ${data.courierName}. Tracking ID: ${data.trackingNumber}.`,
        type: 'SUCCESS'
      }
    })

    revalidatePath('/admin/dashboard/gifts')
    revalidatePath('/dashboard/gift')
    
    return { success: true, message: 'Gift dispatch tracking updated successfully!' }
  } catch (error: any) {
    console.error('Error updating gift tracking:', error)
    return { success: false, message: error.message || 'An error occurred during update' }
  }
}
