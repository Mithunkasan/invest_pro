import { prisma } from '@/lib/prisma'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminNotificationsTable } from '@/components/admin/AdminTables'

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Notifications</h1>
        <Button size="sm">
          <Send className="w-4 h-4 mr-2" />
          Broadcast Message
        </Button>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Notification Logs</h2>
        <AdminNotificationsTable data={JSON.parse(JSON.stringify(notifications))} />
      </div>
    </div>
  )
}
