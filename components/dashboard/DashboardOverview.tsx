'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, Wallet, Users, Activity, Award, Crown
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { StatsCard } from './StatsCard'
import { DataTable } from './DataTable'
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '@/utils/formatters'
import { getMembershipDisplayName } from '@/utils/membershipDisplay'
import type { UserTokenPayload } from '@/lib/auth'
import { ModalPortal } from '@/components/common/ModalPortal'

interface DashboardOverviewProps {
  user: UserTokenPayload & {
    starPerformer?: boolean
    doubleStarPerformer?: boolean
    elitePerformer?: boolean
    tlRank?: boolean
    tlShareholder?: boolean
    directorRank?: boolean
    directorShareholder?: boolean
    membershipPlan?: {
      name: string
      price: number
    } | null
    membershipPlanActivatedAt?: string | null
    membershipPlanExpiresAt?: string | null
  }
  stats: {
    totalInvestment: number
    currentBalance: number
    totalProfit: number
    referralIncome: number
    activePlans: number
    wallet: {
      mainBalance: number
      depositBalance: number
      bonusBalance: number
      referralBalance: number
      rewardBalance: number
      levelBalance: number
      shareBalance: number
      totalEarned: number
    }
    totalRewardEarned: number
    totalReferralEarned: number
    totalShareEarned: number
    totalBonusEarned: number
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
  { key: 'type', label: 'Type', sortable: true, render: (v: unknown) => {
    let label = String(v).replace(/_/g, ' ')
    if (v === 'INVESTMENT') label = 'SMART HYBRID DIGITAL EARNING'
    if (v === 'USER_PAY_SENT') label = 'MONEY SENT'
    if (v === 'USER_PAY_RECEIVED') label = 'MONEY RECEIVED'
    return <span className="capitalize text-xs font-medium">{label.toLowerCase()}</span>
  }},
  { key: 'description', label: 'Description', render: (v: unknown) => <span className="text-muted-foreground text-xs">{String(v || '—').replace(/\bROI\b/gi, 'Earning Platform').replace(/\bInvestment\b/gi, 'Earning Platform')}</span> },
  { key: 'amount', label: 'Amount', sortable: true, render: (v: unknown, row: Record<string, unknown>) => (
    <span className={`font-semibold text-sm ${row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' || row.type === 'USER_PAY_SENT' ? 'text-red-500' : 'text-green-500'}`}>
      {row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' || row.type === 'USER_PAY_SENT' ? '-' : '+'}{formatCurrency(Number(v))}
    </span>
  )},
  { key: 'status', label: 'Status', render: (v: unknown) => (
    <span className={`status-badge text-xs ${getStatusColor(String(v))}`}>{String(v)}</span>
  )},
  { key: 'createdAt', label: 'Date', sortable: true, render: (v: unknown) => (
    <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>
  )},
]

export function DashboardOverview({ user, stats, transactions, chartData, adminBonuses }: DashboardOverviewProps) {
  const [showTotalModal, setShowTotalModal] = useState(false)

  const formatDDMMYYYY = (date: Date | string) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  const grandTotalEarnings = stats.wallet.totalEarned || 0

  const isExpired = user.membershipPlanExpiresAt 
    ? new Date() > new Date(user.membershipPlanExpiresAt) 
    : false

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
              Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Here&apos;s your Smart Hybrid Digital Earning summary</p>
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

      {/* Active Membership Details Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-4 sm:p-5 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 shadow-xl rounded-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-24 h-24 text-amber-500" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className={`p-3 rounded-xl ${isExpired ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
              <Crown className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-white flex flex-wrap items-center gap-2">
                {getMembershipDisplayName(user.membershipPlan?.name)}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isExpired
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {isExpired ? 'Expired' : 'Active'}
                </span>
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Plan Amount: <span className="font-semibold text-white">{formatCurrency(user.membershipPlan?.price || 0)}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3 text-sm border-t md:border-t-0 md:border-l border-slate-700/60 pt-4 md:pt-0 md:pl-8">
            <div>
              <span className="text-xs text-slate-400 block">Activation Date</span>
              <span className="font-semibold text-white mt-0.5 block whitespace-nowrap">
                {user.membershipPlanActivatedAt ? formatDateTime(user.membershipPlanActivatedAt) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Expiry Date</span>
              <span className="font-semibold text-white mt-0.5 block whitespace-nowrap">
                {user.membershipPlanExpiresAt ? formatDate(user.membershipPlanExpiresAt) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-7 gap-3 sm:gap-4 items-stretch">
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
          title="Deposit"
          value={stats.wallet.depositBalance}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-indigo-500/20 animate-pulse" />
              <DollarSign className="w-5 h-5 text-indigo-500 relative z-10" />
            </div>
          }
          iconBg="bg-indigo-500/10"
          delay={0.05}
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
          delay={0.1}
        />
        <StatsCard
          title="Referral Income"
          value={(stats.wallet.referralBalance || 0) + (stats.wallet.levelBalance || 0)}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-purple-500/20 animate-ping" />
              <Users className="w-5 h-5 text-purple-500 relative z-10" />
            </div>
          }
          iconBg="bg-purple-500/10"
          delay={0.15}
        />
        <StatsCard
          title="Total Wallet"
          value={grandTotalEarnings}
          icon={
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse" />
              <Award className="w-5 h-5 text-emerald-500 relative z-10 animate-pulse" />
            </div>
          }
          iconBg="bg-emerald-500/10"
          delay={0.2}
          onClick={() => setShowTotalModal(true)}
          className="border-emerald-500/30 hover:border-emerald-400"
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
          delay={0.25}
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
          delay={0.3}
        />
      </div>

      {/* Cumulative Earnings Dialog Modal */}
      {showTotalModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
            onClick={() => setShowTotalModal(false)}
          >
            <div
              className="p-6 w-full max-w-md bg-card/95 border border-border rounded-2xl shadow-2xl relative space-y-4 text-left cursor-default animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                  <span className="text-xl">📊</span> Cumulative Earnings
                </h3>
                <button
                  onClick={() => setShowTotalModal(false)}
                  className="text-muted-foreground hover:text-white transition-colors text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                These are your cumulative lifetime earnings from all sources, unaffected by withdrawals.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Reward Income Earned</p>
                    <p className="text-base font-bold text-amber-400 mt-0.5">{formatCurrency(stats.totalRewardEarned)}</p>
                  </div>
                  <span className="text-xl">🎁</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Referral Income Earned</p>
                    <p className="text-xs text-muted-foreground italic">(includes Direct & Level Commission)</p>
                    <p className="text-base font-bold text-purple-400 mt-0.5">{formatCurrency(stats.totalReferralEarned)}</p>
                  </div>
                  <span className="text-xl">👥</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Share Wallet Income Earned</p>
                    <p className="text-base font-bold text-cyan-400 mt-0.5">{formatCurrency(stats.totalShareEarned)}</p>
                  </div>
                  <span className="text-xl">📊</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Bonus Wallet Income Earned</p>
                    <p className="text-base font-bold text-orange-400 mt-0.5">{formatCurrency(stats.totalBonusEarned)}</p>
                  </div>
                  <span className="text-xl">⭐</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-1 text-[11px] text-muted-foreground">
                <div className="flex justify-between font-bold text-white/90 text-sm">
                  <span>Grand Total Cumulative Earnings:</span>
                  <span className="text-primary font-black">{formatCurrency(grandTotalEarnings)}</span>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Portfolio Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card min-w-0 p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-base">Portfolio Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Profit earned over time</p>
          </div>
          <Activity className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="h-[220px] sm:h-[280px] lg:h-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -12, right: 4 }}>
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
        </div>
      </motion.div>

      {/* Wallet Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4"
      >
        {[
          { label: 'Main Wallet', value: stats.wallet.mainBalance, color: 'from-blue-500 to-blue-600', icon: '💼' },
          { label: 'Deposit Wallet', value: stats.wallet.depositBalance, color: 'from-indigo-500 to-indigo-600', icon: '💰' },
          { label: 'Reward Wallet', value: stats.wallet.rewardBalance, color: 'from-amber-500 to-amber-600', icon: '🎁' },
          { label: 'Referral Wallet', value: (stats.wallet.referralBalance || 0) + (stats.wallet.levelBalance || 0), color: 'from-purple-500 to-purple-600', icon: '👥' },
          { label: 'Share Wallet', value: stats.wallet.shareBalance, color: 'from-cyan-500 to-cyan-600', icon: '📊' },
          { label: 'Bonus Wallet', value: stats.wallet.bonusBalance, color: 'from-orange-500 to-orange-600', icon: '⭐' },
        ].map((w) => (
          <div key={w.label} className={`rounded-2xl bg-gradient-to-br ${w.color} p-4 text-white shadow-md hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/80 font-medium">{w.label}</span>
              <span className="text-lg">{w.icon}</span>
            </div>
            <p className="text-lg font-black tracking-tight whitespace-nowrap tabular-nums">{formatCurrency(w.value)}</p>
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
