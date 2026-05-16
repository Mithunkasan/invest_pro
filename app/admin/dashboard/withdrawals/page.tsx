import { prisma } from '@/lib/prisma'
import { WithdrawalsTable } from '@/components/admin/AdminTables'

export default async function AdminWithdrawalsPage() {
  const withdrawals = await prisma.withdrawal.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
      <div className="premium-card p-6">
        <WithdrawalsTable data={JSON.parse(JSON.stringify(withdrawals))} />
      </div>
    </div>
  )
}
