'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export interface AdminPendingCounts {
  deposits: number
  withdrawals: number
  kyc: number
  gifts: number        // gift address (PENDING) + gift deposits (PENDING)
  memberships: number  // membership upgrade requests
  userPay: number
  tickets: number      // OPEN tickets
  passwordResets: number
}

/**
 * Fetches all pending/actionable request counts for the admin sidebar badges.
 * Called once per layout render — no auth needed beyond getAdminSession guard.
 */
export async function getAdminPendingCounts(): Promise<AdminPendingCounts | null> {
  try {
    const session = await getAdminSession()
    if (!session) return null

    const [
      deposits,
      withdrawals,
      kyc,
      gifts,
      giftDeposits,
      memberships,
      userPay,
      tickets,
      passwordResets,
    ] = await Promise.all([
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.kYC.count({ where: { status: 'PENDING' } }),
      prisma.gift.count({ where: { deliveryStatus: 'PENDING' } }),
      prisma.giftDeposit.count({ where: { status: 'PENDING' } }),
      prisma.membershipUpgradeRequest.count({ where: { status: 'PENDING' } }),
      prisma.userPayRequest.count({ where: { status: 'PENDING' } }),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.passwordResetRequest.count({ where: { status: 'PENDING' } }),
    ])

    return {
      deposits,
      withdrawals,
      kyc,
      gifts: gifts + giftDeposits,
      memberships,
      userPay,
      tickets,
      passwordResets,
    }
  } catch (error) {
    console.error('Error fetching admin pending counts:', error)
    return null
  }
}
