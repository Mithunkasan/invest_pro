import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'rkadirvelan@gmail.com' },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (!user) {
    console.error('User not found')
    return
  }

  console.log('Last Transaction:', JSON.stringify(user.transactions[0], null, 2))
  console.log('Last Notification:', JSON.stringify(user.notifications[0], null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
