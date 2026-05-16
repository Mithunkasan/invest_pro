import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WithdrawClient } from '@/components/dashboard/WithdrawClient'

export default async function WithdrawPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [wallet, withdrawals] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: session.id } }),
    prisma.withdrawal.findMany({ where: { userId: session.id }, orderBy: { createdAt: 'desc' } }),
  ])

  return <WithdrawClient wallet={JSON.parse(JSON.stringify(wallet))} withdrawals={JSON.parse(JSON.stringify(withdrawals))} />
}
