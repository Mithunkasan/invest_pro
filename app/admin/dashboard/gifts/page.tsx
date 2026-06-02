import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GiftsAdminClient } from './GiftsAdminClient'

export const metadata: Metadata = {
  title: 'Premium Gifts Management — Admin Console',
  description: 'Manage courier dispatches and parcel shipping tracking details.',
}

export default async function AdminGiftsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    redirect('/admin')
  }

  // Fetch all registered gift address submissions
  const gifts = await prisma.gift.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          🎁 Premium Welcome Gifts Portal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review premium member addresses, configure dispatch courier details, and manage parcel delivery statuses.
        </p>
      </div>

      <GiftsAdminClient gifts={JSON.parse(JSON.stringify(gifts))} />
    </div>
  )
}
