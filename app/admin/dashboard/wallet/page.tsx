import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/utils/formatters'
import { WalletsTable } from '@/components/admin/AdminTables'

export default async function AdminWalletPage() {
  const wallets = await prisma.wallet.findMany({
    include: { user: { select: { name: true, email: true } } },
  })

  const totals = await prisma.wallet.aggregate({
    _sum: {
      mainBalance: true,
      depositBalance: true,
      bonusBalance: true,
      referralBalance: true,
      rewardBalance: true,
      levelBalance: true,
      shareBalance: true,
    }
  })

  const totalPlatformBalance = 
    (totals._sum.depositBalance || 0) +
    (totals._sum.rewardBalance || 0) + 
    (totals._sum.referralBalance || 0) + 
    (totals._sum.levelBalance || 0) + 
    (totals._sum.shareBalance || 0) + 
    (totals._sum.bonusBalance || 0)

  const processedWallets = wallets.map(w => ({
    ...w,
    mainBalance: 
      (w.depositBalance || 0) +
      (w.rewardBalance || 0) + 
      (w.referralBalance || 0) + 
      (w.levelBalance || 0) + 
      (w.shareBalance || 0) + 
      (w.bonusBalance || 0)
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="premium-card p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Platform Funds</p>
          <p className="text-xl font-black mt-1 text-primary">{formatCurrency(totalPlatformBalance)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Main Balance</p>
          <p className="text-base font-bold mt-1 text-blue-500">{formatCurrency(totalPlatformBalance)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Deposit Funds</p>
          <p className="text-base font-bold mt-1 text-indigo-500">{formatCurrency(totals._sum.depositBalance || 0)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Reward Funds</p>
          <p className="text-base font-bold mt-1 text-yellow-500">{formatCurrency(totals._sum.rewardBalance || 0)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Referral Funds</p>
          <p className="text-base font-bold mt-1 text-purple-500">{formatCurrency(totals._sum.referralBalance || 0)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Level Funds</p>
          <p className="text-base font-bold mt-1 text-emerald-500">{formatCurrency(totals._sum.levelBalance || 0)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Share Funds</p>
          <p className="text-base font-bold mt-1 text-cyan-500">{formatCurrency(totals._sum.shareBalance || 0)}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Bonus Funds</p>
          <p className="text-base font-bold mt-1 text-orange-500">{formatCurrency(totals._sum.bonusBalance || 0)}</p>
        </div>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">User Wallet Balances</h2>
        <WalletsTable data={JSON.parse(JSON.stringify(processedWallets))} />
      </div>
    </div>
  )
}
