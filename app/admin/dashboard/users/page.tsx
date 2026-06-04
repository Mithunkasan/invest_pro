import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      wallet: { select: { mainBalance: true } },
      membershipPlan: { select: { name: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = [
    { label: 'Total', value: users.length, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Active', value: users.filter((u: any) => u.status === 'ACTIVE').length, color: 'bg-green-500/10 text-green-500' },
    { label: 'Suspended', value: users.filter((u: any) => u.status === 'SUSPENDED').length, color: 'bg-red-500/10 text-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          {stats.map((s: any) => (
            <span key={s.label} className={`px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>{s.label}: {s.value}</span>
          ))}
        </div>
      </div>
      <div className="premium-card p-6">
        <UsersTable users={JSON.parse(JSON.stringify(users))} />
      </div>
    </div>
  )
}
