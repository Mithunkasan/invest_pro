import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KYCClient } from '@/components/dashboard/KYCClient'

export default async function KYCPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const kyc = await prisma.kYC.findUnique({ where: { userId: session.id } })
  return <KYCClient kyc={JSON.parse(JSON.stringify(kyc))} />
}
