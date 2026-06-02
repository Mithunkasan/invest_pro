import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayoutClient } from './dashboard/DashboardLayoutClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, isRead: false },
  })

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { memberType: true }
  })

  const isFree = dbUser?.memberType === 'FREE'

  const kyc = isFree ? null : await prisma.kYC.findUnique({
    where: { userId: session.id },
    select: { status: true },
  })

  const isKycApproved = isFree ? true : kyc?.status === 'APPROVED'

  return (
    <DashboardLayoutClient
      user={{ name: session.name, email: session.email, memberType: dbUser?.memberType || 'PREMIUM' }}
      notificationCount={unreadCount}
      isKycApproved={isKycApproved}
    >
      {children}
    </DashboardLayoutClient>
  )
}
