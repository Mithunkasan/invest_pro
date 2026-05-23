import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { Wallet, TrendingUp, Users, ArrowDownToLine } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Wallet — InvestPro' }

export default async function WalletPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
  const recentTxns = await prisma.transaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const total = (wallet?.mainBalance || 0) + (wallet?.bonusBalance || 0) + (wallet?.referralBalance || 0) + (wallet?.rewardBalance || 0) + (wallet?.levelBalance || 0) + (wallet?.shareBalance || 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>
 
      {/* Total Balance */}
      <div className="premium-card p-6 bg-gradient-to-r from-brand-900 to-brand-800 border-0">
        <p className="text-white/60 text-sm">Total Balance</p>
        <p className="text-4xl font-black text-white mt-1">{formatCurrency(total)}</p>
        <div className="flex gap-3 mt-4">
          <Link href="/dashboard/deposit"><Button size="sm" variant="glass">+ Deposit</Button></Link>
          <Link href="/dashboard/withdraw"><Button size="sm" variant="glass">↑ Withdraw</Button></Link>
        </div>
      </div>

      {/* Wallet Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Main Wallet', value: wallet?.mainBalance || 0, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Available for withdrawal and investment' },
          { label: 'Reward Wallet', value: wallet?.rewardBalance || 0, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Rewards managed by admin' },
          { label: 'Referral Wallet', value: wallet?.referralBalance || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Commission from direct referrals' },
          { label: 'Level Wallet', value: wallet?.levelBalance || 0, icon: ArrowDownToLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Commission from multi-level referrals' },
          { label: 'Share Wallet', value: wallet?.shareBalance || 0, icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10', desc: 'Income as active member TL Rank' },
          { label: 'Bonus Wallet', value: wallet?.bonusBalance || 0, icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Platform bonus credits' },
        ].map((w) => (
          <div key={w.label} className="premium-card p-5">
            <div className={`w-10 h-10 rounded-xl ${w.bg} flex items-center justify-center mb-3`}>
              <w.icon className={`w-5 h-5 ${w.color}`} />
            </div>
            <p className="text-sm text-muted-foreground">{w.label}</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(w.value)}</p>
            <p className="text-xs text-muted-foreground mt-1">{w.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Transactions</h2>
          <Link href="/dashboard/transactions"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="space-y-3">
          {recentTxns.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No transactions yet</p>
          ) : (
            recentTxns.map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{txn.description || txn.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(txn.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' ? 'text-red-500' : 'text-green-500'}`}>
                  {txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' ? '-' : '+'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
