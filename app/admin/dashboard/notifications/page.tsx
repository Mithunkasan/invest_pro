import { prisma } from '@/lib/prisma'
import { Send, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminNotificationsTable } from '@/components/admin/AdminTables'
import { markAllAdminNotificationsAsReadAction } from '@/actions/admin'
import { getAdminPendingCounts } from '@/actions/adminCounts'

export default async function AdminNotificationsPage() {
  const [notifications, plans, pendingCounts] = await Promise.all([
    prisma.notification.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            memberType: true,
            membershipPlan: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.membershipPlan.findMany({
      orderBy: { price: 'asc' },
    }),
    getAdminPendingCounts(),
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Notifications</h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <form action={async () => {
              'use server'
              await markAllAdminNotificationsAsReadAction()
            }}>
              <Button type="submit" variant="outline" size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30">
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            </form>
          )}
          <Button size="sm">
            <Send className="w-4 h-4 mr-2" />
            Broadcast Message
          </Button>
        </div>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Notification Logs</h2>
        <AdminNotificationsTable 
          data={JSON.parse(JSON.stringify(notifications))} 
          plans={JSON.parse(JSON.stringify(plans))} 
          pendingCounts={pendingCounts ?? undefined}
        />
      </div>
    </div>
  )
}
