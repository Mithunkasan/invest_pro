const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const wallets = await prisma.wallet.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })

  console.log('WALLETS:', JSON.stringify(wallets, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
