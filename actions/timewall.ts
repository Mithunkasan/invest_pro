'use server'

import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { getTimeWallConfig, updateTimeWallConfig } from '@/lib/timewall'
import { prisma } from '@/lib/prisma'

export async function getTimeWallSettingsAction() {
  const admin = await getAdminSession()
  if (!admin) return null

  const config = await getTimeWallConfig()
  
  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: { timeWallPercentFree: true }
  })
  
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { price: 'asc' }
  })

  return {
    username: config.username,
    password: config.password,
    offerwallUrl: config.offerwallUrl,
    postbackSecret: config.postbackSecret,
    timeWallPercentFree: systemSettings?.timeWallPercentFree ?? 0.005,
    plans: plans.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      timeWallPercent: p.timeWallPercent ?? 0.005
    }))
  }
}

export async function updateTimeWallSettingsAction(data: {
  username: string
  password: string
  offerwallUrl: string
  postbackSecret?: string
  timeWallPercentFree: number
  planPercentages?: { id: string; timeWallPercent: number }[]
}): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  if (!data.offerwallUrl?.trim()) {
    return { success: false, message: 'TimeWall offerwall URL is required.' }
  }

  try {
    new URL(data.offerwallUrl.trim())
  } catch {
    return { success: false, message: 'Please enter a valid TimeWall offerwall URL.' }
  }

  const timeWallPercentFree = Number(data.timeWallPercentFree)
  if (!Number.isFinite(timeWallPercentFree) || timeWallPercentFree < 0) {
    return { success: false, message: 'Free user percentage must be a valid non-negative number.' }
  }

  try {
    await updateTimeWallConfig({
      username: data.username,
      password: data.password,
      offerwallUrl: data.offerwallUrl,
      postbackSecret: data.postbackSecret || '',
    })

    await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: { timeWallPercentFree },
      create: { id: 'default', timeWallPercentFree }
    })

    if (data.planPercentages && Array.isArray(data.planPercentages)) {
      for (const item of data.planPercentages) {
        await prisma.membershipPlan.update({
          where: { id: item.id },
          data: { timeWallPercent: Number(item.timeWallPercent) }
        })
      }
    }

    revalidatePath('/admin/dashboard/settings')
    revalidatePath('/admin/dashboard/memberships')
    return { success: true, message: 'TimeWall settings updated successfully.' }
  } catch (error) {
    console.error('Update TimeWall settings error:', error)
    return { success: false, message: 'Failed to update TimeWall settings.' }
  }
}
