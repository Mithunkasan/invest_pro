import { prisma } from '@/lib/prisma'
import { DepositsTable } from '@/components/admin/AdminTables'

export default async function AdminDepositsPage() {
  const deposits = await prisma.deposit.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deposit Requests</h1>
      <div className="premium-card p-6">
        <DepositsTable data={JSON.parse(JSON.stringify(deposits))} />
      </div>
    </div>
  )
}
