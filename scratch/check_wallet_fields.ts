import { prisma } from '../lib/prisma'

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'rkadirvelan@gmail.com' },
    include: { wallet: true }
  })
  console.log('Wallet details:', JSON.stringify(user?.wallet, null, 2))
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
