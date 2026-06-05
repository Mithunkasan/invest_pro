const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'anzil@gmail.com' },
    include: {
      wallet: true,
      deposits: true,
      transactions: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  console.log('USER:', JSON.stringify(user, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
