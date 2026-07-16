import { prisma } from '../lib/prisma'

async function list() {
  const txs = await prisma.transaction.findMany({
    where: {
      reference: { startsWith: 'TIMEWALL:' }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Found ${txs.length} TimeWall transactions:`)
  for (const tx of txs) {
    console.log(`ID: ${tx.id}, Amount: ${tx.amount}, Status: ${tx.status}, Reference: ${tx.reference}, CreatedAt: ${tx.createdAt.toISOString()}, Desc: ${tx.description}`)
  }
}

list()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
