import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllUserPayRequestsAction } from '@/actions/userPay'
import { UserPayRequestsTable } from './UserPayRequestsTable'

export const metadata: Metadata = {
  title: 'Send Money History — Admin Console',
}

export default async function AdminUserPayPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin/login')

  const requests = await getAllUserPayRequestsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Money History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all peer-to-peer wallet transfers completed on the platform.
        </p>
      </div>

      <div className="premium-card p-6">
        <UserPayRequestsTable initialRequests={JSON.parse(JSON.stringify(requests))} />
      </div>
    </div>
  )
}
