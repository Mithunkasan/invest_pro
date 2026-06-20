import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BonusClient } from './BonusClient'

export const metadata = {
  title: 'Admin Bonus — VR Galaxy Network',
  description: 'Manage manually sent admin bonuses.'
}

export default async function AdminBonusPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin')

  // Fetch all registered users to select from
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      memberType: true,
    },
    orderBy: { email: 'asc' },
  })

  // Fetch past admin bonuses
  const adminBonuses = await prisma.transaction.findMany({
    where: {
      reference: {
        startsWith: 'ADMIN_BONUS:'
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      }
    }
  })

  const parsedBonuses = adminBonuses.map(txn => {
    let details = { 
      sentBy: 'Admin', 
      walletName: txn.walletType + ' Wallet', 
      remark: txn.description || '', 
      userEmail: txn.user?.email || '',
      freeRestricted: false
    }

    if (txn.reference) {
      try {
        const jsonStr = txn.reference.replace('ADMIN_BONUS:', '')
        const parsed = JSON.parse(jsonStr)
        details.sentBy = parsed.sentBy || 'Admin'
        details.walletName = parsed.walletName || (txn.walletType + ' Wallet')
        details.remark = parsed.remark || txn.description || ''
        details.userEmail = parsed.userEmail || txn.user?.email || ''
        details.freeRestricted = !!parsed.freeRestricted
      } catch (e) {
        console.error("Failed to parse admin bonus reference JSON:", e)
      }
    }

    return {
      id: txn.id,
      date: txn.createdAt,
      amount: txn.amount,
      userEmail: details.userEmail,
      originalWallet: details.walletName,
      creditedWallet: txn.walletType === 'MAIN' ? 'Main Wallet' : (txn.walletType === 'BONUS' ? 'Bonus Wallet' : (txn.walletType === 'REFERRAL' ? 'Referral Wallet' : (txn.walletType === 'REWARD' ? 'Reward Wallet' : txn.walletType + ' Wallet'))),
      remark: details.remark,
      sentBy: details.sentBy,
      freeRestricted: details.freeRestricted
    }
  })

  return (
    <BonusClient 
      users={users} 
      initialBonuses={parsedBonuses} 
    />
  )
}
