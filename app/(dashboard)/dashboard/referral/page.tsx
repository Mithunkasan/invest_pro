import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferralClient } from '@/components/dashboard/ReferralClient'

export default async function ReferralPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { referralCode: true } })
  if (!user) redirect('/login')

  function getUserRank(u: any): string {
    if (u.directorRank) return 'Director'
    if (u.tlRank) return 'TL Rank'
    if (u.elitePerformer) return 'Elite Performer'
    if (u.doubleStarPerformer) return 'Double Star Performer'
    if (u.starPerformer) return 'Star Performer'
    return 'Standard Member'
  }

  // 1. Fetch Direct Referrals (Level 1)
  const level1Users = await prisma.user.findMany({
    where: { referredById: session.id },
    include: {
      wallet: true,
      transactions: {
        where: {
          status: 'COMPLETED',
          type: {
            in: ['PROFIT', 'REFERRAL_BONUS', 'LEVEL_INCOME', 'REWARD', 'BONUS', 'SHARE_BONUS']
          }
        },
        select: { amount: true }
      }
    }
  })

  const directReferrals = level1Users.map(u => ({
    id: u.id,
    name: u.name,
    phone: u.phone || '—',
    level: 1,
    totalEarning: u.transactions.reduce((sum, tx) => sum + tx.amount, 0),
    walletBalance: u.wallet?.mainBalance ?? 0,
    rank: getUserRank(u)
  }))

  // 2. Fetch Indirect Referrals (Level 2 and Below)
  const indirectReferrals: any[] = []
  let currentLevelUserIds = level1Users.map(u => u.id)
  let currentLevel = 2

  while (currentLevelUserIds.length > 0) {
    const nextLevelUsers = await prisma.user.findMany({
      where: { referredById: { in: currentLevelUserIds } },
      select: {
        id: true,
        name: true,
        referredById: true,
        starPerformer: true,
        doubleStarPerformer: true,
        elitePerformer: true,
        tlRank: true,
        directorRank: true,
      }
    })

    if (nextLevelUsers.length === 0) break

    for (const u of nextLevelUsers) {
      indirectReferrals.push({
        id: u.id,
        name: u.name,
        phone: null,
        level: currentLevel,
        totalEarning: 0,
        walletBalance: 0,
        rank: getUserRank(u)
      })
    }

    currentLevelUserIds = nextLevelUsers.map(u => u.id)
    currentLevel++
  }

  const team = [...directReferrals, ...indirectReferrals]
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const referralLink = `${baseUrl}/register?ref=${user?.referralCode || ''}`

  return (
    <ReferralClient
      referralCode={user?.referralCode || ''}
      referralLink={referralLink}
      team={JSON.parse(JSON.stringify(team))}
      totalReferrals={directReferrals.length}
      referralCommissionStructure={settings?.referralCommissionStructure || '10,5,3'}
    />
  )
}
