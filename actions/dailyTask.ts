'use server'

import { prisma } from '@/lib/prisma'
import { getSession, getAdminSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

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

// Helper to handle image upload safely (Cloudinary fallback to local/dataUrl)
async function handleImageUpload(imageFile: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, '')
  const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, '')
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, '')

  const isPlaceholder = (val: string | undefined) => {
    if (!val) return true
    const clean = val.trim().toLowerCase()
    return clean.includes('your_') || clean.includes('placeholder') || clean.includes('***') || clean === ''
  }

  const isCloudinaryConfigured = cloudName && !isPlaceholder(cloudName) && apiKey && !isPlaceholder(apiKey) && apiSecret && !isPlaceholder(apiSecret)

  let fileBuffer: Buffer | null = null
  try {
    fileBuffer = Buffer.from(await imageFile.arrayBuffer())
  } catch (bufErr) {
    console.error('Failed to read file buffer:', bufErr)
    throw new Error('Failed to read uploaded image data.')
  }

  if (isCloudinaryConfigured && fileBuffer) {
    try {
      const { uploadToCloudinary } = await import('@/lib/cloudinary')
      const secureUrl = await uploadToCloudinary(fileBuffer, `dailytask_${Date.now()}`)
      return secureUrl
    } catch (err) {
      console.error('Cloudinary upload failed for daily task, falling back:', err)
    }
  }

  // Local filesystem fallback
  if (fileBuffer) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const ext = path.extname(imageFile.name) || '.png'
      const fileName = `dailytask_${Date.now()}${ext}`
      const filePath = path.join(uploadDir, fileName)
      await fs.promises.writeFile(filePath, fileBuffer)
      return `/uploads/${fileName}`
    } catch (writeError) {
      console.warn('Local filesystem write failed. Falling back to data url:', writeError)
      const base64 = fileBuffer.toString('base64')
      return `data:${imageFile.type || 'image/png'};base64,${base64}`
    }
  }

  throw new Error('No image buffer to upload.')
}

export async function getDailyTaskSettingsAction() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: {
      dailyTaskEnabled: true,
      dailyTaskMessage: true,
    }
  })
  return settings || {
    dailyTaskEnabled: false,
    dailyTaskMessage: "You must watch this image/video for the full duration set by the admin to qualify for today's daily yield reward."
  }
}

// Saves global settings (like enabled status)
export async function saveDailyTaskSettingsAction(formData: FormData) {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const enabled = formData.get('dailyTaskEnabled') === 'true'
  const message = formData.get('dailyTaskMessage')?.toString() || ''

  try {
    await prisma.systemSettings.update({
      where: { id: 'default' },
      data: {
        dailyTaskEnabled: enabled,
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

// CRUD actions for Daily Tasks
export async function getDailyTasksAction() {
  const admin = await getAdminSession()
  if (!admin) return []

  try {
    return await prisma.dailyTask.findMany({
      orderBy: { startAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching daily tasks:', error)
    return []
  }
}

export async function createDailyTaskAction(formData: FormData) {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const mediaType = formData.get('mediaType')?.toString() || 'IMAGE'
  const duration = parseInt(formData.get('duration')?.toString() || '30', 10)
  const message = formData.get('message')?.toString() || ''
  const startDate = formData.get('startDate')?.toString() || ''
  const startTime = formData.get('startTime')?.toString() || ''
  const expiryDate = formData.get('expiryDate')?.toString() || ''
  const expiryTime = formData.get('expiryTime')?.toString() || ''

  if (!startDate || !startTime || !expiryDate || !expiryTime) {
    return { success: false, message: 'All date and time fields are required.' }
  }

  let mediaUrl = formData.get('mediaUrl')?.toString() || ''
  const imageFile = formData.get('imageFile') as File | null

  try {
    const startAt = new Date(`${startDate}T${startTime}:00`)
    const expireAt = new Date(`${expiryDate}T${expiryTime}:00`)

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(expireAt.getTime())) {
      return { success: false, message: 'Invalid start or expiry date/time.' }
    }

    if (expireAt <= startAt) {
      return { success: false, message: 'Expiry date/time must be after start date/time.' }
    }

    if (mediaType === 'IMAGE') {
      if (imageFile && imageFile.size > 0) {
        mediaUrl = await handleImageUpload(imageFile)
      } else if (!mediaUrl) {
        return { success: false, message: 'Image upload or image URL is required for image tasks.' }
      }
    } else {
      if (!mediaUrl) {
        return { success: false, message: 'Video URL is required for video tasks.' }
      }
    }

    await prisma.dailyTask.create({
      data: {
        mediaUrl,
        mediaType,
        duration,
        message,
        startDate,
        startTime,
        expiryDate,
        expiryTime,
        startAt,
        expireAt,
      }
    })

    revalidatePath('/admin/dashboard/daily-task')
    revalidatePath('/dashboard')
    return { success: true, message: 'Daily task created successfully.' }
  } catch (error: any) {
    console.error('Error creating daily task:', error)
    return { success: false, message: error.message || 'Failed to create daily task.' }
  }
}

export async function updateDailyTaskAction(id: string, formData: FormData) {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const mediaType = formData.get('mediaType')?.toString() || 'IMAGE'
  const duration = parseInt(formData.get('duration')?.toString() || '30', 10)
  const message = formData.get('message')?.toString() || ''
  const startDate = formData.get('startDate')?.toString() || ''
  const startTime = formData.get('startTime')?.toString() || ''
  const expiryDate = formData.get('expiryDate')?.toString() || ''
  const expiryTime = formData.get('expiryTime')?.toString() || ''

  if (!startDate || !startTime || !expiryDate || !expiryTime) {
    return { success: false, message: 'All date and time fields are required.' }
  }

  let mediaUrl = formData.get('mediaUrl')?.toString() || ''
  const imageFile = formData.get('imageFile') as File | null

  try {
    const startAt = new Date(`${startDate}T${startTime}:00`)
    const expireAt = new Date(`${expiryDate}T${expiryTime}:00`)

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(expireAt.getTime())) {
      return { success: false, message: 'Invalid start or expiry date/time.' }
    }

    if (expireAt <= startAt) {
      return { success: false, message: 'Expiry date/time must be after start date/time.' }
    }

    const task = await prisma.dailyTask.findUnique({ where: { id } })
    if (!task) return { success: false, message: 'Task not found.' }

    if (mediaType === 'IMAGE') {
      if (imageFile && imageFile.size > 0) {
        mediaUrl = await handleImageUpload(imageFile)
      } else {
        mediaUrl = mediaUrl || task.mediaUrl
      }
    } else {
      if (!mediaUrl) {
        return { success: false, message: 'Video URL is required for video tasks.' }
      }
    }

    await prisma.dailyTask.update({
      where: { id },
      data: {
        mediaUrl,
        mediaType,
        duration,
        message,
        startDate,
        startTime,
        expiryDate,
        expiryTime,
        startAt,
        expireAt,
      }
    })

    revalidatePath('/admin/dashboard/daily-task')
    revalidatePath('/dashboard')
    return { success: true, message: 'Daily task updated successfully.' }
  } catch (error: any) {
    console.error('Error updating daily task:', error)
    return { success: false, message: error.message || 'Failed to update daily task.' }
  }
}

export async function deleteDailyTaskAction(id: string) {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.dailyTask.delete({
      where: { id }
    })
    revalidatePath('/admin/dashboard/daily-task')
    revalidatePath('/dashboard')
    return { success: true, message: 'Daily task deleted successfully.' }
  } catch (error: any) {
    console.error('Error deleting daily task:', error)
    return { success: false, message: error.message || 'Failed to delete daily task.' }
  }
}

export async function checkUserDailyTaskEligibilityAction() {
  const session = await getSession()
  if (!session) return { eligible: false, hasDueYield: false, settings: null }

  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
      select: {
        dailyTaskEnabled: true,
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

    // Generate daily 10:00 AM IST timestamps to see if yields are due
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

    if (settings.dailyTaskEnabled) {
      // Find the currently active task
      const activeTask = await prisma.dailyTask.findFirst({
        where: {
          startAt: { lte: now },
          expireAt: { gte: now },
        },
        orderBy: { startAt: 'desc' }
      })

      if (!activeTask) {
        // If there's no active task, user is not eligible to complete/claim
        return { eligible: false, hasDueYield, settings: null }
      }

      // Check if user completed this active task
      const completion = await prisma.dailyTaskCompletion.findUnique({
        where: {
          userId_taskId: {
            userId: session.id,
            taskId: activeTask.id
          }
        }
      })

      const completed = !!completion
      const eligible = hasDueYield && !completed

      return {
        eligible,
        hasDueYield,
        settings: {
          dailyTaskEnabled: true,
          dailyTaskMediaUrl: activeTask.mediaUrl,
          dailyTaskMediaType: activeTask.mediaType,
          dailyTaskDuration: activeTask.duration,
          dailyTaskMessage: activeTask.message || settings.dailyTaskMessage || '',
          activeTaskId: activeTask.id,
          completed
        }
      }
    }

    return {
      eligible: false,
      hasDueYield,
      settings: {
        dailyTaskEnabled: false,
        dailyTaskMediaUrl: '',
        dailyTaskMediaType: 'IMAGE',
        dailyTaskDuration: 30,
        dailyTaskMessage: settings.dailyTaskMessage || '',
        activeTaskId: '',
        completed: false
      }
    }
  } catch (error) {
    console.error('Error checking user daily task eligibility:', error)
    return { eligible: false, hasDueYield: false, settings: null }
  }
}

export async function claimDailyYieldAction(taskId?: string) {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const now = new Date()
    let activeTaskId = taskId

    // If no taskId is supplied, find the currently active daily task
    if (!activeTaskId) {
      const activeTask = await prisma.dailyTask.findFirst({
        where: {
          startAt: { lte: now },
          expireAt: { gte: now },
        },
        orderBy: { startAt: 'desc' }
      })
      if (!activeTask) {
        return { success: false, message: 'No active daily task is available to claim rewards.' }
      }
      activeTaskId = activeTask.id
    }

    // Verify task is indeed active
    const task = await prisma.dailyTask.findUnique({
      where: { id: activeTaskId }
    })

    if (!task) {
      return { success: false, message: 'Daily task not found.' }
    }

    if (task.startAt.getTime() > now.getTime() || task.expireAt.getTime() < now.getTime()) {
      return { success: false, message: 'This task is not currently active.' }
    }

    // Check if user already completed this task
    const existingCompletion = await prisma.dailyTaskCompletion.findUnique({
      where: {
        userId_taskId: {
          userId: session.id,
          taskId: activeTaskId
        }
      }
    })

    if (existingCompletion) {
      return { success: false, message: 'You have already completed this task.' }
    }

    // Fetch user and check active plan
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { membershipPlan: true }
    })

    if (!user || !user.membershipPlan || !user.membershipPlanActivatedAt) {
      return { success: false, message: 'No active membership plan found.' }
    }

    const membershipAmount = user.membershipPlan.price
    const yieldPercent = user.membershipPlan.depositBonus
    if (membershipAmount <= 0 || yieldPercent <= 0) {
      return { success: false, message: 'Invalid membership plan rewards.' }
    }

    const today10AM = get10AMIST(now)

    // Check if they already claimed today's yield
    if (user.lastDailyYieldAt && user.lastDailyYieldAt.getTime() >= today10AM.getTime()) {
      return { success: false, message: 'You have already received your daily yield for today.' }
    }

    // Record Completion
    await prisma.dailyTaskCompletion.create({
      data: {
        userId: session.id,
        taskId: activeTaskId
      }
    })

    // Credit exactly 1 Day of daily yield
    const totalCreditAmount = Number(((membershipAmount * yieldPercent) / 100).toFixed(2))

    if (totalCreditAmount > 0) {
      const { syncWalletMainBalance } = await import('@/actions/walletUtils')
      
      await prisma.$transaction(async (tx) => {
        // Advance user's lastDailyYieldAt to today's 10:00 AM IST.
        // This marks today's yield as claimed and skips/forfeits any previous unclaimed days.
        await tx.user.update({
          where: { id: session.id },
          data: { lastDailyYieldAt: today10AM }
        })

        // Increment Reward Wallet and totalEarned
        await tx.wallet.upsert({
          where: { userId: session.id },
          update: {
            rewardBalance: { increment: totalCreditAmount },
            totalEarned: { increment: totalCreditAmount },
          },
          create: {
            userId: session.id,
            rewardBalance: totalCreditAmount,
            totalEarned: totalCreditAmount,
          },
        })

        // Create Transaction record
        await tx.transaction.create({
          data: {
            userId: session.id,
            type: 'PROFIT',
            amount: totalCreditAmount,
            status: 'COMPLETED',
            walletType: 'REWARD',
            description: `Daily yield reward on membership plan (${user.membershipPlan!.name}) for completing task`,
            reference: `MEMBERSHIP_YIELD:${user.membershipPlanId}:${today10AM.getTime()}`,
          },
        })

        // Sync user's main wallet balance
        await syncWalletMainBalance(tx, session.id)
      })
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'Daily task completed and yield reward successfully credited to your Reward Wallet.' }
  } catch (error: any) {
    console.error('Error claiming daily yield:', error)
    return { success: false, message: error.message || 'Failed to claim daily yield.' }
  }
}
