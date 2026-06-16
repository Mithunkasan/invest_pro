import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllUserPayRequestsAction } from '@/actions/userPay'
import { UserPayRequestsTable } from './UserPayRequestsTable'

export const metadata: Metadata = {
  title: 'User Pay Requests — Admin Console',
}

export default async function AdminUserPayPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin/login')

  const requests = await getAllUserPayRequestsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Pay Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve or reject peer-to-peer wallet transfer requests.
        </p>
      </div>

      <div className="premium-card p-6">
        <UserPayRequestsTable initialRequests={JSON.parse(JSON.stringify(requests))} />
      </div>
    </div>
  )
}
