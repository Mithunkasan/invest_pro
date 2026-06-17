import { prisma } from '@/lib/prisma'

export const BASIC_MEMBERSHIP_AMOUNT = 2500
export const BASIC_MEMBERSHIP_DAYS = 1000

export function getBasicMembershipExpiry(from: Date) {
  const expiresAt = new Date(from)
  expiresAt.setDate(expiresAt.getDate() + BASIC_MEMBERSHIP_DAYS)
  return expiresAt
}

export async function ensureBasicMembershipPlan() {
  return prisma.membershipPlan.upsert({
    where: { name: 'Basic Membership' },
    update: {
      price: BASIC_MEMBERSHIP_AMOUNT,
      durationDays: BASIC_MEMBERSHIP_DAYS,
      isActive: true,
    },
    create: {
      name: 'Basic Membership',
      price: BASIC_MEMBERSHIP_AMOUNT,
      durationDays: BASIC_MEMBERSHIP_DAYS,
      depositBonus: 0,
      referralLevel1: 10,
      referralLevel2: 0,
      referralLevel3: 0,
      withdrawalTime: '24-48 Hours',
      support: 'Basic Support',
      features: [
        'Deposit Amount: Rs. 2,500',
        'Validity: 1,000 Days',
        'Daily yield credited to wallet',
      ],
      color: '#10B981',
      isActive: true,
    },
  })
}

export async function creditDueBasicDailyYield(userId: string) {
  return // Handled uniformly in creditDueDepositYields
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
