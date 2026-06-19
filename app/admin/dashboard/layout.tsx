import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { AdminLayoutClient } from './AdminLayoutClient'
import { prisma } from '@/lib/prisma'
import { getAdminPendingCounts } from '@/actions/adminCounts'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin')

  const [unreadCount, pendingCounts] = await Promise.all([
    prisma.notification.count({
      where: { isRead: false },
    }),
    getAdminPendingCounts(),
  ])

  return (
    <AdminLayoutClient 
      admin={{ name: session.name, email: session.email }} 
      unreadNotificationCount={unreadCount}
      pendingCounts={pendingCounts ?? undefined}
    >
      {children}
    </AdminLayoutClient>
  )
}
