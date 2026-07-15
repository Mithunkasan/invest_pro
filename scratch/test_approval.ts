// @ts-ignore
;(process.env as any).NODE_ENV = 'test'

import { handleTimeWallTransaction } from '../actions/admin'
import { prisma } from '../lib/prisma'

async function testApproval() {
  // Let's find the transaction we just created
  const transaction = await prisma.transaction.findFirst({
    where: { reference: { startsWith: 'TIMEWALL:mock_txn_' } },
    orderBy: { createdAt: 'desc' }
  })

  if (!transaction) {
    console.error('Mock transaction not found')
    return
  }

  console.log('Found transaction to approve:', transaction.id, 'Amount:', transaction.amount, 'Status:', transaction.status)

  // Call handleTimeWallTransaction
  const res = await handleTimeWallTransaction(transaction.id, 'APPROVE')
  console.log('Approval Action Result:', res)

  // Fetch updated data
  const updatedTx = await prisma.transaction.findUnique({
    where: { id: transaction.id }
  })
  console.log('Updated Transaction Status:', updatedTx?.status, 'Desc:', updatedTx?.description)

  const wallet = await prisma.wallet.findUnique({
    where: { userId: transaction.userId }
  })
  console.log('Updated Wallet bonusBalance:', wallet?.bonusBalance, 'mainBalance:', wallet?.mainBalance)

  const notifications = await prisma.notification.findMany({
    where: { userId: transaction.userId },
    orderBy: { createdAt: 'desc' },
    take: 2
  })
  console.log('Recent Notifications:')
  notifications.forEach(n => {
    console.log(`- Title: ${n.title}, Message: ${n.message}`)
  })
}

testApproval()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
