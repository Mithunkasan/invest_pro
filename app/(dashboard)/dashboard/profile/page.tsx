import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from '@/components/dashboard/ProfileClient'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      referralCode: true,
      membershipPlanId: true,
      membershipPlan: {
        select: {
          name: true,
          price: true,
        }
      },
      membershipPlanActivatedAt: true,
      membershipPlanExpiresAt: true,
      profilePictureUrl: true,
      dateOfBirth: true,
      addressLine: true,
      city: true,
      state: true,
      pinCode: true,
    },
  })
  if (!user) redirect('/login')

  return <ProfileClient user={JSON.parse(JSON.stringify(user))} />
}
