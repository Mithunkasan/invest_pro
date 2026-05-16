import { prisma } from '@/lib/prisma'
import { KycTable } from '@/components/admin/AdminTables'

export default async function AdminKycPage() {
  const kycList = await prisma.kYC.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">KYC Submissions</h1>
      <div className="premium-card p-6">
        <KycTable data={JSON.parse(JSON.stringify(kycList))} />
      </div>
    </div>
  )
}
