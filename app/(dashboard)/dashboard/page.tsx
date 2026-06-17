import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { FreeDashboardOverview } from '@/components/dashboard/FreeDashboardOverview'

export const metadata: Metadata = {
  title: 'Dashboard — InvestPro',
  description: 'View your investment portfolio, wallet balance, and recent transactions.',
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch all dashboard data in parallel
  const [wallet, investments, transactions, notifications, chartTxns, dbAdminBonuses, completedTxns] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: session.id } }),
    prisma.investment.findMany({
      where: { userId: session.id, status: 'ACTIVE' },
      include: { plan: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.notification.findMany({
      where: { userId: session.id, isRead: false },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { 
        userId: session.id, 
        status: 'COMPLETED',
        createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } 
      },
      select: { type: true, amount: true, createdAt: true }
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.id,
        type: 'BONUS',
        reference: {
          startsWith: 'ADMIN_BONUS:'
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transaction.groupBy({
      by: ['walletType'],
      where: {
        userId: session.id,
        status: 'COMPLETED',
        amount: { gt: 0 }
      },
      _sum: {
        amount: true
      }
    })
  ])

  let dbWallet = wallet
  if (dbWallet) {
    const expectedMain = 
      (dbWallet.rewardBalance || 0) +
      (dbWallet.referralBalance || 0) +
      (dbWallet.levelBalance || 0) +
      (dbWallet.shareBalance || 0) +
      (dbWallet.bonusBalance || 0)
    
    if (dbWallet.mainBalance !== expectedMain) {
      dbWallet = await prisma.wallet.update({
        where: { id: dbWallet.id },
        data: { mainBalance: expectedMain }
      })
    }
  }

  // Calculate cumulative earnings from completed credit transactions
  let totalRewardEarned = 0
  let totalReferralEarned = 0
  let totalShareEarned = 0
  let totalBonusEarned = 0

  completedTxns.forEach(group => {
    const sum = group._sum.amount || 0
    if (group.walletType === 'REWARD') {
      totalRewardEarned = sum
    } else if (group.walletType === 'REFERRAL' || group.walletType === 'LEVEL') {
      totalReferralEarned += sum
    } else if (group.walletType === 'SHARE') {
      totalShareEarned = sum
    } else if (group.walletType === 'BONUS') {
      totalBonusEarned = sum
    }
  })

  // Calculate monthly profit/investment for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthIndex = new Date().getMonth()
  const displayMonths = months.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1)

  const chartData = displayMonths.map((month, idx) => {
    const monthIndex = months.indexOf(month)
    const monthTxns = chartTxns.filter(t => t.createdAt.getMonth() === monthIndex)
    return {
      name: month,
      profit: monthTxns.filter(t => t.type === 'PROFIT' || t.type === 'REFERRAL_BONUS').reduce((acc, t) => acc + t.amount, 0),
      investment: monthTxns.filter(t => t.type === 'INVESTMENT').reduce((acc, t) => acc + t.amount, 0),
    }
  })

  const totalInvestment = await prisma.investment.aggregate({
    where: { userId: session.id },
    _sum: { amount: true },
  })

  const totalProfit = await prisma.investment.aggregate({
    where: { userId: session.id },
    _sum: { profit: true },
  })

  const referralIncome = await prisma.referral.aggregate({
    where: { referrerId: session.id },
    _sum: { commission: true },
  })

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      starPerformer: true,
      doubleStarPerformer: true,
      elitePerformer: true,
      tlRank: true,
      tlShareholder: true,
      directorRank: true,
      directorShareholder: true,
      memberType: true,
      membershipPlan: {
        select: {
          name: true,
          price: true,
        }
      },
      membershipPlanActivatedAt: true,
      membershipPlanExpiresAt: true,
    }
  })

  const adminBonuses = dbAdminBonuses.map(txn => {
    let details = { sentBy: 'Admin', walletName: txn.walletType + ' Wallet', remark: txn.description || '' }
    if (txn.reference) {
      try {
        const jsonStr = txn.reference.replace('ADMIN_BONUS:', '')
        const parsed = JSON.parse(jsonStr)
        details.sentBy = parsed.sentBy || 'Admin'
        details.walletName = parsed.walletName || (txn.walletType + ' Wallet')
        details.remark = parsed.remark || txn.description || ''
      } catch (e) {
        console.error("Failed to parse admin bonus metadata:", e)
      }
    }
    return {
      id: txn.id,
      amount: txn.amount,
      createdAt: txn.createdAt.toISOString(),
      walletName: details.walletName,
      remark: details.remark,
      sentBy: details.sentBy
    }
  })

  const stats = {
    totalInvestment: totalInvestment._sum.amount || 0,
    currentBalance: dbWallet?.mainBalance || 0,
    totalProfit: totalProfit._sum.profit || 0,
    referralIncome: referralIncome._sum.commission || 0,
    activePlans: investments.length,
    wallet: dbWallet || { mainBalance: 0, depositBalance: 0, bonusBalance: 0, referralBalance: 0, rewardBalance: 0, levelBalance: 0, shareBalance: 0 },
    totalRewardEarned,
    totalReferralEarned,
    totalShareEarned,
    totalBonusEarned,
  }

  if (dbUser?.memberType === 'FREE') {
    return (
      <FreeDashboardOverview
        user={session}
        stats={stats}
        adminBonuses={adminBonuses}
      />
    )
  }

  return (
    <DashboardOverview
      user={{
        ...session,
        starPerformer: dbUser?.starPerformer || false,
        doubleStarPerformer: dbUser?.doubleStarPerformer || false,
        elitePerformer: dbUser?.elitePerformer || false,
        tlRank: dbUser?.tlRank || false,
        tlShareholder: dbUser?.tlShareholder || false,
        directorRank: dbUser?.directorRank || false,
        directorShareholder: dbUser?.directorShareholder || false,
        membershipPlan: dbUser?.membershipPlan,
        membershipPlanActivatedAt: dbUser?.membershipPlanActivatedAt ? dbUser.membershipPlanActivatedAt.toISOString() : null,
        membershipPlanExpiresAt: dbUser?.membershipPlanExpiresAt ? dbUser.membershipPlanExpiresAt.toISOString() : null,
      } as any}
      stats={stats}
      investments={JSON.parse(JSON.stringify(investments))}
      transactions={JSON.parse(JSON.stringify(transactions))}
      chartData={chartData}
      adminBonuses={adminBonuses}
    />
  )
}
