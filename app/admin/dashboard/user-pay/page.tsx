import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllUserPayRequestsAction } from '@/actions/userPay'
import { prisma } from '@/lib/prisma'
import { UserPayRequestsTable } from './UserPayRequestsTable'
import { UserPaySettingsForm } from './UserPaySettingsForm'

export const metadata: Metadata = {
  title: 'Send Money History — Admin Console',
}

export default async function AdminUserPayPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin/login')

  const [requests, settings] = await Promise.all([
    getAllUserPayRequestsAction(),
    prisma.systemSettings.findUnique({ where: { id: 'default' } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Money History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all peer-to-peer wallet transfers completed on the platform.
        </p>
      </div>

      <UserPaySettingsForm
        initialSettings={{
          deductionPercent: settings?.userPayDeductionPercent ?? 0.0,
          minimumAmount: settings?.userPayMinimumAmount ?? 1.0,
          maximumAmount: settings?.userPayMaximumAmount ?? 10000000.0,
        }}
      />

      <div className="premium-card p-6">
        <UserPayRequestsTable initialRequests={JSON.parse(JSON.stringify(requests))} />
      </div>
    </div>
  )
}
