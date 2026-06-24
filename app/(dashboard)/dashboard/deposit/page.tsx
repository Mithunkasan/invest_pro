import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DepositClient } from '@/components/dashboard/DepositClient'

export const metadata: Metadata = { title: 'Deposit Funds — VR Galaxy Networks' }

export default async function DepositPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [deposits, settings] = await Promise.all([
    prisma.deposit.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.systemSettings.findUnique({
      where: { id: 'default' }
    })
  ])

  return (
    <DepositClient 
      deposits={JSON.parse(JSON.stringify(deposits))} 
      settings={JSON.parse(JSON.stringify(settings || {}))} 
    />
  )
}
