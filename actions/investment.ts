'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// ── Get Investment Plans ───────────────────────────────────────────────────────
export async function getInvestmentPlans() {
  return prisma.investmentPlan.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { minAmount: 'asc' },
  })
}

// ── Create Investment ─────────────────────────────────────────────────────────
export async function createInvestmentAction(
  planId: string,
  amount: number
): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } })
  if (!plan || plan.status !== 'ACTIVE') {
    return { success: false, message: 'Investment plan not available' }
  }

  if (amount < plan.minAmount || amount > plan.maxAmount) {
    return {
      success: false,
      message: `Investment amount must be between ₹${plan.minAmount.toLocaleString('en-IN')} and ₹${plan.maxAmount.toLocaleString('en-IN')}`,
    }
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
  if (!wallet || wallet.mainBalance < amount) {
    return { success: false, message: 'Insufficient wallet balance. Please deposit funds first.' }
  }

  // Deduct from wallet
  await prisma.wallet.update({
    where: { userId: session.id },
    data: { mainBalance: { decrement: amount } },
  })

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + plan.durationDays)

  // Create investment
  const investment = await prisma.investment.create({
    data: {
      userId: session.id,
      planId,
      amount,
      status: 'ACTIVE',
      endDate,
    },
  })

  // Transaction record
  await prisma.transaction.create({
    data: {
      userId: session.id,
      type: 'INVESTMENT',
      amount,
      status: 'COMPLETED',
      reference: investment.id,
      description: `${plan.name} Investment`,
      walletType: 'MAIN',
    },
  })

  // Notification
  await prisma.notification.create({
    data: {
      userId: session.id,
      title: 'Investment Active 🚀',
      message: `Your ₹${amount.toLocaleString('en-IN')} investment in ${plan.name} is now active. Expected return: ₹${(amount * (plan.roiPercent / 100) * plan.durationDays).toLocaleString('en-IN')}`,
      type: 'SUCCESS',
    },
  })

  // Trigger referral and level commissions distribution
  const { distributeReferralAndLevelCommissions } = require('./rules')
  await distributeReferralAndLevelCommissions(session.id, amount, investment.id)

  revalidatePath('/dashboard/investments')
  return { success: true, message: 'Investment created successfully!' }
}

// ── Get User Investments ──────────────────────────────────────────────────────
export async function getUserInvestments() {
  const session = await getSession()
  if (!session) return []

  return prisma.investment.findMany({
    where: { userId: session.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Admin: Get All Investments ────────────────────────────────────────────────
export async function getAllInvestments() {
  return prisma.investment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      plan: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Admin: Create/Update Plan ─────────────────────────────────────────────────
export async function upsertInvestmentPlanAction(
  data: {
    id?: string
    name: string
    description: string
    minAmount: number
    maxAmount: number
    roiPercent: number
    durationDays: number
    features: string[]
    color?: string
  }
): Promise<ApiResponse> {
  if (data.id) {
    await prisma.investmentPlan.update({
      where: { id: data.id },
      data,
    })
  } else {
    await prisma.investmentPlan.create({ data })
  }

  revalidatePath('/admin/dashboard/plans')
  revalidatePath('/plans')
  return { success: true, message: data.id ? 'Plan updated' : 'Plan created' }
}

// ── Admin: Delete Plan ────────────────────────────────────────────────────────
export async function deleteInvestmentPlanAction(planId: string): Promise<ApiResponse> {
  await prisma.investmentPlan.update({
    where: { id: planId },
    data: { status: 'INACTIVE' },
  })
  revalidatePath('/admin/dashboard/plans')
  return { success: true, message: 'Plan deactivated' }
}
