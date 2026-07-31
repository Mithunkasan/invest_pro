import { prisma } from '../lib/prisma'

async function main() {
  const txs = await prisma.transaction.findMany({
    where: {
      reference: { startsWith: 'TIMEWALL:' }
    },
    include: {
      user: {
        include: {
          membershipPlan: true
        }
      }
    }
  })

  console.log('Scanning all TimeWall transactions for the bug:')
  let affectedCount = 0

  for (const tx of txs) {
    const isFree = !tx.user.membershipPlan || tx.user.membershipPlan.price === 0
    const multiplier = isFree ? 0.005 : (tx.user.membershipPlan?.timeWallPercent ?? 0.005)
    const pointsCalculated = tx.amount / multiplier

    // If pointsCalculated is small (e.g. < 100), it means it was parsed as USD value instead of points
    if (pointsCalculated > 0 && pointsCalculated < 100) {
      affectedCount++
      console.log(`AFFECTED:
  User: ${tx.user.name} (${tx.user.email})
  Transaction ID: ${tx.id}
  Reference: ${tx.reference}
  Stored Amount: ${tx.amount}
  Calculated Points: ${pointsCalculated}
  Correct Points should be: ${pointsCalculated * 10000}
  Correct Amount should be: ${tx.amount * 10000}
`)
    }
  }

  console.log(`Scan completed. Found ${affectedCount} affected transactions.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
