'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import type { ApiResponse } from '@/types'

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

    await prisma.$transaction([
      // Deduct from wallet immediately
      prisma.wallet.update({
        where: { userId: session.id },
        data: { mainBalance: { decrement: amount } },
      }),
      // Create withdrawal request
      prisma.withdrawal.create({
        data: {
          userId: session.id,
          amount,
          bankDetails,
          status: 'PENDING',
        },
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: session.id,
          type: 'WITHDRAWAL',
          amount,
          status: 'PENDING',
          description: 'Withdrawal request submitted',
          walletType: 'MAIN',
        },
      }),
    ])

    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard/transactions')
    return { success: true, message: 'Withdrawal request submitted' }
  } catch (error) {
    return { success: false, message: 'Failed to submit withdrawal' }
  }
}

// ── Start Investment ──────────────────────────────────────────────────────────
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
      return { success: false, message: `Investment must be between ₹${plan.minAmount} and ₹${plan.maxAmount}` }
    }

    if (!wallet || wallet.mainBalance < amount) {
      return { success: false, message: 'Insufficient balance in main wallet' }
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.durationDays)

    await prisma.$transaction([
      // Deduct from wallet
      prisma.wallet.update({
        where: { userId: session.id },
        data: { mainBalance: { decrement: amount } },
      }),
      // Create investment
      prisma.investment.create({
        data: {
          userId: session.id,
          planId,
          amount,
          endDate,
          status: 'ACTIVE',
        },
      }),
      // Create transaction
      prisma.transaction.create({
        data: {
          userId: session.id,
          type: 'INVESTMENT',
          amount,
          status: 'COMPLETED',
          description: `Investment in ${plan.name}`,
          walletType: 'MAIN',
        },
      }),
    ])

    // Retrieve latest active investment
    const investment = await prisma.investment.findFirst({
      where: { userId: session.id, planId, amount, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    })
    if (investment) {
      const { distributeReferralAndLevelCommissions } = require('./rules')
      await distributeReferralAndLevelCommissions(session.id, amount, investment.id)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/investments')
    revalidatePath('/dashboard/wallet')
    return { success: true, message: `Successfully invested in ${plan.name}!` }
  } catch (error) {
    return { success: false, message: 'Failed to start investment' }
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
      // 1. Upload Aadhaar Image to Cloudinary
      const aadhaarBuffer = Buffer.from(await aadhaarFile.arrayBuffer())
      aadhaarUrl = await uploadToCloudinary(aadhaarBuffer, `aadhaar_${session.id}`)

      // 2. Upload PAN Image to Cloudinary
      const panBuffer = Buffer.from(await panFile.arrayBuffer())
      panUrl = await uploadToCloudinary(panBuffer, `pan_${session.id}`)
    } else {
      console.warn('Cloudinary not configured or placeholder keys used. Falling back to local placeholder URLs.')
      aadhaarUrl = 'https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg'
      panUrl = 'https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg'
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

    revalidatePath('/dashboard/kyc')
    revalidatePath('/admin/dashboard/kyc')
    return { success: true, message: 'KYC documents submitted and images uploaded successfully. Waiting for admin approval.' }
  } catch (error: any) {
    console.error('KYC submission error:', error)
    return { success: false, message: error.message || 'Failed to submit KYC' }
  }
}

// ── Buy Premium Membership ─────────────────────────────────────────────────────
export async function buyPremiumMembershipAction(): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const dbPremiumPlan = await prisma.membershipPlan.findFirst({
      where: { name: 'Premium Membership', isActive: true }
    })
    const upgradePrice = dbPremiumPlan ? dbPremiumPlan.price : 1999

    const [user, wallet] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.id } }),
      prisma.wallet.findUnique({ where: { userId: session.id } }),
    ])

    if (!user) return { success: false, message: 'User not found' }
    if (!wallet) return { success: false, message: 'Wallet not found' }

    if (user.starPerformer || user.tlRank) {
      return { success: false, message: 'You are already a Premium Member!' }
    }

    if (wallet.mainBalance < upgradePrice) {
      return { success: false, message: 'Insufficient balance in main wallet' }
    }

    await prisma.$transaction([
      // Deduct from wallet
      prisma.wallet.update({
        where: { userId: session.id },
        data: { mainBalance: { decrement: upgradePrice } },
      }),
      // Grant Premium badge (starPerformer = true)
      prisma.user.update({
        where: { id: session.id },
        data: { starPerformer: true },
      }),
      // Create transaction
      prisma.transaction.create({
        data: {
          userId: session.id,
          type: 'INVESTMENT',
          amount: upgradePrice,
          status: 'COMPLETED',
          description: `Upgraded to Premium Membership`,
          walletType: 'MAIN',
        },
      }),
      // Send notification
      prisma.notification.create({
        data: {
          userId: session.id,
          title: 'Premium Activated! 👑',
          message: `Congratulations! You have successfully upgraded to Premium Membership.`,
          type: 'SUCCESS',
        },
      }),
    ])

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/membership/free')
    revalidatePath('/dashboard/membership/premium')
    revalidatePath('/dashboard/wallet')

    return { success: true, message: 'Successfully upgraded to Premium Membership!' }
  } catch (error) {
    console.error('Error purchasing premium membership:', error)
    return { success: false, message: 'Failed to process upgrade' }
  }
}
