'use server'

import { prisma } from '@/lib/prisma'
import { getSession, getAdminSession } from '@/lib/auth'
import { creditDueDepositYields } from '@/lib/depositYield'
import { revalidatePath } from 'next/cache'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const MAX_MEMBERSHIP_YIELD_DAYS = 1000

function get10AMIST(d: Date): Date {
  const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in ms
  const istTime = new Date(d.getTime() + istOffset)
  const year = istTime.getUTCFullYear()
  const month = istTime.getUTCMonth()
  const dateVal = istTime.getUTCDate()
  return new Date(Date.UTC(year, month, dateVal, 4, 30, 0, 0))
}

export async function getDailyTaskSettingsAction() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: {
      dailyTaskEnabled: true,
      dailyTaskMediaUrl: true,
      dailyTaskMediaType: true,
      dailyTaskDuration: true,
      dailyTaskMessage: true,
    }
  })
  return settings || {
    dailyTaskEnabled: false,
    dailyTaskMediaUrl: '',
    dailyTaskMediaType: 'IMAGE',
    dailyTaskDuration: 30,
    dailyTaskMessage: "You must watch this image/video for the full duration set by the admin to qualify for today's daily yield reward."
  }
}

export async function saveDailyTaskSettingsAction(formData: FormData) {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const enabled = formData.get('dailyTaskEnabled') === 'true'
  const mediaType = formData.get('dailyTaskMediaType')?.toString() || 'IMAGE'
  const duration = parseInt(formData.get('dailyTaskDuration')?.toString() || '30', 10)
  const message = formData.get('dailyTaskMessage')?.toString() || ''
  
  let mediaUrl = formData.get('dailyTaskMediaUrl')?.toString() || ''
  const imageFile = formData.get('dailyTaskImage') as File | null

  try {
    if (mediaType === 'IMAGE' && imageFile && imageFile.size > 0) {
      if (imageFile.size > 1024 * 1024) {
        return { success: false, message: 'Image must be smaller than 1 MB' }
      }

      // Try Cloudinary first
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, '')
      const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, '')
      const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, '')

      const isPlaceholder = (val: string | undefined) => {
        if (!val) return true
        const clean = val.trim().toLowerCase()
        return clean.includes('your_') || clean.includes('placeholder') || clean.includes('***') || clean === ''
      }

      const isCloudinaryConfigured = cloudName && !isPlaceholder(cloudName) && apiKey && !isPlaceholder(apiKey) && apiSecret && !isPlaceholder(apiSecret)

      let uploaded = false
      if (isCloudinaryConfigured) {
        try {
          const { uploadToCloudinary } = await import('@/lib/cloudinary')
          const fileBuffer = Buffer.from(await imageFile.arrayBuffer())
          mediaUrl = await uploadToCloudinary(fileBuffer, `dailytask_${Date.now()}`)
          uploaded = true
        } catch (err) {
          console.error('Cloudinary upload failed for daily task, falling back:', err)
        }
      }

      if (!uploaded) {
        const fs = await import('fs')
        const path = await import('path')
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const ext = path.extname(imageFile.name) || '.png'
        const fileName = `dailytask_${Date.now()}${ext}`
        const filePath = path.join(uploadDir, fileName)
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer())
        
        try {
          await fs.promises.writeFile(filePath, fileBuffer)
          mediaUrl = `/uploads/${fileName}`
        } catch (writeError) {
          console.warn('Local filesystem write failed. Falling back to data url:', writeError)
          const base64 = fileBuffer.toString('base64')
          mediaUrl = `data:${imageFile.type || 'image/png'};base64,${base64}`
        }
      }
    }

    await prisma.systemSettings.update({
      where: { id: 'default' },
      data: {
        dailyTaskEnabled: enabled,
        dailyTaskMediaUrl: mediaUrl,
        dailyTaskMediaType: mediaType,
        dailyTaskDuration: duration,
        dailyTaskMessage: message,
      }
    })

    revalidatePath('/admin/dashboard/daily-task')
    revalidatePath('/dashboard')
    return { success: true, message: 'Daily Task settings updated successfully.' }
  } catch (error: any) {
    console.error('Error saving daily task settings:', error)
    return { success: false, message: error.message || 'Failed to save settings' }
  }
}

export async function checkUserDailyTaskEligibilityAction() {
  const session = await getSession()
  if (!session) return { eligible: false, hasDueYield: false, settings: null }

  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: {
      dailyTaskEnabled: true,
      dailyTaskMediaUrl: true,
      dailyTaskMediaType: true,
      dailyTaskDuration: true,
      dailyTaskMessage: true,
    }
  })

  if (!settings) return { eligible: false, hasDueYield: false, settings: null }

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { membershipPlan: true }
  })

  if (!user || !user.membershipPlan || !user.membershipPlanActivatedAt) {
    return { eligible: false, hasDueYield: false, settings: null }
  }

  const membershipAmount = user.membershipPlan.price
  const yieldPercent = user.membershipPlan.depositBonus
  if (membershipAmount <= 0 || yieldPercent <= 0) {
    return { eligible: false, hasDueYield: false, settings: null }
  }

  const now = new Date()
  const activationDate = user.membershipPlanActivatedAt
  const expiresAt = user.membershipPlanExpiresAt

  if (activationDate.getTime() > now.getTime()) {
    return { eligible: false, hasDueYield: false, settings: null }
  }
  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    return { eligible: false, hasDueYield: false, settings: null }
  }

  // Calculate due dates
  const T_0 = get10AMIST(activationDate)
  const firstCreditDate = activationDate.getTime() <= T_0.getTime()
    ? T_0
    : new Date(T_0.getTime() + ONE_DAY_MS)

  const eligibleTimestamps: Date[] = []
  for (let k = 1; k <= MAX_MEMBERSHIP_YIELD_DAYS; k++) {
    const D_k = new Date(firstCreditDate.getTime() + (k - 1) * ONE_DAY_MS)
    if (D_k.getTime() > now.getTime()) break
    if (expiresAt && D_k.getTime() > expiresAt.getTime()) break

    if (D_k.getTime() >= activationDate.getTime()) {
      if (!user.lastDailyYieldAt || D_k.getTime() > user.lastDailyYieldAt.getTime()) {
        eligibleTimestamps.push(D_k)
      }
    }
  }

  const hasDueYield = eligibleTimestamps.length > 0
  const eligible = settings.dailyTaskEnabled && hasDueYield

  return {
    eligible,
    hasDueYield,
    settings
  }
}

export async function claimDailyYieldAction() {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const check = await checkUserDailyTaskEligibilityAction()
    if (!check.hasDueYield) {
      return { success: false, message: 'No yields are currently due.' }
    }

    await creditDueDepositYields(session.id)

    revalidatePath('/dashboard')
    return { success: true, message: 'Daily yield reward successfully credited to your Reward Wallet.' }
  } catch (error: any) {
    console.error('Error claiming daily yield:', error)
    return { success: false, message: error.message || 'Failed to claim daily yield.' }
  }
}
