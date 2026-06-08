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

  const requests = await prisma.passwordResetRequest.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <PasswordResetClient initialRequests={requests} />
}
