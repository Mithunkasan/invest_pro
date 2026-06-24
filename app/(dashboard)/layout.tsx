import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayoutClient } from './dashboard/DashboardLayoutClient'
import { creditDueBasicDailyYield } from '@/lib/basicMembership'
import { creditDueDepositYields } from '@/lib/depositYield'
import { checkAndExpireMembership } from '@/lib/membershipExpiration'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, isRead: false },
  })

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { 
      memberType: true,
      profilePictureUrl: true,
      hasSeenProfilePicturePopup: true,
      profileCompleted: true,
      name: true,
      phone: true,
      dateOfBirth: true,
      addressLine: true,
      city: true,
      state: true,
      pinCode: true,
      membershipPlanExpiresAt: true,
      membershipPlanId: true,
      membershipPlanActivatedAt: true,
    }
  })

  await creditDueBasicDailyYield(session.id)
  await creditDueDepositYields(session.id)
  await checkAndExpireMembership(session.id)

  const isMembershipActivated = Boolean(
    dbUser?.membershipPlanId && dbUser.membershipPlanActivatedAt
  )

  const kyc = isMembershipActivated
    ? await prisma.kYC.findUnique({
        where: { userId: session.id },
        select: { status: true },
      })
    : null

  const isKycApproved = !isMembershipActivated || kyc?.status === 'APPROVED'
  const isProfileComplete = Boolean(
    dbUser?.profileCompleted ||
    (
      dbUser?.name?.trim() &&
      dbUser?.phone?.trim() &&
      dbUser?.dateOfBirth &&
      dbUser?.addressLine?.trim() &&
      dbUser?.city?.trim() &&
      dbUser?.state?.trim() &&
      dbUser?.pinCode?.trim()
    )
  )

  const isMembershipExpired = dbUser?.membershipPlanExpiresAt
    ? new Date() > new Date(dbUser.membershipPlanExpiresAt)
    : false

  const approvedDepositCount = await prisma.deposit.count({
    where: { userId: session.id, status: 'APPROVED' }
  })
  const hasApprovedDeposit = approvedDepositCount > 0
  return (
    <DashboardLayoutClient
      user={{ 
        name: session.name, 
        email: session.email, 
        memberType: dbUser?.memberType || 'PREMIUM',
        profilePictureUrl: dbUser?.profilePictureUrl,
        hasSeenProfilePicturePopup: dbUser?.hasSeenProfilePicturePopup ?? false,
        profileCompleted: isProfileComplete,
        isMembershipExpired,
      }}
      notificationCount={unreadCount}
      isKycApproved={isKycApproved}
      hasApprovedDeposit={hasApprovedDeposit}
      isMembershipActivated={isMembershipActivated}
    >
      {children}
    </DashboardLayoutClient>
  )
}

