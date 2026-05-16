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
      bonusBalance: true,
      referralBalance: true,
    }
  })

  const totalPlatformBalance = (totals._sum.mainBalance || 0) + (totals._sum.bonusBalance || 0) + (totals._sum.referralBalance || 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total User Funds</p>
          <p className="text-2xl font-black mt-1 text-primary">{formatCurrency(totalPlatformBalance)}</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Main Wallets</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(totals._sum.mainBalance || 0)}</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Bonus Funds</p>
          <p className="text-xl font-bold mt-1 text-blue-500">{formatCurrency(totals._sum.bonusBalance || 0)}</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Referral Funds</p>
          <p className="text-xl font-bold mt-1 text-green-500">{formatCurrency(totals._sum.referralBalance || 0)}</p>
        </div>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">User Wallet Balances</h2>
        <WalletsTable data={JSON.parse(JSON.stringify(wallets))} />
      </div>
    </div>
  )
}
