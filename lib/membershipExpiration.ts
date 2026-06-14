import { prisma } from '@/lib/prisma'

export async function checkAndExpireMembership(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { membershipPlan: true }
  })

  if (!user || !user.membershipPlanId || !user.membershipPlanActivatedAt) {
    return
  }

  const now = new Date()
  if (user.membershipPlanExpiresAt && user.membershipPlanExpiresAt <= now) {
    // Expiration has passed!
    // Move user back to the Free Membership plan
    const freePlan = await prisma.membershipPlan.findFirst({
      where: { price: 0, isActive: true }
    })

    if (freePlan) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            membershipPlanId: freePlan.id,
            memberType: 'FREE',
            membershipPlanActivatedAt: null,
            membershipPlanExpiresAt: null,
          }
        })

        await tx.notification.create({
          data: {
            userId,
            title: 'Membership Expired ⚠️',
            message: `Your membership plan has expired after its duration, and you have been moved back to the Free Membership plan.`,
            type: 'WARNING',
          }
        })
      })
    }
  }
}
