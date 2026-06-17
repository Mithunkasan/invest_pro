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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay updated with your account activity and alerts</p>
      </div>

      <UserNotificationsList notifications={JSON.parse(JSON.stringify(notifications))} />
    </div>
  )
}
