import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Bell, CheckCheck } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'

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

  const typeColors: Record<string, string> = {
    SUCCESS: 'border-l-green-500 bg-green-500/5',
    ERROR: 'border-l-red-500 bg-red-500/5',
    WARNING: 'border-l-yellow-500 bg-yellow-500/5',
    INFO: 'border-l-blue-500 bg-blue-500/5',
  }
  const typeIcons: Record<string, string> = { SUCCESS: '✅', ERROR: '❌', WARNING: '⚠️', INFO: 'ℹ️' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCheck className="w-4 h-4" />
          All marked as read
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`premium-card p-4 border-l-4 transition-all ${typeColors[n.type] || typeColors.INFO}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{typeIcons[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
