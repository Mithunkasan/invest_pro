'use client'

import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, Wallet, Users, Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { StatsCard } from './StatsCard'
import { DataTable } from './DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'
import type { UserTokenPayload } from '@/lib/auth'

interface DashboardOverviewProps {
  user: UserTokenPayload & {
    starPerformer?: boolean
    doubleStarPerformer?: boolean
    elitePerformer?: boolean
    tlRank?: boolean
    tlShareholder?: boolean
    directorRank?: boolean
    directorShareholder?: boolean
  }
  stats: {
    totalInvestment: number
    currentBalance: number
    totalProfit: number
    referralIncome: number
    activePlans: number
    wallet: {
      mainBalance: number
      bonusBalance: number
      referralBalance: number
      rewardBalance: number
      levelBalance: number
      shareBalance: number
    }
  }
  investments: Array<{ id: string; amount: number; profit: number; status: string; startDate: string; endDate: string; plan: { name: string; roiPercent: number } }>
  transactions: Array<{ id: string; type: string; amount: number; status: string; description: string | null; createdAt: string }>
  chartData: Array<{ name: string; profit: number; investment: number }>
  adminBonuses: Array<{
    id: string
    amount: number
    createdAt: string
    walletName: string
    remark: string
    sentBy: string
  }>
}

const transactionColumns = [
  { key: 'type', label: 'Type', sortable: true, render: (v: unknown) => (
    <span className="capitalize text-xs font-medium">{String(v).replace(/_/g, ' ')}</span>
  )},
  { key: 'description', label: 'Description', render: (v: unknown) => <span className="text-muted-foreground text-xs">{String(v || '—')}</span> },
  { key: 'amount', label: 'Amount', sortable: true, render: (v: unknown, row: Record<string, unknown>) => (
    <span className={`font-semibold text-sm ${row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' ? 'text-red-500' : 'text-green-500'}`}>
      {row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' ? '-' : '+'}{formatCurrency(Number(v))}
    </span>
  )},
  { key: 'status', label: 'Status', render: (v: unknown) => (
    <span className={`status-badge text-xs ${getStatusColor(String(v))}`}>{String(v)}</span>
  )},
  { key: 'createdAt', label: 'Date', sortable: true, render: (v: unknown) => (
    <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>
  )},
]

export function DashboardOverview({ user, stats, investments, transactions, chartData, adminBonuses }: DashboardOverviewProps) {
  const formatDDMMYYYY = (date: Date | string) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
              Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Here&apos;s your investment summary</p>
          </div>
          
          {/* Badge Display Row */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {user.starPerformer && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-lg shadow-sm flex items-center gap-1 border border-amber-300/40" title="Star Performer Badge">
                ⭐ Star Performer
              </span>
            )}
            {user.doubleStarPerformer && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg shadow-sm flex items-center gap-1 border border-orange-300/40" title="Double Star Performer Badge">
                ⭐⭐ Double Star
              </span>
            )}
            {user.elitePerformer && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg shadow-sm flex items-center gap-1 border border-cyan-300/40" title="Elite Performer Badge">
                💎 Elite Performer
              </span>
            )}
            {user.tlRank && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-sm flex items-center gap-1 border border-indigo-400/40" title="Team Leader Rank">
                🏆 TL Rank
              </span>
            )}
            {user.directorRank && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg shadow-sm flex items-center gap-1 border border-rose-400/40" title="Director Rank">
                👑 Director
              </span>
            )}
            {user.tlShareholder && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg shadow-sm flex items-center gap-1 border border-emerald-300/40 animate-pulse" title="1% Business Shareholder">
                📊 TL Shareholder (1%)
              </span>
            )}
            {user.directorShareholder && (
              <span className="text-[11px] font-bold px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-sm flex items-center gap-1 border border-emerald-400/40 animate-pulse" title="1% Business Shareholder">
                📊 Director Shareholder (1%)
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Main Wallet"
          value={stats.wallet.mainBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-ping" />
              <Wallet className="w-5 h-5 text-blue-500 relative z-10" />
            </div>
          }
          iconBg="bg-blue-500/10"
          delay={0}
        />
        <StatsCard
          title="Reward"
          value={stats.wallet.rewardBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-amber-500/20 animate-pulse" />
              <TrendingUp className="w-5 h-5 text-amber-500 relative z-10" />
            </div>
          }
          iconBg="bg-amber-500/10"
          delay={0.05}
        />
        <StatsCard
          title="Referral Income"
          value={stats.wallet.referralBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-purple-500/20 animate-ping" />
              <Users className="w-5 h-5 text-purple-500 relative z-10" />
            </div>
          }
          iconBg="bg-purple-500/10"
          delay={0.1}
        />
        <StatsCard
          title="Level Income"
          value={stats.wallet.levelBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse" />
              <Activity className="w-5 h-5 text-emerald-500 relative z-10 animate-pulse" />
            </div>
          }
          iconBg="bg-emerald-500/10"
          delay={0.15}
        />
        <StatsCard
          title="Share Wallet"
          value={stats.wallet.shareBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping" />
              <motion.div
                animate={{
                  rotateY: 360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "linear"
                }}
                className="relative z-10"
              >
                <DollarSign className="w-5 h-5 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
              </motion.div>
            </div>
          }
          iconBg="bg-cyan-500/15"
          delay={0.2}
        />
        <StatsCard
          title="Bonus Wallet"
          value={stats.wallet.bonusBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-orange-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
              <TrendingUp className="w-5 h-5 text-orange-500 relative z-10" />
            </div>
          }
          iconBg="bg-orange-500/10"
          delay={0.25}
        />
      </div>

      {/* Charts + Active Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 premium-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-base">Portfolio Performance</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Profit earned over time</p>
            </div>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a56db" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v)), 'Profit']}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="profit" stroke="#1a56db" fill="url(#profitGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Active Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card p-6"
        >
          <h2 className="font-semibold text-base mb-4">Active Plans ({stats.activePlans})</h2>
          <div className="space-y-4">
            {investments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active investments.<br />
                <a href="/dashboard/investments" className="text-primary hover:underline">Start investing →</a>
              </div>
            ) : (
              investments.slice(0, 3).map((inv) => {
                const progress = Math.round(
                  ((Date.now() - new Date(inv.startDate).getTime()) /
                    (new Date(inv.endDate).getTime() - new Date(inv.startDate).getTime())) * 100
                )
                return (
                  <div key={inv.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{inv.plan.name}</span>
                      <span className="text-green-500 text-xs font-semibold">+{inv.plan.roiPercent}%/day</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(inv.amount)}</span>
                      <span className="text-gold-500">{formatCurrency(inv.profit)} earned</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Wallet Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {[
          { label: 'Main Wallet', value: stats.wallet.mainBalance, color: 'from-blue-500 to-blue-600', icon: '💼' },
          { label: 'Reward Wallet', value: stats.wallet.rewardBalance, color: 'from-amber-500 to-amber-600', icon: '🎁' },
          { label: 'Referral Wallet', value: stats.wallet.referralBalance, color: 'from-purple-500 to-purple-600', icon: '👥' },
          { label: 'Level Wallet', value: stats.wallet.levelBalance, color: 'from-emerald-500 to-emerald-600', icon: '📈' },
          { label: 'Share Wallet', value: stats.wallet.shareBalance, color: 'from-cyan-500 to-cyan-600', icon: '📊' },
          { label: 'Bonus Wallet', value: stats.wallet.bonusBalance, color: 'from-orange-500 to-orange-600', icon: '⭐' },
        ].map((w) => (
          <div key={w.label} className={`rounded-2xl bg-gradient-to-br ${w.color} p-4 text-white shadow-md hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/80 font-medium">{w.label}</span>
              <span className="text-lg">{w.icon}</span>
            </div>
            <p className="text-lg font-black tracking-tight">{formatCurrency(w.value)}</p>
          </div>
        ))}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="premium-card p-6"
      >
        <h2 className="font-semibold text-base mb-4">Recent Transactions</h2>
        <DataTable
          data={transactions as Record<string, unknown>[]}
          columns={transactionColumns as Parameters<typeof DataTable>[0]['columns']}
          rowKey="id"
          searchable={false}
          pageSize={10}
          emptyMessage="No transactions yet"
        />
      </motion.div>

      {/* Admin Bonus History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="premium-card p-6 bg-card/45 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden"
      >
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2 text-white">
          🎁 Admin Bonus History
        </h2>
        <div className="overflow-x-auto no-scrollbar">
          {adminBonuses.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No admin bonuses received yet</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Wallet</th>
                  <th className="py-3 px-4">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-medium">
                {adminBonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      {formatDDMMYYYY(bonus.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-green-400 whitespace-nowrap">
                      +{formatCurrency(bonus.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-white/80 font-semibold">
                      {bonus.walletName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-white/80">
                      {bonus.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
