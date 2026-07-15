import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  })
  console.log('SystemSettings timeWallPercentFree:', systemSettings?.timeWallPercentFree)

  const plans = await prisma.membershipPlan.findMany()
  console.log('Membership plans:')
  plans.forEach(p => {
    console.log(`- ${p.name}: ID=${p.id}, price=${p.price}, timeWallPercent=${p.timeWallPercent}`)
  })

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'rkadirvelan@gmail.com' },
        { name: 'Jeevitha V' }
      ]
    },
    include: {
      wallet: true,
      membershipPlan: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!user) {
    console.log('User not found')
  } else {
    console.log('User:', {
      id: user.id,
      name: user.name,
      email: user.email,
      memberType: user.memberType,
      membershipPlanId: user.membershipPlanId,
      membershipPlanName: user.membershipPlan?.name,
      wallet: user.wallet,
    })
    console.log('User Transactions:')
    user.transactions.forEach(t => {
      console.log(`- Type=${t.type}, Amount=${t.amount}, Status=${t.status}, WalletType=${t.walletType}, Ref=${t.reference}, Desc=${t.description}`)
    })
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
