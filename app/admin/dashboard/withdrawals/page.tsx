import { prisma } from '@/lib/prisma'
import { WithdrawalsTable } from '@/components/admin/AdminTables'

export default async function AdminWithdrawalsPage() {
  const [withdrawals, pendingCount] = await Promise.all([
    prisma.withdrawal.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.withdrawal.count({ where: { status: 'PENDING' } })
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdrawal Requests ({pendingCount})</h1>
      <div className="premium-card p-6">
        <WithdrawalsTable data={JSON.parse(JSON.stringify(withdrawals))} />
      </div>
    </div>
  )
}
