import { prisma } from '@/lib/prisma'
import { Users, TrendingUp, DollarSign, Clock, Shield } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { AdminCharts } from '@/components/admin/AdminCharts'

export default async function AdminDashboard() {
  const [
    totalUsers, 
    totalInvestments, 
    pendingDeposits, 
    pendingWithdrawals, 
    pendingKYC, 
    recentUsers, 
    planDistributionRaw,
    transactionsRaw
  ] = await Promise.all([
    prisma.user.count(),
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.deposit.count({ where: { status: 'PENDING' } }),
    prisma.withdrawal.count({ where: { status: 'PENDING' } }),
    prisma.kYC.count({ where: { status: 'PENDING' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, createdAt: true, status: true } }),
    prisma.membershipPlan.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { price: 'asc' }
    }),
    prisma.transaction.findMany({
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } // This year
      },
      select: { type: true, amount: true, createdAt: true }
    })
  ])

  // Calculate real monthly data from transactions
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthIndex = new Date().getMonth()
  const displayMonths = months.slice(0, currentMonthIndex + 1)

  const monthlyData = displayMonths.map((month, idx) => {
    const monthTxns = transactionsRaw.filter(t => t.createdAt.getMonth() === idx)
    return {
      month,
      deposits: monthTxns.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0),
      withdrawals: monthTxns.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0),
      investments: monthTxns.filter(t => t.type === 'INVESTMENT').reduce((acc, t) => acc + t.amount, 0),
    }
  })

  const recentDeposits = await prisma.deposit.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const planDistribution = planDistributionRaw.map(p => ({
    name: p.name,
    value: p._count.users
  }))

  const kpiCards = [
    { title: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', suffix: '' },
    { title: 'Total AUM', value: totalInvestments._sum.amount || 0, icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-500/10', isCurrency: true },
    { title: 'Pending Deposits', value: pendingDeposits, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', suffix: '' },
    { title: 'Pending Withdrawals', value: pendingWithdrawals, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', suffix: '' },
    { title: 'Pending KYC', value: pendingKYC, icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10', suffix: '' },
    { title: 'Active Investments', value: await prisma.investment.count({ where: { status: 'ACTIVE' } }), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', suffix: '' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="premium-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {card.isCurrency ? formatCurrency(Number(card.value)) : card.value.toLocaleString('en-IN')}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminCharts monthlyData={monthlyData} planDistribution={planDistribution} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Pending Deposits ({pendingDeposits})</h2>
            <a href="/admin/dashboard/deposits" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <div className="space-y-2">
            {recentDeposits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending deposits</p>
            ) : (
              recentDeposits.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{d.user.name}</p>
                    <p className="text-xs text-muted-foreground">{d.method.replace(/_/g, ' ')} • {formatDate(d.createdAt)}</p>
                  </div>
                  <span className="text-sm font-bold text-green-500">{formatCurrency(d.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Registrations</h2>
            <a href="/admin/dashboard/users" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <div className="space-y-2">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
