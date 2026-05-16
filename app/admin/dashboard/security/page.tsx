import { prisma } from '@/lib/prisma'
import { Lock, ShieldAlert, History } from 'lucide-react'
import { SecurityLogsTable } from '@/components/admin/AdminTables'

export default async function AdminSecurityPage() {
  const recentActivities = await prisma.user.findMany({
    where: { status: { not: 'ACTIVE' } },
    orderBy: { updatedAt: 'desc' },
    select: { name: true, email: true, status: true, updatedAt: true }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security & Audit Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-red-500">Suspended Users</h2>
          </div>
          <p className="text-3xl font-black text-red-500">{recentActivities.filter(a => a.status === 'SUSPENDED').length}</p>
          <p className="text-xs text-red-400 mt-1">Users currently blocked from platform access.</p>
        </div>
        <div className="premium-card p-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-blue-500">Security Events</h2>
          </div>
          <p className="text-3xl font-black text-blue-500">{recentActivities.length}</p>
          <p className="text-xs text-blue-400 mt-1">Total status changes and security overrides.</p>
        </div>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Recent Security Logs</h2>
        </div>
        <SecurityLogsTable data={JSON.parse(JSON.stringify(recentActivities))} />
      </div>
    </div>
  )
}
