import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferralClient } from '@/components/dashboard/ReferralClient'

export default async function ReferralPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { referralCode: true, name: true } })
  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.id },
    include: { referred: { select: { name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const totalCommission = referrals.reduce((s: number, r: any) => s + r.commission, 0)

  return (
    <ReferralClient
      referralCode={user?.referralCode || ''}
      referrals={JSON.parse(JSON.stringify(referrals))}
      totalCommission={totalCommission}
      totalReferrals={referrals.length}
    />
  )
}
