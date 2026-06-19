import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PasswordResetClient from './PasswordResetClient'

export const metadata = {
  title: 'Password Resets — Admin Portal',
}

export default async function PasswordResetsPage() {
  const admin = await getAdminSession()
  if (!admin) redirect('/admin/login')

  const [requests, pendingCount] = await Promise.all([
    prisma.passwordResetRequest.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.passwordResetRequest.count({ where: { status: 'PENDING' } })
  ])

  return <PasswordResetClient initialRequests={requests} pendingCount={pendingCount} />
}
