import { prisma } from '../lib/prisma'

async function syncWalletMainBalance(tx: any, userId: string) {
  const wallet = await tx.wallet.findUnique({ where: { userId } })
  if (!wallet) return
  const newMainBalance =
    (wallet.rewardBalance || 0) +
    (wallet.referralBalance || 0) +
    (wallet.levelBalance || 0) +
    (wallet.shareBalance || 0) +
    (wallet.bonusBalance || 0) +
    (wallet.taskBalance || 0)
  await tx.wallet.update({ where: { userId }, data: { mainBalance: newMainBalance } })
}

async function run() {
  const malathiId = 'cms0cso3s0002ju04drxalhxk'
  const referrerL1Id = 'cmqxdux4j0002ky0499n4up0l' // Veerasundari M
  const referrerL2Id = 'cmqwki9k40000jy04h8gf9j5q' // Vinish MVV

  const tx1Id = 'cms4y7l0w0001jo0449vvztxh'
  const tx2Id = 'cms8evr8q0001l4041wxeovqz'

  const tx1CorrectAmount = 7.64335
  const tx2CorrectAmount = 13.12155

  const tx1OldAmount = 0.00764335
  const tx2OldAmount = 0.01312155

  const diff1 = tx1CorrectAmount - tx1OldAmount // 7.63570665
  const diff2 = tx2CorrectAmount - tx2OldAmount // 13.10842845
  const totalDiff = diff1 + diff2 // 20.7441351

  console.log('--- REVERTING CORRECTION ---')

  await prisma.$transaction(async (tx) => {
    // 1. Revert transaction amounts & descriptions
    await tx.transaction.update({
      where: { id: tx1Id },
      data: {
        amount: tx1OldAmount,
        description: 'TimeWall Reward: ₹0.01'
      }
    })
    await tx.transaction.update({
      where: { id: tx2Id },
      data: {
        amount: tx2OldAmount,
        description: 'TimeWall Reward: ₹0.01'
      }
    })

    // 2. Revert A. Malathi's wallet
    await tx.wallet.update({
      where: { userId: malathiId },
      data: {
        taskBalance: { decrement: totalDiff },
        totalEarned: { decrement: totalDiff }
      }
    })
    await syncWalletMainBalance(tx, malathiId)

    // 3. Delete referral transactions
    const refCommissionRefs = [
      `REFERRAL_COMMISSION:TIMEWALL:${tx1Id}:L1`,
      `REFERRAL_COMMISSION:TIMEWALL:${tx2Id}:L1`,
      `REFERRAL_COMMISSION:TIMEWALL:${tx1Id}:L2`,
      `REFERRAL_COMMISSION:TIMEWALL:${tx2Id}:L2`
    ]
    await tx.transaction.deleteMany({
      where: {
        reference: { in: refCommissionRefs }
      }
    })

    // 4. Revert L1 referral balance
    const totalCommL1 = 0.76 + 1.31 // 2.07
    await tx.wallet.update({
      where: { userId: referrerL1Id },
      data: {
        referralBalance: { decrement: totalCommL1 },
        totalEarned: { decrement: totalCommL1 }
      }
    })
    await syncWalletMainBalance(tx, referrerL1Id)

    // Decrement referral commission
    const refL1 = await tx.referral.findFirst({
      where: { referrerId: referrerL1Id, referredId: malathiId }
    })
    if (refL1) {
      await tx.referral.update({
        where: { id: refL1.id },
        data: { commission: { decrement: totalCommL1 } }
      })
    }

    // Delete L1 notifications
    await tx.notification.deleteMany({
      where: {
        userId: referrerL1Id,
        title: 'TimeWall Referral Commission Received',
        OR: [
          { message: { contains: '₹0.76' } },
          { message: { contains: '₹1.31' } }
        ]
      }
    })

    // 5. Revert L2 referral balance
    const totalCommL2 = 0.38 + 0.66 // 1.04
    await tx.wallet.update({
      where: { userId: referrerL2Id },
      data: {
        referralBalance: { decrement: totalCommL2 },
        totalEarned: { decrement: totalCommL2 }
      }
    })
    await syncWalletMainBalance(tx, referrerL2Id)

    // Decrement referral commission
    const refL2 = await tx.referral.findFirst({
      where: { referrerId: referrerL2Id, referredId: malathiId }
    })
    if (refL2) {
      await tx.referral.update({
        where: { id: refL2.id },
        data: { commission: { decrement: totalCommL2 } }
      })
    }

    // Delete L2 notifications
    await tx.notification.deleteMany({
      where: {
        userId: referrerL2Id,
        title: 'TimeWall Referral Commission Received',
        OR: [
          { message: { contains: '₹0.38' } },
          { message: { contains: '₹0.66' } }
        ]
      }
    })
  })

  console.log('--- REVERT COMPLETED AND VERIFIED ---')
  const finalMalathiWallet = await prisma.wallet.findUnique({ where: { userId: malathiId } })
  console.log('A. Malathi Wallet (Reverted):', finalMalathiWallet)
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
