import { prisma } from '../lib/prisma'

async function run() {
  const tx1Id = 'cms4y7l0w0001jo0449vvztxh'
  const tx2Id = 'cms8evr8q0001l4041wxeovqz'

  const tx1CorrectAmount = 76.4335  // 11759 * 0.0065
  const tx2CorrectAmount = 131.2155 // 20187 * 0.0065

  console.log('--- UPDATING TRANSACTION AMOUNTS IN DB TO CORRECT SCALED VALUES ONLY ---')

  await prisma.$transaction(async (tx) => {
    // 1. Update A. Malathi's transaction 1
    const updatedTx1 = await tx.transaction.update({
      where: { id: tx1Id },
      data: {
        amount: tx1CorrectAmount,
        description: 'TimeWall Reward: ₹76.43'
      }
    })
    console.log(`Updated transaction ${tx1Id} to amount ${updatedTx1.amount}`)

    // 2. Update A. Malathi's transaction 2
    const updatedTx2 = await tx.transaction.update({
      where: { id: tx2Id },
      data: {
        amount: tx2CorrectAmount,
        description: 'TimeWall Reward: ₹131.22'
      }
    })
    console.log(`Updated transaction ${tx2Id} to amount ${updatedTx2.amount}`)
  })

  console.log('--- VERIFYING ---')
  const malathiId = 'cms0cso3s0002ju04drxalhxk'
  const malathiWallet = await prisma.wallet.findUnique({ where: { userId: malathiId } })
  console.log('A. Malathi Wallet (Should remain unchanged):', malathiWallet)
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
