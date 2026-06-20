import { prisma } from '@/lib/prisma'

export async function ensureFreeMembershipPlan() {
  return prisma.membershipPlan.upsert({
    where: { name: 'Free Membership' },
    update: {},
    create: {
      name: 'Free Membership',
      price: 0,
      durationDays: -1,
      depositBonus: 0,
      referralLevel1: 10,
      referralLevel2: 0,
      referralLevel3: 0,
      withdrawalTime: '24-48 Hours',
      support: 'Standard Email',
      features: [
        'Standard 1x Referral Commission (10%)',
        'Access to Standard Activation Plans',
        'Full Wallet Overview & Reports',
        'Basic Account Support (2-3 business days)',
      ],
      color: '#3B82F6',
      isActive: true,
    },
  })
}
