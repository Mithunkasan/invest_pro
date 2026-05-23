import { prisma } from '@/lib/prisma'
import { MembershipsTable } from '@/components/admin/AdminTables'
import { Crown, Sparkles, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Membership Plans Management — Admin Console'
}

export default async function AdminMembershipsPage() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { price: 'asc' },
  })

  // Basic stats
  const activeCount = plans.filter(p => p.isActive).length
  const totalCount = plans.length
  const highestPrice = plans.length > 0 ? Math.max(...plans.map(p => p.price)) : 0

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Crown className="w-6.5 h-6.5 text-amber-500" />
          Membership Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, delete, and manage configurations for user membership tiers, pricing structures, and access levels.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5 bg-gradient-to-br from-brand-900/60 to-brand-850/40 border-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Active Tiers</p>
            <p className="text-2xl font-black text-white mt-0.5">{activeCount} / {totalCount}</p>
          </div>
        </div>
        <div className="premium-card p-5 bg-gradient-to-br from-brand-900/60 to-brand-850/40 border-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Max Tier Price</p>
            <p className="text-2xl font-black text-white mt-0.5">
              {highestPrice > 0 ? `₹${highestPrice.toLocaleString('en-IN')}` : '₹0.00'}
            </p>
          </div>
        </div>
        <div className="premium-card p-5 bg-gradient-to-br from-brand-900/60 to-brand-850/40 border-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <AlertCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Target Sync</p>
            <p className="text-xs text-brand-200 mt-1 leading-snug">Synced live with client dashboards and deposit bonus receipt triggers.</p>
          </div>
        </div>
      </div>

      {/* Main CRUD Table Container */}
      <div className="premium-card p-6">
        <MembershipsTable data={JSON.parse(JSON.stringify(plans))} />
      </div>
    </div>
  )
}
