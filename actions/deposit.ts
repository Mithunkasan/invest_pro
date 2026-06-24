'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse, PaginatedResponse, Deposit } from '@/types'
import { handleDeposit } from './admin'

// ── Submit Deposit ────────────────────────────────────────────────────────────
export async function submitDepositAction(
  formData: FormData
): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const amount = parseFloat(formData.get('amount')?.toString() || '0')
  const method = formData.get('method')?.toString() as 'UPI' | 'BANK_TRANSFER' | 'QR_CODE'
  const utrNumber = formData.get('utrNumber')?.toString() || ''
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: { minimumDepositAmount: true },
  })
  const minimumDepositAmount = Math.max(0, settings?.minimumDepositAmount ?? 1000)

  if (!amount || amount < minimumDepositAmount) {
    return {
      success: false,
      message: `Minimum deposit amount is ₹${minimumDepositAmount.toLocaleString('en-IN')}`,
    }
  }

  if (!utrNumber || utrNumber.length < 10) {
    return { success: false, message: 'Please provide a valid UTR number' }
  }

  await prisma.deposit.create({
    data: {
      userId: session.id,
      amount,
      method,
      utrNumber,
      status: 'PENDING',
    },
  })

  // Get current pending count
  const pendingCount = await prisma.deposit.count({
    where: { status: 'PENDING' }
  })

  // Notification
  await prisma.notification.create({
    data: {
      userId: session.id,
      title: `Deposit Request Submitted (Pending: ${pendingCount})`,
      message: `Your deposit of ₹${amount.toLocaleString('en-IN')} is under review. Total pending deposits: ${pendingCount}.`,
      type: 'INFO',
    },
  })

  revalidatePath('/dashboard/deposit')
  revalidatePath('/dashboard/transactions')
  return { success: true, message: 'Deposit submitted for review. Admin will approve within 24 hours.' }
}

export async function updateMinimumDepositAmountAction(amount: number): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'Please enter a valid minimum deposit amount.' }
  }

  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: { minimumDepositAmount: amount },
    create: { id: 'default', minimumDepositAmount: amount },
  })

  revalidatePath('/admin/dashboard/deposits')
  revalidatePath('/dashboard/deposit')
  return { success: true, message: 'Minimum deposit amount updated successfully.' }
}

// ── Get User Deposits ─────────────────────────────────────────────────────────
export async function getUserDeposits(): Promise<PaginatedResponse<Deposit>> {
  const session = await getSession()
  if (!session) return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }

  const deposits = await prisma.deposit.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  return {
    data: deposits as unknown as Deposit[],
    total: deposits.length,
    page: 1,
    pageSize: 100,
    totalPages: 1,
  }
}

// ── Admin: Get All Deposits ───────────────────────────────────────────────────
export async function getAllDeposits(status?: string) {
  const where = status && status !== 'ALL' ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : {}

  return prisma.deposit.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Admin: Approve/Reject Deposit ─────────────────────────────────────────────
export async function updateDepositStatusAction(
  depositId: string,
  status: 'APPROVED' | 'REJECTED',
  remarks?: string
): Promise<ApiResponse> {
  const action = status === 'APPROVED' ? 'APPROVE' : 'REJECT'
  return handleDeposit(depositId, action, remarks)
}
