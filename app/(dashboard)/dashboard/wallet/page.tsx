import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { Wallet, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Wallet — VR Galaxy Network' }

export default async function WalletPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { memberType: true }
  })
  const isFree = user?.memberType === 'FREE'

  let wallet = await prisma.wallet.findUnique({ where: { userId: session.id } })
  if (wallet) {
    const expectedMain = 
      (wallet.rewardBalance || 0) +
      (wallet.referralBalance || 0) +
      (wallet.levelBalance || 0) +
      (wallet.shareBalance || 0) +
      (wallet.bonusBalance || 0)
    
    if (wallet.mainBalance !== expectedMain) {
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { mainBalance: expectedMain }
      })
    }
  }
  const recentTxns = await prisma.transaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const total = wallet?.mainBalance || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>
 
      {/* Main Wallet (Total Balance) Card */}
      <div className="premium-card p-6 bg-gradient-to-br from-brand-900 via-brand-850 to-indigo-950 border-0 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-white/70 text-sm font-semibold uppercase tracking-wider">
          <Wallet className="w-4 h-4 text-blue-400" /> Main Wallet (Total Balance)
        </div>
        <p className="text-4xl font-black text-white mt-1.5">{formatCurrency(total)}</p>
        
        <div className="flex gap-3 mt-4">
          {!isFree && <Link href="/dashboard/deposit"><Button size="sm" variant="glass">+ Deposit</Button></Link>}
          <Link href="/dashboard/withdraw"><Button size="sm" variant="glass">↑ Withdraw</Button></Link>
        </div>

        {/* Sub-wallets breakdown list below the balance */}
        {!isFree && <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Sub-Wallets Breakdown</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium">Deposit Wallet</p>
              <p className="text-sm font-bold text-blue-400 mt-0.5">{formatCurrency(wallet?.depositBalance || 0)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium">Reward Wallet</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{formatCurrency(wallet?.rewardBalance || 0)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium">Referral Income Wallet</p>
              <p className="text-sm font-bold text-purple-400 mt-0.5">{formatCurrency((wallet?.referralBalance || 0) + (wallet?.levelBalance || 0))}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium">Share Wallet</p>
              <p className="text-sm font-bold text-cyan-400 mt-0.5">{formatCurrency(wallet?.shareBalance || 0)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium">Bonus Wallet</p>
              <p className="text-sm font-bold text-orange-400 mt-0.5">{formatCurrency(wallet?.bonusBalance || 0)}</p>
            </div>
          </div>
        </div>}
      </div>
 
      {/* Wallet Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Main Wallet', value: wallet?.mainBalance || 0, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Combined total of all wallets', show: true },
          { label: 'Deposit Wallet', value: wallet?.depositBalance || 0, icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'User deposited amount', show: !isFree },
          { label: 'Reward Wallet', value: wallet?.rewardBalance || 0, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Claimed reward balances', show: !isFree },
          { label: 'Referral Income Wallet', value: (wallet?.referralBalance || 0) + (wallet?.levelBalance || 0), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Commission from direct and multi-level referrals', show: !isFree },
          { label: 'Share Wallet', value: wallet?.shareBalance || 0, icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10', desc: 'Income as active member TL/Director Rank', show: !isFree },
          { label: 'Bonus Wallet', value: wallet?.bonusBalance || 0, icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Platform bonus credits', show: !isFree },
        ].filter(w => w.show).map((w) => (
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' || txn.type === 'USER_PAY_SENT' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' || txn.type === 'USER_PAY_SENT' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{txn.description || txn.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(txn.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' || txn.type === 'USER_PAY_SENT' ? 'text-red-500' : 'text-green-500'}`}>
                  {txn.type === 'WITHDRAWAL' || txn.type === 'INVESTMENT' || txn.type === 'USER_PAY_SENT' ? '-' : '+'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
