import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'rkadirvelan@gmail.com' },
    include: { wallet: true }
  })
  if (user) {
    console.log('Wallet:', user.wallet)
  } else {
    console.log('User not found')
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
