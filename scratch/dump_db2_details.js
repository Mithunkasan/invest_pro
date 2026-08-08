const { PrismaClient } = require('@prisma/client')

const prisma2 = new PrismaClient({
  datasources: { db: { url: "postgresql://neondb_owner:npg_9l1gWVorqvMn@ep-small-dream-aoj60358.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" } }
})

async function main() {
  const pandiRef = 'TIMEWALL:wd788a5d-4503-4a66-b216-3c852e45e40f'
  
  // Find Pandi313's transaction in DB2
  const pandiTx = await prisma2.transaction.findFirst({
    where: { reference: pandiRef }
  })
  
  if (!pandiTx) {
    console.error('Pandi313 transaction not found')
    return
  }

  // Get all TimeWall transactions in DB2 after Pandi313's
  const twTxs = await prisma2.transaction.findMany({
    where: {
      reference: { startsWith: 'TIMEWALL:' },
      createdAt: { gt: pandiTx.createdAt }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          membershipPlanId: true,
          membershipPlan: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Dumping details for ${twTxs.length} transactions:`)
  for (const tx of twTxs) {
    console.log(`\n============================================================`)
    console.log(`MAIN TRANSACTION:`)
    console.log(`ID: ${tx.id}`)
    console.log(`User: ${tx.user.name} (${tx.user.email}) [ID: ${tx.userId}]`)
    console.log(`Amount: ${tx.amount}`)
    console.log(`Reference: ${tx.reference}`)
    console.log(`CreatedAt: ${tx.createdAt.toISOString()}`)
    console.log(`Plan ID: ${tx.user.membershipPlanId}, Plan Name: ${tx.user.membershipPlan?.name || 'FREE'}`)
    console.log(`Plan Multiplier: ${tx.user.membershipPlan?.timeWallPercent || 0.005}`)

    // Query referral commissions for this transaction
    const commissions = await prisma2.transaction.findMany({
      where: {
        reference: { startsWith: `REFERRAL_COMMISSION:TIMEWALL:${tx.id}:` }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { reference: 'asc' }
    })
    console.log(`REFERRAL COMMISSIONS (${commissions.length}):`)
    commissions.forEach(c => {
      console.log(`- ID: ${c.id}, Ref: ${c.reference}`)
      console.log(`  To User: ${c.user.name} (${c.user.email}) [ID: ${c.userId}]`)
      console.log(`  Amount: ${c.amount}`)
      console.log(`  Description: ${c.description}`)
    })
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma2.$disconnect())
