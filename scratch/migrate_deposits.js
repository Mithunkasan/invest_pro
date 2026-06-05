const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const wallets = await prisma.wallet.findMany()

  console.log(`Migrating ${wallets.length} wallets...`)

  for (const wallet of wallets) {
    const subSum = 
      (wallet.rewardBalance || 0) +
      (wallet.referralBalance || 0) +
      (wallet.levelBalance || 0) +
      (wallet.shareBalance || 0) +
      (wallet.bonusBalance || 0)

    let depositBalance = wallet.mainBalance - subSum
    if (depositBalance < 0) {
      depositBalance = 0
    }

    // Recalculate main balance as the sum including depositBalance
    const newMainBalance = depositBalance + subSum

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        depositBalance: depositBalance,
        mainBalance: newMainBalance
      }
    })

    console.log(`Wallet for User ${wallet.userId}: Calculated Deposit = ₹${depositBalance}, New Main = ₹${newMainBalance}`)
  }

  console.log('Migration completed!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
