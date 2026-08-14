import { prisma } from '@/lib/prisma'

export async function findFreeMembershipPlan() {
  // Membership plans are administered exclusively from the Memberships page.
  // Looking up the optional Free plan must never recreate one an admin deleted.
  const plan = await prisma.membershipPlan.findUnique({
    where: { name: 'Free Membership' },
  })
  if (plan) return plan
  return prisma.membershipPlan.findFirst({
    where: { name: 'Standard' },
  })
}
