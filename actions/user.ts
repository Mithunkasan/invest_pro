'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
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

  try {
    await prisma.kYC.upsert({
      where: { userId: session.id },
      update: { aadhaarNo, panNo, status: 'PENDING' },
      create: { userId: session.id, aadhaarNo, panNo, status: 'PENDING' },
    })

    revalidatePath('/dashboard/kyc')
    return { success: true, message: 'KYC documents submitted for review' }
  } catch (error) {
    return { success: false, message: 'Failed to submit KYC' }
  }
}
