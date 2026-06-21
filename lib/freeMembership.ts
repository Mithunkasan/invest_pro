import { prisma } from '@/lib/prisma'

export async function findFreeMembershipPlan() {
  // Membership plans are administered exclusively from the Memberships page.
  // Looking up the optional Free plan must never recreate one an admin deleted.
  return prisma.membershipPlan.findUnique({
    where: { name: 'Free Membership' },
  })
}
