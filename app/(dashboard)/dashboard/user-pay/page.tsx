import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPayRequestsAction } from '@/actions/userPay'
import { UserPayClient } from './UserPayClient'

export const metadata: Metadata = {
  title: 'Send Money — VR Galaxy',
}

export default async function UserPayPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch user wallet
  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.id }
  })

  // Fetch user details to see if KYC is approved
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { 
      id: true,
      name: true,
      email: true,
      memberType: true,
      kyc: { select: { status: true } }
    }
  })

  const isFree = user?.memberType === 'FREE'
  const isKycApproved = user?.kyc?.status === 'APPROVED'

  // If not FREE and KYC not approved, redirect to dashboard or kyc page
  if (!isFree && !isKycApproved) {
    redirect('/dashboard/kyc')
  }

  // Fetch settings
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  })

  const walletBalance = wallet?.mainBalance ?? 0
  const deductionPercent = settings?.userPayDeductionPercent ?? 0.0
  const minimumAmount = settings?.userPayMinimumAmount ?? 1.0
  const maximumAmount = settings?.userPayMaximumAmount ?? 10000000.0

  const requests = await getUserPayRequestsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Money</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transfer funds instantly to another VR Galaxy user via email.
        </p>
      </div>

      <UserPayClient
        userId={session.id}
        walletBalance={walletBalance}
        deductionPercent={deductionPercent}
        minimumAmount={minimumAmount}
        maximumAmount={maximumAmount}
        initialRequests={JSON.parse(JSON.stringify(requests))}
      />
    </div>
  )
}
