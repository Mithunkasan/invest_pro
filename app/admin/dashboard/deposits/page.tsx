import { prisma } from '@/lib/prisma'
import { DepositsTable } from '@/components/admin/AdminTables'

export default async function AdminDepositsPage() {
  const [deposits, pendingCount] = await Promise.all([
    prisma.deposit.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deposit.count({ where: { status: 'PENDING' } })
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deposit Requests ({pendingCount})</h1>
      <div className="premium-card p-6">
        <DepositsTable data={JSON.parse(JSON.stringify(deposits))} />
      </div>
    </div>
  )
}
