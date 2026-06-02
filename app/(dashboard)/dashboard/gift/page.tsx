import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GiftFormClient } from './GiftFormClient'

export const metadata: Metadata = {
  title: 'Premium Gift Section — InvestPro',
  description: 'Manage and track your welcome gift shipment.',
}

export default async function GiftPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Check database if user is premium
  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { memberType: true }
  })

  if (!dbUser || dbUser.memberType !== 'PREMIUM') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <span className="text-5xl mb-4">💎</span>
        <h1 className="text-2xl font-black text-white">Premium Feature Only</h1>
        <p className="text-muted-foreground text-sm max-w-md mt-2">
          The Welcome Gift Section is exclusive to our Premium Members. Register or upgrade to a Premium plan to unlock this reward!
        </p>
      </div>
    )
  }

  // Fetch submitted gift details if any
  const gift = await prisma.gift.findUnique({
    where: { userId: session.id }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          🎁 Premium Welcome Gift
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete your details to claim your free exclusive InvestPro premium welcome kit.
        </p>
      </div>

      <GiftFormClient gift={JSON.parse(JSON.stringify(gift))} />
    </div>
  )
}
