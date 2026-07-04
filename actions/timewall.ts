'use server'

import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { getTimeWallConfig, updateTimeWallConfig } from '@/lib/timewall'

export async function getTimeWallSettingsAction() {
  const admin = await getAdminSession()
  if (!admin) return null

  const config = await getTimeWallConfig()
  return {
    username: config.username,
    password: config.password,
    offerwallUrl: config.offerwallUrl,
    commissionPercent: config.commissionPercent,
    postbackSecret: config.postbackSecret,
  }
}

export async function updateTimeWallSettingsAction(data: {
  username: string
  password: string
  offerwallUrl: string
  commissionPercent: number
  postbackSecret?: string
}): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const commissionPercent = Number(data.commissionPercent)
  if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
    return { success: false, message: 'TimeWall commission must be between 0 and 100.' }
  }

  if (!data.offerwallUrl?.trim()) {
    return { success: false, message: 'TimeWall offerwall URL is required.' }
  }

  try {
    new URL(data.offerwallUrl.trim())
  } catch {
    return { success: false, message: 'Please enter a valid TimeWall offerwall URL.' }
  }

  try {
    await updateTimeWallConfig({
      username: data.username,
      password: data.password,
      offerwallUrl: data.offerwallUrl,
      commissionPercent,
      postbackSecret: data.postbackSecret || '',
    })

    revalidatePath('/admin/dashboard/settings')
    return { success: true, message: 'TimeWall settings updated successfully.' }
  } catch (error) {
    console.error('Update TimeWall settings error:', error)
    return { success: false, message: 'Failed to update TimeWall settings.' }
  }
}
