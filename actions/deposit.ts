'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { ApiResponse, PaginatedResponse, Deposit } from '@/types'

// ── Submit Deposit ────────────────────────────────────────────────────────────
export async function submitDepositAction(
  formData: FormData
): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const amount = parseFloat(formData.get('amount')?.toString() || '0')
  const method = formData.get('method')?.toString() as 'UPI' | 'BANK_TRANSFER' | 'QR_CODE'
  const utrNumber = formData.get('utrNumber')?.toString() || ''

  if (!amount || amount < 1000) {
    return { success: false, message: 'Minimum deposit amount is ₹1,000' }
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

  // Notification
  await prisma.notification.create({
    data: {
      userId: session.id,
      title: 'Deposit Request Submitted',
      message: `Your deposit of ₹${amount.toLocaleString('en-IN')} is under review.`,
      type: 'INFO',
    },
  })

  revalidatePath('/dashboard/deposit')
  revalidatePath('/dashboard/transactions')
  return { success: true, message: 'Deposit submitted for review. Admin will approve within 24 hours.' }
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
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } })
  if (!deposit) return { success: false, message: 'Deposit not found' }

  await prisma.deposit.update({
    where: { id: depositId },
    data: { status, remarks },
  })

  if (status === 'APPROVED') {
    // Credit wallet
    await prisma.wallet.upsert({
      where: { userId: deposit.userId },
      update: { mainBalance: { increment: deposit.amount } },
      create: { userId: deposit.userId, mainBalance: deposit.amount },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: deposit.userId,
        type: 'DEPOSIT',
        amount: deposit.amount,
        status: 'COMPLETED',
        reference: deposit.utrNumber || undefined,
        description: `Deposit approved - ${deposit.method}`,
        walletType: 'MAIN',
      },
    })

    // Notify user
    await prisma.notification.create({
      data: {
        userId: deposit.userId,
        title: 'Deposit Approved ✅',
        message: `Your deposit of ₹${deposit.amount.toLocaleString('en-IN')} has been approved.`,
        type: 'SUCCESS',
      },
    })
  } else {
    await prisma.notification.create({
      data: {
        userId: deposit.userId,
        title: 'Deposit Rejected',
        message: `Your deposit of ₹${deposit.amount.toLocaleString('en-IN')} was rejected. Reason: ${remarks || 'Contact support'}`,
        type: 'ERROR',
      },
    })
  }

  revalidatePath('/admin/dashboard/deposits')
  return { success: true, message: `Deposit ${status.toLowerCase()} successfully` }
}
