import { prisma } from '@/lib/prisma'
import { GitBranch, DollarSign, Users } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { ReferralsTable } from '@/components/admin/AdminTables'

export default async function AdminReferralsPage() {
  const referrals = await prisma.referral.findMany({
    include: {
      referrer: { select: { name: true, email: true } },
      referred: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = await prisma.referral.aggregate({
    _sum: { commission: true },
    _count: { id: true }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referral Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary"><GitBranch className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{stats._count.id}</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Commission Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(stats._sum.commission || 0)}</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Referrers</p>
              <p className="text-2xl font-bold">{new Set(referrals.map(r => r.referrerId)).size}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Recent Referrals</h2>
        <ReferralsTable data={JSON.parse(JSON.stringify(referrals))} />
      </div>
    </div>
  )
}
