import { prisma } from '@/lib/prisma'
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { AdminCharts } from '@/components/admin/AdminCharts'

export default async function AdminReportsPage() {
  const [txns, plans] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.investmentPlan.findMany({
      include: { _count: { select: { investments: true } } }
    })
  ])

  // Monthly Data Calculation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = months.map((month, idx) => {
    const monthTxns = txns.filter(t => t.createdAt.getMonth() === idx)
    return {
      month,
      deposits: monthTxns.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0),
      withdrawals: monthTxns.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0),
      investments: monthTxns.filter(t => t.type === 'INVESTMENT').reduce((acc, t) => acc + t.amount, 0),
    }
  })

  const planDistribution = plans.map(p => ({
    name: p.name,
    value: p._count.investments
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted-foreground">Total Inflow</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-black">{formatCurrency(txns.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0))}</p>
        </div>
        <div className="premium-card p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted-foreground">Total Outflow</p>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black">{formatCurrency(txns.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0))}</p>
        </div>
        <div className="premium-card p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted-foreground">Net Liquidity</p>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black">{formatCurrency(
            txns.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0) -
            txns.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0)
          )}</p>
        </div>
      </div>

      <AdminCharts monthlyData={monthlyData} planDistribution={planDistribution} />
    </div>
  )
}
