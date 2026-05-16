import { prisma } from '@/lib/prisma'
import { PlansTable } from '@/components/admin/AdminTables'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function AdminPlansPage() {
  const plans = await prisma.investmentPlan.findMany({
    orderBy: { roiPercent: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Investment Plans</h1>
        <Button className="gap-2">
          <Plus size={16} /> Add Plan
        </Button>
      </div>
      <div className="premium-card p-6">
        <PlansTable data={JSON.parse(JSON.stringify(plans))} />
      </div>
    </div>
  )
}
