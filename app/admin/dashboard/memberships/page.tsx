import { prisma } from '@/lib/prisma'
import { MembershipsDashboard } from '@/components/admin/MembershipsDashboard'

export const metadata = {
  title: 'Membership Plans Management — Admin Console'
}

export default async function AdminMembershipsPage() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { price: 'asc' },
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      memberType: true,
      membershipPlanId: true,
      membershipPlan: { select: { name: true, color: true } },
      basicMembershipAmount: true,
      basicMembershipActivatedAt: true,
      basicMembershipExpiresAt: true,
      lastDailyYieldAt: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <MembershipsDashboard 
      plans={JSON.parse(JSON.stringify(plans))} 
      users={JSON.parse(JSON.stringify(users))} 
    />
  )
}
