import { prisma } from '../lib/prisma'

async function find() {
  const txs = await prisma.transaction.findMany({
    where: {
      OR: [
        { reference: { contains: '19421578' } },
        { description: { contains: '19421578' } }
      ]
    }
  })

  console.log(`Found ${txs.length} transactions for '19421578':`)
  for (const tx of txs) {
    console.log(JSON.stringify(tx, null, 2))
  }
}

find()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
