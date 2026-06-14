import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CheckCheck } from 'lucide-react'
import { UserNotificationsList } from '@/components/dashboard/UserNotificationsList'

export default async function NotificationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId: session.id, isRead: false },
    data: { isRead: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCheck className="w-4 h-4" />
          All marked as read
        </div>
      </div>

      <UserNotificationsList notifications={JSON.parse(JSON.stringify(notifications))} />
    </div>
  )
}
