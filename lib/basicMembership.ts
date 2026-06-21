import { prisma } from '@/lib/prisma'

export const BASIC_MEMBERSHIP_AMOUNT = 2500
export const BASIC_MEMBERSHIP_DAYS = 1000

export function getBasicMembershipExpiry(from: Date) {
  const expiresAt = new Date(from)
  expiresAt.setDate(expiresAt.getDate() + BASIC_MEMBERSHIP_DAYS)
  return expiresAt
}

export async function findBasicMembershipPlan() {
  // Do not recreate a plan removed by an administrator.
  return prisma.membershipPlan.findUnique({
    where: { name: 'Basic Membership' },
  })
}

export async function creditDueBasicDailyYield(userId: string) {
  return // Handled uniformly in creditDueDepositYields
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
