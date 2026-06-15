'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function acceptGiftAction(giftId: string): Promise<ApiResponse> {
  try {
    // 1. Verify Admin session
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return { success: false, message: 'Unauthorized. Admin login required.' }
    }

    // 2. Update Gift database record to ACCEPTED and record the timestamp
    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        deliveryStatus: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    // 3. Dispatch in-app notification to the target premium user
    await prisma.notification.create({
      data: {
        userId: gift.userId,
        title: 'Gift Request Accepted! 🎁',
        message: 'Your address details for the Premium Welcome Gift have been verified. We are preparing it for shipment.',
        type: 'SUCCESS'
      }
    })

    revalidatePath('/admin/dashboard/gifts')
    revalidatePath('/dashboard/gift')

    return { success: true, message: 'Gift request accepted successfully!' }
  } catch (error: any) {
    console.error('Error accepting gift request:', error)
    return { success: false, message: error.message || 'An error occurred during acceptance' }
  }
}

export async function updateGiftTrackingAction(
  giftId: string,
  data: {
    trackingNumber: string
    courierName: string
    dispatchDate: string | null
    expectedDeliveryDate: string | null
    deliveryStatus: 'PENDING' | 'ACCEPTED' | 'POSTED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    remarks?: string
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
        deliveryStatus: data.deliveryStatus,
        remarks: data.remarks || ''
      }
    })

    // 4. Dispatch in-app notification to the target premium user
    let statusText = 'Updated'
    if (data.deliveryStatus === 'ACCEPTED') statusText = 'Accepted'
    if (data.deliveryStatus === 'POSTED') statusText = 'Posted'
    if (data.deliveryStatus === 'IN_TRANSIT') statusText = 'In Transit'
    if (data.deliveryStatus === 'OUT_FOR_DELIVERY') statusText = 'Out for Delivery'
    if (data.deliveryStatus === 'DELIVERED') statusText = 'Delivered'

    let messageText = `Your welcome gift has been updated to: ${statusText}.`
    if (data.deliveryStatus === 'PENDING') {
      messageText = 'Your welcome gift packaging is currently being prepared.'
    } else if (data.deliveryStatus === 'ACCEPTED') {
      messageText = 'Your welcome gift request has been accepted and is being prepared for shipment.'
    } else if (data.courierName && data.trackingNumber) {
      messageText = `Your welcome gift has been updated to: ${statusText}. Carrier: ${data.courierName}. Tracking ID: ${data.trackingNumber}.`
    }

    await prisma.notification.create({
      data: {
        userId: gift.userId,
        title: `Gift Package ${statusText}! 🎁`,
        message: messageText,
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
