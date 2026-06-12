import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      wallet: { 
        select: { 
          mainBalance: true,
          rewardBalance: true,
          referralBalance: true,
          levelBalance: true,
          shareBalance: true,
          bonusBalance: true,
        } 
      },
      membershipPlan: { select: { name: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const plans = await prisma.membershipPlan.findMany({
    orderBy: { price: 'asc' },
  })

  const processedUsers = users.map(u => {
    if (!u.wallet) return u
    return {
      ...u,
      wallet: {
        ...u.wallet,
        mainBalance: 
          (u.wallet.rewardBalance || 0) + 
          (u.wallet.referralBalance || 0) + 
          (u.wallet.levelBalance || 0) + 
          (u.wallet.shareBalance || 0) + 
          (u.wallet.bonusBalance || 0)
      }
    }
  })

  const stats = [
    { label: 'Total', value: processedUsers.length, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Active', value: processedUsers.filter((u: any) => u.status === 'ACTIVE').length, color: 'bg-green-500/10 text-green-500' },
    { label: 'Suspended', value: processedUsers.filter((u: any) => u.status === 'SUSPENDED').length, color: 'bg-red-500/10 text-red-500' },
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
        <UsersTable 
          users={JSON.parse(JSON.stringify(processedUsers))} 
          plans={JSON.parse(JSON.stringify(plans))}
        />
      </div>
    </div>
  )
}
