import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'

export default async function TransactionsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction History</h1>
      <div className="premium-card p-6">
        <TransactionsTable transactions={JSON.parse(JSON.stringify(transactions))} />
      </div>
    </div>
  )
}
