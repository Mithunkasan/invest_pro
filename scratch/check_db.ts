import { prisma } from '../lib/prisma'

async function check() {
  const user = await prisma.user.findUnique({
    where: { id: 'cmqxe3vjs000cky04629byvc9' }
  })
  console.log('User exists?', !!user)
  if (user) {
    console.log('User details:', JSON.stringify(user, null, 2))
  }

  const txs = await prisma.transaction.findMany({
    where: {
      OR: [
        { userId: 'cmqxe3vjs000cky04629byvc9' },
        { reference: { contains: '19421578' } },
        { reference: { contains: 'TIMEWALL' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log('Transactions found:', txs.length)
  for (const tx of txs) {
    console.log(`ID: ${tx.id}, Type: ${tx.type}, Amount: ${tx.amount}, Status: ${tx.status}, WalletType: ${tx.walletType}, Reference: ${tx.reference}, Description: ${tx.description}`)
  }
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
