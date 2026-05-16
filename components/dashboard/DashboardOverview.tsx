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
  user: UserTokenPayload
  stats: {
    totalInvestment: number
    currentBalance: number
    totalProfit: number
    referralIncome: number
    activePlans: number
    wallet: { mainBalance: number; bonusBalance: number; referralBalance: number }
  }
  investments: Array<{ id: string; amount: number; profit: number; status: string; startDate: string; endDate: string; plan: { name: string; roiPercent: number } }>
  transactions: Array<{ id: string; type: string; amount: number; status: string; description: string | null; createdAt: string }>
  chartData: Array<{ name: string; profit: number; investment: number }>
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

export function DashboardOverview({ user, stats, investments, transactions, chartData }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s your investment summary</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Investment"
          value={stats.totalInvestment}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
          change={12.5}
          delay={0}
        />
        <StatsCard
          title="Current Balance"
          value={stats.currentBalance}
          icon={<Wallet className="w-5 h-5 text-green-500" />}
          iconBg="bg-green-500/10"
          change={8.2}
          delay={0.1}
        />
        <StatsCard
          title="Total Profit"
          value={stats.totalProfit}
          icon={<TrendingUp className="w-5 h-5 text-gold-500" />}
          iconBg="bg-gold-500/10"
          change={15.3}
          delay={0.2}
        />
        <StatsCard
          title="Referral Income"
          value={stats.referralIncome}
          icon={<Users className="w-5 h-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
          change={5.1}
          delay={0.3}
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Main Wallet', value: stats.wallet.mainBalance, color: 'from-blue-500 to-blue-600', icon: '💼' },
          { label: 'Bonus Wallet', value: stats.wallet.bonusBalance, color: 'from-green-500 to-green-600', icon: '🎁' },
          { label: 'Referral Wallet', value: stats.wallet.referralBalance, color: 'from-purple-500 to-purple-600', icon: '👥' },
        ].map((w) => (
          <div key={w.label} className={`rounded-2xl bg-gradient-to-br ${w.color} p-5 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">{w.label}</span>
              <span className="text-xl">{w.icon}</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(w.value)}</p>
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
    </div>
  )
}
