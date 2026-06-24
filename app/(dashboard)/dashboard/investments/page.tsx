import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getInvestmentPlans, getUserInvestments } from '@/actions/investment'
import { InvestmentsClient } from '@/components/dashboard/InvestmentsClient'

export const metadata: Metadata = { title: 'My Activation Plans — VR Galaxy Networks' }

export default async function InvestmentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { memberType: true }
  })
  if (user?.memberType === 'FREE') redirect('/dashboard')

  const [plans, investments] = await Promise.all([
    getInvestmentPlans(),
    getUserInvestments(),
  ])

  return (
    <InvestmentsClient
      plans={JSON.parse(JSON.stringify(plans))}
      investments={JSON.parse(JSON.stringify(investments))}
    />
  )
}
