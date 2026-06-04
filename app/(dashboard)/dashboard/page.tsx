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
  const [wallet, investments, transactions, notifications, chartTxns] = await Promise.all([
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
    })
  ])

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
      memberType: true
    }
  })

  const stats = {
    totalInvestment: totalInvestment._sum.amount || 0,
    currentBalance: (wallet?.mainBalance || 0) + (wallet?.bonusBalance || 0) + (wallet?.referralBalance || 0) + (wallet?.rewardBalance || 0) + (wallet?.levelBalance || 0) + (wallet?.shareBalance || 0),
    totalProfit: totalProfit._sum.profit || 0,
    referralIncome: referralIncome._sum.commission || 0,
    activePlans: investments.length,
    wallet: wallet || { mainBalance: 0, bonusBalance: 0, referralBalance: 0, rewardBalance: 0, levelBalance: 0, shareBalance: 0 },
  }

  if (dbUser?.memberType === 'FREE') {
    return (
      <FreeDashboardOverview
        user={session}
        stats={stats}
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
      } as any}
      stats={stats}
      investments={JSON.parse(JSON.stringify(investments))}
      transactions={JSON.parse(JSON.stringify(transactions))}
      chartData={chartData}
    />
  )
}
