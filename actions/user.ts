'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import type { ApiResponse } from '@/types'
import { deductFromWallets } from './walletUtils'

function isProfileComplete(data: {
  name?: string | null
  phone?: string | null
  dateOfBirth?: Date | null
  addressLine?: string | null
  city?: string | null
  state?: string | null
  pinCode?: string | null
}) {
  return Boolean(
    data.name?.trim() &&
    data.phone?.trim() &&
    data.dateOfBirth &&
    data.addressLine?.trim() &&
    data.city?.trim() &&
    data.state?.trim() &&
    data.pinCode?.trim()
  )
}

// ── Submit Deposit ────────────────────────────────────────────────────────────
export async function submitDeposit(formData: FormData): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const amount = Number(formData.get('amount'))
  const method = formData.get('method') as any
  const utrNumber = formData.get('utrNumber') as string

  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Invalid amount' }

  try {
    await prisma.deposit.create({
      data: {
        userId: session.id,
        amount,
        method,
        utrNumber,
        status: 'PENDING',
      },
    })

    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard/transactions')
    return { success: true, message: 'Deposit request submitted. Waiting for approval.' }
  } catch (error) {
    return { success: false, message: 'Failed to submit deposit' }
  }
}

// ── Submit Withdrawal ─────────────────────────────────────────────────────────
export async function submitWithdrawal(formData: FormData): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const amount = Number(formData.get('amount'))
  const bankName = formData.get('bankName')?.toString()
  const accountNo = formData.get('accountNo')?.toString()
  const ifsc = formData.get('ifsc')?.toString()
  const accountName = formData.get('accountName')?.toString()

  if (!bankName || !accountNo || !ifsc || !accountName) {
    return { success: false, message: 'All bank details are required' }
  }

  const bankDetails = { bankName, accountNo, ifsc, accountName }

  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Invalid amount' }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
    if (!wallet || wallet.mainBalance < amount) {
      return { success: false, message: 'Insufficient balance' }
    }

    await prisma.$transaction(async (tx) => {
      // Deduct from wallet immediately
      const walletDeductions = await deductFromWallets(tx, session.id, amount)
      
      // Create withdrawal request
      await tx.withdrawal.create({
        data: {
          userId: session.id,
          amount,
          bankDetails: { ...bankDetails, _walletDeductions: walletDeductions },
          status: 'PENDING',
        },
      })
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.id,
          type: 'WITHDRAWAL',
          amount,
          status: 'PENDING',
          description: 'Withdrawal request submitted',
          walletType: 'MAIN',
        },
      })
    })

    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard/transactions')
    return { success: true, message: 'Withdrawal request submitted' }
  } catch (error) {
    return { success: false, message: 'Failed to submit withdrawal' }
  }
}

// ── Start Smart Hybrid Digital Earning ────────────────────────────────────────
export async function startInvestment(planId: string, amount: number): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const [plan, wallet] = await Promise.all([
      prisma.investmentPlan.findUnique({ where: { id: planId } }),
      prisma.wallet.findUnique({ where: { userId: session.id } }),
    ])

    if (!plan || plan.status !== 'ACTIVE') return { success: false, message: 'Plan not available' }
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return { success: false, message: `Activation Plan must be between ₹${plan.minAmount} and ₹${plan.maxAmount}` }
    }

    if (!wallet || wallet.mainBalance < amount) {
      return { success: false, message: 'Insufficient balance in main wallet' }
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.durationDays)

    await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await deductFromWallets(tx, session.id, amount)
      // Create Smart Hybrid Digital Earning
      await tx.investment.create({
        data: {
          userId: session.id,
          planId,
          amount,
          endDate,
          status: 'ACTIVE',
        },
      })
      // Create transaction
      await tx.transaction.create({
        data: {
          userId: session.id,
          type: 'INVESTMENT',
          amount,
          status: 'COMPLETED',
          description: `activation plan in ${plan.name}`,
          walletType: 'MAIN',
        },
      })
    })



    revalidatePath('/dashboard')
    revalidatePath('/dashboard/investments')
    revalidatePath('/dashboard/wallet')
    return { success: true, message: `Successfully invested in ${plan.name}!` }
  } catch (error) {
    return { success: false, message: 'Failed to start Smart Hybrid Digital Earning' }
  }
}

// ── Submit KYC ────────────────────────────────────────────────────────────────
export async function submitKYC(formData: FormData): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const aadhaarNo = formData.get('aadhaarNo') as string
  const panNo = formData.get('panNo') as string
  const aadhaarFile = formData.get('aadhaarFile') as File | null
  const panFile = formData.get('panFile') as File | null

  if (!aadhaarNo || !panNo) {
    return { success: false, message: 'Aadhaar and PAN numbers are required.' }
  }

  if (!aadhaarFile || aadhaarFile.size === 0) {
    return { success: false, message: 'Aadhaar card image is required.' }
  }

  if (!panFile || panFile.size === 0) {
    return { success: false, message: 'PAN card image is required.' }
  }

  if (aadhaarFile.size > 500 * 1024 || panFile.size > 500 * 1024) {
    return { success: false, message: 'File size is too large. Please upload an image smaller than 500 KB.' }
  }

  try {
    let aadhaarUrl = ''
    let panUrl = ''

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, '')
    const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, '')
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, '')

    const isPlaceholder = (val: string | undefined) => {
      if (!val) return true
      const clean = val.trim().toLowerCase()
      return (
        clean.includes('your_') || 
        clean.includes('placeholder') || 
        clean.includes('***') || 
        clean === ''
      )
    }

    const isCloudinaryConfigured = 
      cloudName && !isPlaceholder(cloudName) &&
      apiKey && !isPlaceholder(apiKey) &&
      apiSecret && !isPlaceholder(apiSecret)

    if (isCloudinaryConfigured) {
      try {
        // 1. Upload Aadhaar Image to Cloudinary
        const aadhaarBuffer = Buffer.from(await aadhaarFile.arrayBuffer())
        aadhaarUrl = await uploadToCloudinary(aadhaarBuffer, `aadhaar_${session.id}`)

        // 2. Upload PAN Image to Cloudinary
        const panBuffer = Buffer.from(await panFile.arrayBuffer())
        panUrl = await uploadToCloudinary(panBuffer, `pan_${session.id}`)
      } catch (err) {
        console.error('Cloudinary upload failed, falling back to local storage:', err)
      }
    }

    if (!aadhaarUrl || !panUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }

        const getExtension = (file: File) => {
          const ext = path.extname(file.name)
          return ext || '.png'
        }

        const aadhaarExt = getExtension(aadhaarFile)
        const panExt = getExtension(panFile)

        const aadhaarFileName = `aadhaar_${session.id}_${Date.now()}${aadhaarExt}`
        const panFileName = `pan_${session.id}_${Date.now()}${panExt}`

        const aadhaarFilePath = path.join(uploadDir, aadhaarFileName)
        const panFilePath = path.join(uploadDir, panFileName)

        const aadhaarBuffer = Buffer.from(await aadhaarFile.arrayBuffer())
        const panBuffer = Buffer.from(await panFile.arrayBuffer())

        await fs.promises.writeFile(aadhaarFilePath, aadhaarBuffer)
        await fs.promises.writeFile(panFilePath, panBuffer)

        aadhaarUrl = `/uploads/${aadhaarFileName}`
        panUrl = `/uploads/${panFileName}`
      } catch (writeError) {
        console.warn('Local filesystem write failed (likely read-only environment). Falling back to base64 Data URLs:', writeError)
        
        const aadhaarBuffer = Buffer.from(await aadhaarFile.arrayBuffer())
        const panBuffer = Buffer.from(await panFile.arrayBuffer())
        
        const aadhaarBase64 = aadhaarBuffer.toString('base64')
        const panBase64 = panBuffer.toString('base64')
        
        aadhaarUrl = `data:${aadhaarFile.type || 'image/png'};base64,${aadhaarBase64}`
        panUrl = `data:${panFile.type || 'image/png'};base64,${panBase64}`
      }
    }

    await prisma.kYC.upsert({
      where: { userId: session.id },
      update: { 
        aadhaarNo, 
        panNo, 
        aadhaarUrl, 
        panUrl, 
        status: 'PENDING' 
      },
      create: { 
        userId: session.id, 
        aadhaarNo, 
        panNo, 
        aadhaarUrl, 
        panUrl, 
        status: 'PENDING' 
      },
    })

    // Get current pending count
    const pendingCount = await prisma.kYC.count({
      where: { status: 'PENDING' }
    })

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: `KYC Submission (Pending: ${pendingCount})`,
        message: `KYC documents submitted. Total pending KYC: ${pendingCount}.`,
        type: 'INFO',
      },
    })

    revalidatePath('/dashboard/kyc')
    revalidatePath('/admin/dashboard/kyc')
    return { success: true, message: 'KYC documents submitted and images uploaded successfully. Waiting for admin approval.' }
  } catch (error: any) {
    console.error('KYC submission error:', error)
    return { success: false, message: error.message || 'Failed to submit KYC' }
  }
}

// ── Buy Membership Plan ────────────────────────────────────────────────────────
export async function buyMembershipPlanAction(planId: string): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId, isActive: true }
    })
    if (!plan) return { success: false, message: 'Membership plan not found or inactive' }

    const [user, wallet] = await Promise.all([
      prisma.user.findUnique({ 
        where: { id: session.id },
        include: { membershipPlan: true }
      }),
      prisma.wallet.findUnique({ where: { userId: session.id } }),
    ])

    if (!user) return { success: false, message: 'User not found' }
    if (!wallet) return { success: false, message: 'Wallet not found' }

    if (user.membershipPlanId === plan.id) {
      return { success: false, message: `You are already subscribed to ${plan.name}!` }
    }

    // Downgrade validation
    const currentPlanPrice = user.membershipPlan?.price || 0
    if (plan.price <= currentPlanPrice) {
      return { success: false, message: 'You can only upgrade to a higher-level membership plan than your current active plan.' }
    }

    // Check for existing pending requests
    const pendingRequest = await prisma.membershipUpgradeRequest.findFirst({
      where: { userId: session.id, status: 'PENDING' }
    })
    if (pendingRequest) {
      return { success: false, message: 'You already have a pending upgrade request. Please wait for admin approval.' }
    }

    if (wallet.depositBalance < plan.price) {
      return { success: false, message: 'Insufficient balance in Deposit Wallet' }
    }

    await prisma.$transaction(async (tx) => {
      // Deduct from wallet if price > 0
      if (plan.price > 0) {
        await tx.wallet.update({
          where: { userId: session.id },
          data: { depositBalance: { decrement: plan.price } }
        })
        
        // Create pending transaction
        await tx.transaction.create({
          data: {
            userId: session.id,
            type: 'INVESTMENT',
            amount: plan.price,
            status: 'PENDING',
            description: `Upgrade to ${plan.name} (Pending Admin Approval)`,
            walletType: 'MAIN',
          },
        })
      }

      // Create upgrade request
      await tx.membershipUpgradeRequest.create({
        data: {
          userId: session.id,
          planId: plan.id,
          status: 'PENDING',
        },
      })

      // Get current pending count
      const pendingCount = await tx.membershipUpgradeRequest.count({
        where: { status: 'PENDING' }
      })

      // Send notification
      await tx.notification.create({
        data: {
          userId: session.id,
          title: `Upgrade Request Submitted 👑 (Pending: ${pendingCount})`,
          message: `Your request to upgrade to ${plan.name} has been submitted for admin approval. ₹${plan.price.toLocaleString('en-IN')} has been put on hold. Total pending upgrades: ${pendingCount}.`,
          type: 'INFO',
        },
      })
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/membership')
    revalidatePath('/dashboard/wallet')

    return { success: true, message: `Upgrade request to ${plan.name} submitted successfully for admin review!` }
  } catch (error) {
    console.error('Error purchasing membership plan:', error)
    return { success: false, message: 'Failed to process upgrade request' }
  }
}

// ── Upload Profile Picture to Cloudinary ───────────────────────────────────────
export async function uploadProfilePictureAction(formData: FormData): Promise<ApiResponse<{ profilePictureUrl: string }>> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const file = formData.get('profilePic') as File | null
  if (!file || file.size === 0) {
    return { success: false, message: 'No file uploaded' }
  }

  try {
    let profilePictureUrl = ''

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, '')
    const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, '')
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, '')

    const isPlaceholder = (val: string | undefined) => {
      if (!val) return true
      const clean = val.trim().toLowerCase()
      return (
        clean.includes('your_') || 
        clean.includes('placeholder') || 
        clean.includes('***') || 
        clean === ''
      )
    }

    const isCloudinaryConfigured = 
      cloudName && !isPlaceholder(cloudName) &&
      apiKey && !isPlaceholder(apiKey) &&
      apiSecret && !isPlaceholder(apiSecret)

    if (isCloudinaryConfigured) {
      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        profilePictureUrl = await uploadToCloudinary(fileBuffer, `profile_${session.id}`)
      } catch (err) {
        console.error('Cloudinary upload failed for profile pic, falling back:', err)
      }
    }

    // Fallback if Cloudinary is not configured or failed
    if (!profilePictureUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const ext = path.extname(file.name) || '.png'
        const fileName = `profile_${session.id}_${Date.now()}${ext}`
        const filePath = path.join(uploadDir, fileName)
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        await fs.promises.writeFile(filePath, fileBuffer)
        profilePictureUrl = `/uploads/${fileName}`
      } catch (writeError) {
        console.warn('Local filesystem write failed. Falling back to data url:', writeError)
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const base64 = fileBuffer.toString('base64')
        profilePictureUrl = `data:${file.type || 'image/png'};base64,${base64}`
      }
    }

    // Update user in database
    await prisma.user.update({
      where: { id: session.id },
      data: { profilePictureUrl }
    })

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')
    
    return { success: true, message: 'Profile picture uploaded successfully', data: { profilePictureUrl } }
  } catch (error: any) {
    console.error('Error uploading profile picture:', error)
    return { success: false, message: error.message || 'Failed to upload profile picture' }
  }
}

export async function updateProfileAction(formData: FormData): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const dateOfBirthValue = String(formData.get('dateOfBirth') || '').trim()
  const addressLine = String(formData.get('addressLine') || '').trim()
  const city = String(formData.get('city') || '').trim()
  const state = String(formData.get('state') || '').trim()
  const pinCode = String(formData.get('pinCode') || '').trim()
  const dateOfBirth = dateOfBirthValue ? new Date(dateOfBirthValue) : null

  if (!name || !phone || !dateOfBirth || Number.isNaN(dateOfBirth.getTime()) || !addressLine || !city || !state || !pinCode) {
    return { success: false, message: 'Please complete all required profile fields.' }
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: {
        name,
        phone,
        dateOfBirth,
        addressLine,
        city,
        state,
        pinCode,
        profileCompleted: isProfileComplete({ name, phone, dateOfBirth, addressLine, city, state, pinCode }),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/profile')
    return { success: true, message: 'Profile updated successfully.' }
  } catch (error: any) {
    if (String(error?.code) === 'P2002') {
      return { success: false, message: 'This phone number is already linked to another account.' }
    }
    return { success: false, message: 'Failed to update profile.' }
  }
}

export async function completeOfflineTaskAction(taskId: string): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const task = await prisma.offlineTask.findUnique({ where: { id: taskId } })
    if (!task || task.userId !== session.id) return { success: false, message: 'Task not found' }
    if (task.status !== 'ASSIGNED') return { success: false, message: 'Task is already closed' }
    if (task.dueAt < new Date()) {
      await prisma.offlineTask.update({ where: { id: taskId }, data: { status: 'EXPIRED' } })
      revalidatePath('/dashboard/tasks')
      return { success: false, message: 'Task time has expired.' }
    }

    await prisma.offlineTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    revalidatePath('/dashboard/tasks')
    revalidatePath('/admin/dashboard/tasks')
    return { success: true, message: 'Task marked as completed.' }
  } catch {
    return { success: false, message: 'Failed to complete task.' }
  }
}

// ── Mark First-Time Profile Picture Popup As Seen ──────────────────────────────
export async function markProfilePicturePopupAsSeenAction(): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { hasSeenProfilePicturePopup: true }
    })
    return { success: true, message: 'Flag updated successfully' }
  } catch (e) {
    return { success: false, message: 'Failed to update flag' }
  }
}

// ── Mark All Notifications As Read ───────────────────────────────────────────────
export async function markAllNotificationsAsReadAction(): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.notification.updateMany({
      where: { userId: session.id, isRead: false },
      data: { isRead: true }
    })
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/notifications')
    return { success: true, message: 'All notifications marked as read.' }
  } catch (e) {
    return { success: false, message: 'Failed to mark notifications as read.' }
  }
}
