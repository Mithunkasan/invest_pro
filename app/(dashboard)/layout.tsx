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

  return (
    <DashboardLayoutClient
      user={{ name: session.name, email: session.email }}
      notificationCount={unreadCount}
    >
      {children}
    </DashboardLayoutClient>
  )
}
