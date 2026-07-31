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

  const tx1CorrectAmount = 76.4335
  const tx2CorrectAmount = 131.2155

  const tx1OldAmount = 0.00764335
  const tx2OldAmount = 0.01312155

  const diff1 = tx1CorrectAmount - tx1OldAmount // 76.42585665
  const diff2 = tx2CorrectAmount - tx2OldAmount // 131.20237845
  const totalDiff = diff1 + diff2 // 207.6282351

  console.log('--- CREDITING TASK WALLET AND COMMISSIONS ---')

  await prisma.$transaction(async (tx) => {
    // 1. Update A. Malathi's wallet (taskBalance & totalEarned incremented by totalDiff)
    await tx.wallet.update({
      where: { userId: malathiId },
      data: {
        taskBalance: { increment: totalDiff },
        totalEarned: { increment: totalDiff }
      }
    })
    await syncWalletMainBalance(tx, malathiId)
    console.log(`Updated A. Malathi's wallet balances (taskBalance & totalEarned incremented by ${totalDiff})`)

    // 2. Referrer Level 1 (Veerasundari M): commission 10%
    const commL1_tx1 = 0.76
    const commL1_tx2 = 1.31
    const totalCommL1 = commL1_tx1 + commL1_tx2

    // Create L1 Transaction 1
    await tx.transaction.create({
      data: {
        userId: referrerL1Id,
        type: 'REFERRAL_BONUS',
        amount: commL1_tx1,
        status: 'COMPLETED',
        walletType: 'REFERRAL',
        reference: `REFERRAL_COMMISSION:TIMEWALL:${tx1Id}:L1`,
        description: `Upline Level 1 (10%) commission from A.Malathi's TimeWall earnings`
      }
    })
    // Create L1 Transaction 2
    await tx.transaction.create({
      data: {
        userId: referrerL1Id,
        type: 'REFERRAL_BONUS',
        amount: commL1_tx2,
        status: 'COMPLETED',
        walletType: 'REFERRAL',
        reference: `REFERRAL_COMMISSION:TIMEWALL:${tx2Id}:L1`,
        description: `Upline Level 1 (10%) commission from A.Malathi's TimeWall earnings`
      }
    })

    // Upsert Referral record for L1
    const refL1 = await tx.referral.findFirst({
      where: { referrerId: referrerL1Id, referredId: malathiId }
    })
    if (refL1) {
      await tx.referral.update({
        where: { id: refL1.id },
        data: { commission: { increment: totalCommL1 } }
      })
    } else {
      await tx.referral.create({
        data: {
          referrerId: referrerL1Id,
          referredId: malathiId,
          commission: totalCommL1,
          level: 1
        }
      })
    }

    // Update L1 wallet
    await tx.wallet.update({
      where: { userId: referrerL1Id },
      data: {
        referralBalance: { increment: totalCommL1 },
        totalEarned: { increment: totalCommL1 }
      }
    })
    await syncWalletMainBalance(tx, referrerL1Id)
    console.log(`Credited Level 1 referrer (Veerasundari M) with total commission ${totalCommL1}`)

    // Create notifications for L1
    await tx.notification.create({
      data: {
        userId: referrerL1Id,
        title: `TimeWall Referral Commission Received`,
        message: `You earned ₹${commL1_tx1.toFixed(2)} (10%) from A.Malathi's TimeWall earnings. It was credited to your Referral Wallet.`,
        type: 'SUCCESS'
      }
    })
    await tx.notification.create({
      data: {
        userId: referrerL1Id,
        title: `TimeWall Referral Commission Received`,
        message: `You earned ₹${commL1_tx2.toFixed(2)} (10%) from A.Malathi's TimeWall earnings. It was credited to your Referral Wallet.`,
        type: 'SUCCESS'
      }
    })

    // 3. Referrer Level 2 (Vinish MVV): commission 5%
    const commL2_tx1 = 0.38
    const commL2_tx2 = 0.66
    const totalCommL2 = commL2_tx1 + commL2_tx2

    // Create L2 Transaction 1
    await tx.transaction.create({
      data: {
        userId: referrerL2Id,
        type: 'REFERRAL_BONUS',
        amount: commL2_tx1,
        status: 'COMPLETED',
        walletType: 'REFERRAL',
        reference: `REFERRAL_COMMISSION:TIMEWALL:${tx1Id}:L2`,
        description: `Upline Level 2 (5%) commission from A.Malathi's TimeWall earnings`
      }
    })
    // Create L2 Transaction 2
    await tx.transaction.create({
      data: {
        userId: referrerL2Id,
        type: 'REFERRAL_BONUS',
        amount: commL2_tx2,
        status: 'COMPLETED',
        walletType: 'REFERRAL',
        reference: `REFERRAL_COMMISSION:TIMEWALL:${tx2Id}:L2`,
        description: `Upline Level 2 (5%) commission from A.Malathi's TimeWall earnings`
      }
    })

    // Upsert Referral record for L2
    const refL2 = await tx.referral.findFirst({
      where: { referrerId: referrerL2Id, referredId: malathiId }
    })
    if (refL2) {
      await tx.referral.update({
        where: { id: refL2.id },
        data: { commission: { increment: totalCommL2 } }
      })
    } else {
      await tx.referral.create({
        data: {
          referrerId: referrerL2Id,
          referredId: malathiId,
          commission: totalCommL2,
          level: 2
        }
      })
    }

    // Update L2 wallet
    await tx.wallet.update({
      where: { userId: referrerL2Id },
      data: {
        referralBalance: { increment: totalCommL2 },
        totalEarned: { increment: totalCommL2 }
      }
    })
    await syncWalletMainBalance(tx, referrerL2Id)
    console.log(`Credited Level 2 referrer (Vinish MVV) with total commission ${totalCommL2}`)

    // Create notifications for L2
    await tx.notification.create({
      data: {
        userId: referrerL2Id,
        title: `TimeWall Referral Commission Received`,
        message: `You earned ₹${commL2_tx1.toFixed(2)} (5%) from A.Malathi's TimeWall earnings. It was credited to your Referral Wallet.`,
        type: 'SUCCESS'
      }
    })
    await tx.notification.create({
      data: {
        userId: referrerL2Id,
        title: `TimeWall Referral Commission Received`,
        message: `You earned ₹${commL2_tx2.toFixed(2)} (5%) from A.Malathi's TimeWall earnings. It was credited to your Referral Wallet.`,
        type: 'SUCCESS'
      }
    })
  })

  console.log('--- VERIFYING ---')
  const finalMalathiWallet = await prisma.wallet.findUnique({ where: { userId: malathiId } })
  const finalL1Wallet = await prisma.wallet.findUnique({ where: { userId: referrerL1Id } })
  const finalL2Wallet = await prisma.wallet.findUnique({ where: { userId: referrerL2Id } })

  console.log('A. Malathi Wallet AFTER correction:', finalMalathiWallet)
  console.log('Veerasundari M Wallet AFTER correction:', finalL1Wallet)
  console.log('Vinish MVV Wallet AFTER correction:', finalL2Wallet)
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
