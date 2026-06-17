import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { AdminLayoutClient } from './AdminLayoutClient'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin')

  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  })

  return (
    <AdminLayoutClient 
      admin={{ name: session.name, email: session.email }} 
      unreadNotificationCount={unreadCount}
    >
      {children}
    </AdminLayoutClient>
  )
}
