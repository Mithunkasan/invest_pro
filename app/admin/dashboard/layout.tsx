import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { AdminLayoutClient } from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin')

  return (
    <AdminLayoutClient admin={{ name: session.name, email: session.email }}>
      {children}
    </AdminLayoutClient>
  )
}
